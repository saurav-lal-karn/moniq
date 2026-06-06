package user

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/saurav-lal-karn/moniq/backend/internal/config"
)

// Register user routes here
func RegisterRoutes(route *gin.RouterGroup, db *pgxpool.Pool, cfg *config.Config) {
		// 7. Bootstrap Clean Architecture Layers for User Module
	// userRepo := NewUserRepository(db)
	// userService := NewUserService(userRepo, cfg.JWTSecret, cfg.JWTExpiryHours)
	// authMiddleware := middleware.Auth(cfg.JWTSecret)
	
	// h := NewUserHandler(userService)

	// authRoutes := route.Group("/auth")
	// {
	// 	authRoutes.POST("/signup", h.SignUp)
	// 	authRoutes.POST("/login", h.Login)
	// }

	// userRoutes := route.Group("/users")
	// userRoutes.Use(authMiddleware)
	// {
	// 	userRoutes.GET("/me", h.GetProfile)
	// }
}