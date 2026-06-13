package helper

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"log"
	"os"
	"strconv"
)

// SHA256Hex returns the hex-encoded SHA-256 digest of s. Used to store opaque
// tokens (e.g. refresh tokens) as a non-reversible hash rather than in plain
// text, so a database leak doesn't expose the tokens themselves.
func SHA256Hex(s string) string {
	sum := sha256.Sum256([]byte(s))
	return hex.EncodeToString(sum[:])
}

func StringPtr(s string) *string {
	return &s
}

// Helper function to convert string to int
func GetEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		log.Printf("Error converting %s to int: %v", key, err)
		return defaultValue
	}
	return value
}

// GenerateSecureToken returns a URL-safe, cryptographically random token
// derived from byteLength random bytes (the encoded string is longer than
// byteLength). Suitable for email verification and password reset tokens.
func GenerateSecureToken(byteLength int) (string, error) {
	bytes := make([]byte, byteLength)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(bytes), nil
}

// GenerateRandomPassword generates a cryptographically secure random password
func GenerateRandomPassword(length int) (string, error) {
	// Generate random bytes
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	
	// Encode to base64 and trim to desired length
	password := base64.URLEncoding.EncodeToString(bytes)
	if len(password) > length {
		password = password[:length]
	}
	
	return password, nil
}
