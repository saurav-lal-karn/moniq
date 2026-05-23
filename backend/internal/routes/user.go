package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/saurav-lal-karn/moniq/backend/internal/config"
	"github.com/saurav-lal-karn/moniq/backend/internal/middleware"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/user"
)

// Register user routes here
func RegisterUserRoutes(route *gin.RouterGroup, db *pgxpool.Pool, cfg *config.Config) {
		// 7. Bootstrap Clean Architecture Layers for User Module
	userRepo := user.NewUserRepository(db)
	userService := user.NewUserService(userRepo, cfg.JWTSecret, cfg.JWTExpiryHours)
	authMiddleware := middleware.Auth(cfg.JWTSecret)
	
	h := user.NewUserHandler(userService)

	authRoutes := route.Group("/auth")
	{
		authRoutes.POST("/signup", h.SignUp)
		authRoutes.POST("/login", h.Login)
	}

	userRoutes := route.Group("/users")
	userRoutes.Use(authMiddleware)
	{
		userRoutes.GET("/me", h.GetProfile)
	}
}