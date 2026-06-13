package jwt

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
)

// jwt payload
type JWTPayload struct {
	AccessToken string `json:"access_token,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

type JWTParameters struct {
	AccessKey []byte
	AccessKeyTTL int
	RefreshKey []byte
	RefreshKeyTTL int
}

// Exported variable
var JWTParams JWTParameters

// Claims represents the JWT claims
type MyClaims struct {
	UserID string `json:"user_id"`
	Email string `json:"email,omitempty"`
	Role string `json:"role,omitempty"`
}

type JWTClaims struct {
	MyClaims
	jwt.RegisteredClaims
}

// Validate Access JWT
func ValidateAccessJWT(token *jwt.Token) (interface{}, error){
	if _, err := token.Method.(*jwt.SigningMethodHMAC); !err {
		return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
	}
	return JWTParams.AccessKey, nil
}

// Validate Refrest JWT
func ValidateRefreshJWT(token *jwt.Token) (interface{}, error){
	if _, err := token.Method.(*jwt.SigningMethodHMAC); !err {
		return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
	}
	return JWTParams.RefreshKey, nil
}

func ValidateAccessToken(tokenString string) (*MyClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, ValidateAccessJWT)
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return &claims.MyClaims, nil
	}

	return nil, helper.ErrInvalidToken
}

func ValidateRefreshToken(tokenString string) (*MyClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, ValidateRefreshJWT)
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return &claims.MyClaims, nil
	}

	return nil, helper.ErrInvalidToken
}

// Issue new tokens
func GenerateToken(claims MyClaims, tokenType string) (string, *JWTClaims, error) {
	var (
		key []byte
		ttl int
	)

	if tokenType == "access" {
		key = JWTParams.AccessKey
		ttl = JWTParams.AccessKeyTTL
	}

	if tokenType == "refresh" {
		key = JWTParams.RefreshKey
		ttl = JWTParams.RefreshKeyTTL
	}

	// Create the claims
	createdClaims := JWTClaims {
		MyClaims{
			UserID: claims.UserID,
			Email: claims.Email,
			Role: claims.Role,
		},
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Minute * time.Duration(ttl))),
			ID:        uuid.NewString(),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, createdClaims)

	jwtValue, err := token.SignedString(key)
	if err != nil {
		return "", nil, err
	}
	return jwtValue, &createdClaims, nil
}

type CookieKey string

const (
	AccessTokenKey  CookieKey = "access_token"
	RefreshTokenKey CookieKey = "refresh_token"
)

// Set HttpOnly cookies with secure flag if using HTTPS
func SetCookies(c *gin.Context, accessToken string, refreshToken string) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     string(AccessTokenKey),
		Value:    accessToken,
		Expires:  time.Now().Add(time.Minute * time.Duration(JWTParams.AccessKeyTTL)),
		HttpOnly: true,
		Secure:   c.Request.TLS != nil,
		Path:     "/",
	})
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     string(RefreshTokenKey),
		Value:    refreshToken,
		Expires:  time.Now().Add(time.Minute * time.Duration(JWTParams.RefreshKeyTTL)),
		HttpOnly: true,
		Secure:   c.Request.TLS != nil,
		Path:     "/",
	})
}

// Clear HttpOnly cookies with secure flag if using HTTPS
func ClearCookies(c *gin.Context) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     string(AccessTokenKey),
		Value:    "",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   c.Request.TLS != nil,
		Path:     "/",
	})
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     string(RefreshTokenKey),
		Value:    "",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   c.Request.TLS != nil,
		Path:     "/",
	})
}

type ContextKey string

const (
	DatabaseKey ContextKey = "database"
)
