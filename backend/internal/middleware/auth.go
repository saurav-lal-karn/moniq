package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/pkg/jwt"
)

func Auth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var tokenString string

		// Get the token from the cookie
		accessToken, err := ctx.Cookie(string(jwt.AccessTokenKey))
		if err == nil {
			tokenString = accessToken
		}

		// If not in cokkie, get from authorization header
		if tokenString == "" {
			authHeader := ctx.GetHeader("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		// If not found, try query parameter -> for websocket
		if tokenString == ""{
			tokenString = ctx.Query("token")
		}

		// If still not found, return the error response for unauthorized
		if tokenString == "" {
			helper.ErrorResponse(ctx, http.StatusUnauthorized, "Unauthorized: No token provided")
			ctx.Abort()
			return 
		}

		// Validate the token
		claims, err := jwt.ValidateAccessToken(tokenString)
		if err != nil {
			helper.ErrorResponse(ctx, http.StatusUnauthorized, "Unauthorize: Invalid or expired token")
			ctx.Abort()
			return 
		} 

		// Set the userId in context
		ctx.Set("userID", claims.UserID)
		ctx.Set("email", claims.Email)
		ctx.Set("Role", claims.Role)

		ctx.Next()
	}
}