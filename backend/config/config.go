package config

import "os"

type Config struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
	JWTSecret    string
}

func LoadConfig() Config {
	return Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		JWTSecret:    os.Getenv("JWT_SECRET"),
	}
}
