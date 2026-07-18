package route

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/saurav-lal-karn/moniq/backend/internal/middleware"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/handler"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/service"

	memberRepository "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
)

func RegisterContactRoutes(router *gin.RouterGroup, db *pgxpool.Pool, txm *database.TxManager) {
	memberRepo := memberRepository.NewWorkspaceMemberRepository(txm)

	contactRepo := repository.NewContactRepository(db)
	contactService := service.NewContactService(contactRepo)
	contactHandler := handler.NewContactHandler(contactService)

	contactGroupRoutes := router.Group("contact")
	contactGroupRoutes.Use(middleware.Auth())
	contactGroupRoutes.Use(middleware.WorkspaceAccess(memberRepo))

	contactGroupRoutes.POST("", contactHandler.CreateContact)
	contactGroupRoutes.GET("", contactHandler.ListAll)
	contactGroupRoutes.GET("/:id", contactHandler.GetByID)
	contactGroupRoutes.PUT("/:id", contactHandler.UpdateContact)
	contactGroupRoutes.DELETE("/:id", contactHandler.DeleteContact)
}
