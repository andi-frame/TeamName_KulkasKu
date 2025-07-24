package controller

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
)

type AuthService struct {
	oauthConfig *oauth2.Config
	jwtSecret   string
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
	}
}

// Me Handler
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
	c.SetCookie(
		"token",
		tokenStr,
		3600*24,
		"/",
		"",
		true,
		true, // httpOnly
	)

	// TODO: adjust in prod
	c.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000/")
}

// Logout Handler
func (authService *AuthService) LogoutHandler(c *gin.Context) {
	// Just confirmation, nothing changed in the db because this is stateless
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
