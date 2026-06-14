package config

import (
	"log/slog"
	"os"

	"github.com/joho/godotenv"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
)

// Config holds all configuration values for the application.
type Config struct {
	Port           string
	Env            string // "development" or "production"
	LogLevel       string // "debug", "info", "warn", "error"
	DatabaseHost	 string
	DatabasePort	 string
	DatabaseUser	 string
	DatabasePassword string
	DatabaseName	 string
	DatabaseSSLMode string
	RedisURL       string
	AccessKey string
	RefreshKey string
	AccessKeyTTL int
	RefreshKeyTTL int

	// AppBaseURL is the public base URL of the API, used to build links sent in
	// emails (e.g. the email verification link).
	AppBaseURL string
	// EmailAPIKey enables real email delivery when set. When empty, emails are
	// logged to the terminal instead of being sent.
	EmailAPIKey string
	// EmailFrom is the sender address used for outbound email.
	EmailFrom string
}

// LoadConfig loads the configuration from environment variables.
// It optionally loads from a .env file if present in the current working directory.
func LoadConfig() (*Config, error) {
	// Attempt to load .env file if it exists (useful for local development)
	if err := godotenv.Load(); err != nil {
		slog.Info("No .env file found, relying on system environment variables")
	}

	cfg := &Config{
		Port:           getEnv("PORT", "8080"),
		Env:            getEnv("ENV", "development"),
		LogLevel:       getEnv("LOG_LEVEL", "info"),
		RedisURL:       getEnv("REDIS_URL", "redis://localhost:6379/0"),
		AccessKey: 		getEnv("ACCESS_KEY", "jwt-access-key"),
		RefreshKey: 	getEnv("REFRESH_KEY", "jwt-refresh-key"),
		AccessKeyTTL: 	helper.GetEnvAsInt("ACCESS_KEY_TTL", 1000),
		RefreshKeyTTL: 	helper.GetEnvAsInt("REFRESH_KEY_TTL", 86400),
		DatabaseHost:   getEnv("DB_HOST", "localhost"),
		DatabasePort:   getEnv("DB_PORT", "5432"),
		DatabaseUser:   getEnv("DB_USER", "postgres"),
		DatabasePassword: 	getEnv("DB_PASSWORD", "postgres"),
		DatabaseName:   getEnv("DB_NAME", "moniq"),
		DatabaseSSLMode: 	getEnv("DB_SSL_MODE", "disable"),
		AppBaseURL:     getEnv("APP_BASE_URL", "http://localhost:8080"),
		EmailAPIKey:    getEnv("EMAIL_API_KEY", ""),
		EmailFrom:      getEnv("EMAIL_FROM", "Moniq <no-reply@moniq.app>"),
	}

	return cfg, nil
}

// Helper to get environment variable with fallback default value.
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
