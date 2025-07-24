package controller

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
)

type AuthService struct {
	oauthConfig *oauth2.Config
	jwtSecret   string
	config      config.Config
}

func NewAuthService(cfg config.Config) *AuthService {
	return &AuthService{
		oauthConfig: &oauth2.Config{
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
			RedirectURL:  cfg.RedirectURL,
			Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
			Endpoint:     google.Endpoint,
		},
		jwtSecret: cfg.JWTSecret,
		config:    cfg,
	}
}

// Me Handler - call current user data
func (authService *AuthService) MeHandler(c *gin.Context) {
	tokenStr, err := c.Cookie("token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token not found"})
		return
	}

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (any, error) {
		return []byte(authService.jwtSecret), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    claims["id"],
		"email": claims["email"],
		"name":  claims["name"],
	})
}

// Profile
func GetUserProfile(c *gin.Context) {
	// Get user ID from context
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID, ok := userIDValue.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Fetch user
	var user schema.User
	if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Fetch user preference
	var preference schema.UserPreference
	if err := database.DB.Preload("PreferredTags").
		Preload("PreferredCategories").
		Preload("PreferredIngredients").
		Preload("DislikedIngredients").
		Where("user_id = ?", userID).First(&preference).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"profile":     user,
			"preferences": nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"profile":     user,
		"preferences": preference,
	})
}

// Login Handler
func (authService *AuthService) LoginHandler(c *gin.Context) {
	url := authService.oauthConfig.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// Callback Handler
func (authService *AuthService) CallbackHandler(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "code not found"})
		return
	}

	token, err := authService.oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token exchange failed"})
		return
	}

	client := authService.oauthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user info"})
		return
	}
	defer resp.Body.Close()

	var userInfo schema.UserAuthType
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode user info"})
		return
	}

	// Update user account if exist, insert if not exist
	user, err := repository.UpsertUserAccount(userInfo)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	// Issue JWT
	tokenStr, err := authService.createJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create JWT"})
		return
	}

	// Set JWT as HTTP-only cookie
	sameSiteMode := http.SameSiteLaxMode
	if authService.config.IsProduction {
		sameSiteMode = http.SameSiteNoneMode
	}
	c.SetSameSite(sameSiteMode)
	c.SetCookie(
		"token",
		tokenStr,
		3600*24, // 24 hours
		"/",
		authService.config.CookieDomain,
		authService.config.CookieSecure,
		true, // httpOnly
	)

	c.Redirect(http.StatusTemporaryRedirect, authService.config.FrontendURL)
}

// Logout Handler
func (authService *AuthService) LogoutHandler(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	if authService.config.IsProduction {
		c.SetSameSite(http.SameSiteNoneMode)
	}

	c.SetCookie(
		"token",
		"",
		-1,
		"/",
		authService.config.CookieDomain,
		authService.config.CookieSecure,
		true,
	)

	c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}

// HELPER
func (a *AuthService) createJWT(user *schema.User) (string, error) {
	claims := jwt.MapClaims{
		"id":    user.ID,
		"email": user.Email,
		"name":  user.Name,
		"exp":   time.Now().Add(24 * time.Hour).Unix(), // 1 Day // TODO: move to .env
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(a.jwtSecret))
}
