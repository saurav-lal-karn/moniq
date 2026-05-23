package config

import (
	"log/slog"
	"os"
	"strconv"

	"github.com/joho/godotenv"
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
	JWTSecret      string
	JWTExpiryHours int
}

// LoadConfig loads the configuration from environment variables.
// It optionally loads from a .env file if present in the current working directory.
func LoadConfig() (*Config, error) {
	// Attempt to load .env file if it exists (useful for local development)
	if err := godotenv.Load(); err != nil {
		slog.Info("No .env file found, relying on system environment variables")
	}

	jwtExpiryHours, err := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "24"))
	if err != nil {
		jwtExpiryHours = 24
	}

	cfg := &Config{
		Port:           getEnv("PORT", "8080"),
		Env:            getEnv("ENV", "development"),
		LogLevel:       getEnv("LOG_LEVEL", "info"),
		RedisURL:       getEnv("REDIS_URL", "redis://localhost:6379/0"),
		JWTSecret:      getEnv("JWT_SECRET", "moniq-super-secret-key-change-me-in-production"),
		JWTExpiryHours: jwtExpiryHours,
		DatabaseHost:   getEnv("DB_HOST", "localhost"),
		DatabasePort:   getEnv("DB_PORT", "5432"),
		DatabaseUser:   getEnv("DB_USER", "postgres"),
		DatabasePassword: getEnv("DB_PASSWORD", "postgres"),
		DatabaseName:   getEnv("DB_NAME", "moniq"),
		DatabaseSSLMode: getEnv("DB_SSL_MODE", "disable"),
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
