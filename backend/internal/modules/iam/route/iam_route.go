package route

import (
	"github.com/gin-gonic/gin"
	"github.com/saurav-lal-karn/moniq/backend/internal/config"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/handler"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/service"
)

func RegisterIamRoutes(route *gin.RouterGroup, txm *database.TxManager, cfg *config.Config) {
	iamRepo := repository.NewIAMRepository(txm)
	iamService := service.NewIAMService(txm, iamRepo)
	iamHandler := handler.NewIAMHandler(iamService)

	authRoutes := route.Group("auth")
	authRoutes.POST("/register", iamHandler.Register)

	// Define other IAM-related routes here (e.g., login, user management, etc.)
}