package route

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/saurav-lal-karn/moniq/backend/internal/config"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/handler"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/service"
)

func RegisterIamRoutes(route *gin.RouterGroup, db *pgxpool.Pool, cfg *config.Config) {
	iamRepo := repository.NewIAMRepository(db)
	iamService := service.NewIAMService(iamRepo)
	iamHandler := handler.NewIAMHandler(iamService)

	authRoutes := route.Group("auth")
	authRoutes.POST("/register", iamHandler.Register)

	// Define other IAM-related routes here (e.g., login, user management, etc.)
}