package route

import (
	"github.com/gin-gonic/gin"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/middleware"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/handler"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/service"

	memberRepository "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/repository"
)

func RegisterWalletRoutes(router *gin.RouterGroup, txm *database.TxManager) {
	memberRepo := memberRepository.NewWorkspaceMemberRepository(txm)
	
	walletRepo := repository.NewWalletRepository(txm)
	walletTypeRepo := repository.NewWalletTypeRepository(txm)
	walletService := service.NewWalletService(walletRepo, walletTypeRepo)
	walletHandler := handler.NewWalletHandler(walletService)

	walletGroupRoutes := router.Group("/wallet")
	walletGroupRoutes.Use(middleware.Auth())
	walletGroupRoutes.Use(middleware.WorkspaceAccess(memberRepo))

	walletGroupRoutes.POST("/", walletHandler.CreateWallet)


	// Setup the wallet type routes
	walletTypeService := service.NewWalletTypeService(walletTypeRepo)
	walletTypeHandler := handler.NewWalletTypeHandler(walletTypeService)

	walletTypeGroupRoutes := router.Group("/wallet-type")
	walletTypeGroupRoutes.Use(middleware.Auth())
	walletTypeGroupRoutes.Use(middleware.WorkspaceAccess(memberRepo))

	walletTypeGroupRoutes.GET("/", walletTypeHandler.ListAll)
	walletTypeGroupRoutes.POST("/", walletTypeHandler.Create)
	walletTypeGroupRoutes.DELETE("/:id", walletTypeHandler.Delete)
}