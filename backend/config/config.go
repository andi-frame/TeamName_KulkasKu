package config

import (
	"os"
	"strconv"
)

type Config struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
	JWTSecret    string

	PythonServiceURL string
	MaxFileSize      int64
}

func LoadConfig() Config {
	maxFileSize, _ := strconv.ParseInt(os.Getenv("MAX_FILE_SIZE"), 10, 64)
	if maxFileSize == 0 {
		maxFileSize = 10 * 1024 * 1024 // 10MB default
	}

	return Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		JWTSecret:    os.Getenv("JWT_SECRET"),

		PythonServiceURL: os.Getenv("PYTHON_SERVICE_URL"),
		MaxFileSize:      maxFileSize,
	}
}
