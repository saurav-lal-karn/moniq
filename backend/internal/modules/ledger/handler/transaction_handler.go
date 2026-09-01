package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/mapper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/service"
)

type transactionHandler struct {
	service service.TransactionService
}

func NewTransactionHandler(service service.TransactionService) *transactionHandler {
	return &transactionHandler{
		service: service,
	}
}

// Create Transaction godoc
// 
// @Summary Create transaction
// @Description Create transaction
// @Tags Transaction
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param request body dto.CreateTransactionRequestDTO true "Create Transaction Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /transaction [post]
func(h *transactionHandler) CreateTransaction(ctx *gin.Context) {
	userId, exists := ctx.Get("userID")
	if !exists {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "User ID not found in context")
		return
	}

	userID, err := uuid.Parse(userId.(string))
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "Invalid user ID in the request")
		return
	}


	workspaceId := ctx.GetHeader("X-Workspace-Id")
	if workspaceId == ""{
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	var req dto.CreateTransactionRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	req.CreatedBy = userID
	req.WorkspaceID = workspaceID

	err = h.service.CreateTransaction(ctx, &req)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}
	
	helper.SuccessResponse(ctx, http.StatusOK, "Transaction created successfully", nil)	
}

// List Transactions godoc
// 
// @Summary List transactions
// @Description List transactions
// @Tags Transaction
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param page query int false "Page number" default(1) minimum(1)
// @Param limit query int false "Number of transactions per page" default(20) minimum(1) maximum(100)
// @Param search query string false "Search query" example("transaction")
// @Param sort query string false "Sort by" default("createdAt")
// @Param order query string false "Order" default("desc")
// @Param filters query string false "Filters" example("type:expense")
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Failure 500 {object} helper.Response
// @Router /transaction [get]
func (h *transactionHandler) ListTransactions(ctx *gin.Context) {
	var req *helper.PaginationRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	req = helper.NormalizePaginationRequest(req)

	workspaceId := ctx.GetHeader("X-Workspace-Id")
	if workspaceId == ""{
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	list, totalCount, err := h.service.List(ctx, workspaceID, req)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response := mapper.ToTransactonDetailsListResponse(list)
	helper.PaginatedSuccessResponse(ctx, http.StatusOK, "Transactions retrieved successfully", response, req.Page, req.Limit, totalCount)
}