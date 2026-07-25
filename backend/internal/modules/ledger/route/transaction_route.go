package route

import (
	"github.com/gin-gonic/gin"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/middleware"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/handler"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/service"

	contactRepository "github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/repository"
	walletRepository "github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/repository"
	memberRepository "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/repository"
)

func RegisterTransactionRoutes(router *gin.RouterGroup, txm *database.TxManager) {
	memberRepo := memberRepository.NewWorkspaceMemberRepository(txm)
	transactionRepo := repository.NewTransactionRepository(txm)
	transactionItemRepo := repository.NewTransactionItemRepository(txm)
	ledgerRepo := repository.NewLedgerRepository(txm)
	contactRepo := contactRepository.NewContactRepository(txm)
	walletRepo := walletRepository.NewWalletRepository(txm)

	transactionService := service.NewTransactionService(txm, transactionRepo, transactionItemRepo, ledgerRepo, contactRepo, walletRepo)
	transactionHandler := handler.NewTransactionHandler(transactionService)
	transactionRoutes := router.Group("/transaction")
	transactionRoutes.Use(middleware.Auth())
	transactionRoutes.Use(middleware.WorkspaceAccess(memberRepo))

	{
		transactionRoutes.POST("/", transactionHandler.CreateTransaction)
		// transactionRoutes.GET("/", h.List)
		// transactionRoutes.GET("/:id", h.GetByID)
		// transactionRoutes.PUT("/:id", h.Update)
		// transactionRoutes.DELETE("/:id", h.Delete)
	}
}