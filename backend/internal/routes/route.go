package routes

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/saurav-lal-karn/moniq/backend/internal/config"
	"github.com/saurav-lal-karn/moniq/backend/internal/middleware"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/user"
)

func SetupRouter(cfg *config.Config, db *pgxpool.Pool, rdb *redis.Client) *gin.Engine {
	router := gin.New()
	router.Use(middleware.Logger()) // Custom structured logging middleware
	router.Use(gin.Recovery())      // Crash recovery

	// Standard Routes (Health and Readiness)
	router.GET("/health", func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()

		dbStatus := "healthy"
		if err := db.Ping(ctx); err != nil {
			dbStatus = "unhealthy"
		}

		redisStatus := "healthy"
		if err := rdb.Ping(ctx).Err(); err != nil {
			redisStatus = "unhealthy"
		}

		status := http.StatusOK
		if dbStatus == "unhealthy" || redisStatus == "unhealthy" {
			status = http.StatusServiceUnavailable
		}

		c.JSON(status, gin.H{
			"status":   "OK",
			"postgres": dbStatus,
			"redis":    redisStatus,
			"time":     time.Now().Format(time.RFC3339),
		})
	})

	// Versioning of the api
	routeV1 := router.Group("/api/v1")

	// Register routes here
	user.RegisterRoutes(routeV1, db, cfg)
	
	return router
}