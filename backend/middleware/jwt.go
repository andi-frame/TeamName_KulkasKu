package middleware

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type JWTUserData struct {
	ID    string
	Email string
	Name  string
}

func JWTMiddleware() gin.HandlerFunc {
	jwtSecret := os.Getenv("JWT_SECRET")

	return func(c *gin.Context) {
		tokenStr, err := c.Cookie("token")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token not found"})
			return
		}

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (any, error) {
			return []byte(jwtSecret), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		user := JWTUserData{
			ID:    claims["id"].(string),
			Email: claims["email"].(string),
			Name:  claims["name"].(string),
		}

		c.Set("user", user)
		c.Next()
	}
}
