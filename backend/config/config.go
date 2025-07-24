package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
	JWTSecret    string

	PythonServiceURL string
	MaxFileSize      int64

	// Environment configuration
	Environment    string
	IsProduction   bool
	FrontendURL    string
	CookieDomain   string
	CookieSecure   bool
	AllowedOrigins []string
}

func LoadConfig() Config {
	maxFileSize, _ := strconv.ParseInt(os.Getenv("MAX_FILE_SIZE"), 10, 64)
	if maxFileSize == 0 {
		maxFileSize = 10 * 1024 * 1024 // 10MB default
	}

	environment := os.Getenv("ENVIRONMENT")
	if environment == "" {
		environment = "development"
	}

	isProduction := environment == "production"

	// Set frontend URL
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		if isProduction {
			frontendURL = "https://kulkasku.vercel.app"
		} else {
			frontendURL = "http://localhost:3000"
		}
	}

	// Set cookie domain
	cookieDomain := os.Getenv("COOKIE_DOMAIN")
	if cookieDomain == "" && isProduction {
		cookieDomain = ".kirisame.jp.net"
	}

	// Set allowed origins
	allowedOriginsEnv := os.Getenv("ALLOWED_ORIGINS")
	var allowedOrigins []string
	if allowedOriginsEnv != "" {
		allowedOrigins = strings.Split(allowedOriginsEnv, ",")
		for i, origin := range allowedOrigins {
			allowedOrigins[i] = strings.TrimSpace(origin)
		}
	} else {
		if isProduction {
			allowedOrigins = []string{"https://kulkasku.vercel.app"}
		} else {
			allowedOrigins = []string{"http://localhost:3000"}
		}
	}

	// Set redirect URL
	redirectURL := os.Getenv("GOOGLE_REDIRECT_URL")
	if redirectURL == "" {
		if isProduction {
			redirectURL = "https://os80w4wwsggwosc4o88k0csc.kirisame.jp.net/auth/callback"
		} else {
			redirectURL = "http://localhost:5000/auth/callback"
		}
	}

	return Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  redirectURL,
		JWTSecret:    os.Getenv("JWT_SECRET"),

		PythonServiceURL: os.Getenv("PYTHON_SERVICE_URL"),
		MaxFileSize:      maxFileSize,

		Environment:    environment,
		IsProduction:   isProduction,
		FrontendURL:    frontendURL,
		CookieDomain:   cookieDomain,
		CookieSecure:   isProduction,
		AllowedOrigins: allowedOrigins,
	}
}
