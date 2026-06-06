package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/service"
)

type iamHandler struct {
	service service.IAMService
}

func NewIAMHandler(service service.IAMService) *iamHandler {
	return &iamHandler{
		service: service,
	}
}

// Define handler methods for IAM-related HTTP requests here (e.g., Register, Login, etc.)

// Register godoc
//
// @Summary Register user
// @Description Register a new user
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.RegisterRequestDTO true "Register Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /auth/register [post]
func (h *iamHandler) Register(ctx *gin.Context) {
	var req dto.RegisterRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Invalid request body")
		return
	}

	helper.SuccessResponse(ctx, http.StatusCreated, "Registered successfully", nil)
}