package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/service"
	"github.com/saurav-lal-karn/moniq/backend/pkg/logger"
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
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	if err := h.service.Register(ctx.Request.Context(), &req); err != nil {
		logger.Error("Failed to register user", logger.ErrorField(err))
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusCreated, "Registered successfully", nil)
}

// Login godoc
// 
// @Summary Login user
// @Description Login a user
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.LoginRequestDTO true "Login Request"
// @Success 201 {object} dto.LoginResponseDTO
// @Failure 400 {object} helper.Response
// @Router /auth/login [post]
func(h *iamHandler) Login(ctx *gin.Context) {
	var req dto.LoginRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	response, err := h.service.Login(ctx, &req)
	if err != nil {
		logger.Error("Failed to login", logger.ErrorField(err))
		helper.ErrorResponse(ctx, http.StatusUnauthorized, err.Error())
		return
	}


	helper.SuccessResponse(ctx, http.StatusOK, "User logged in successfully", response)
}

// Refresh godoc
// 
// @Summary Refresh token
// @Description Refresh token for user
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.RefreshRequestDTO true "Refresh token Request"
// @Success 201 {object} dto.RefreshResponseDTO
// @Failure 400 {object} helper.Response
// @Router /auth/refresh [post]
func(h *iamHandler) Refresh(ctx *gin.Context){
	var req dto.RefreshRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	response, err := h.service.Refresh(ctx, req.RefreshToken)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Token refreshed", response)
}

// Me godoc
// 
// @Summary Me
// @Description Details of logged in user
// @Tags Auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 201 {object} dto.LoginResponseDTO
// @Failure 400 {object} helper.Response
// @Router /auth/me [get]
func(h *iamHandler) Me(ctx *gin.Context){
	userID, exists := ctx.Get("userID")
	if !exists {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "User ID not found in context")
	}

	userIDStr, ok := userID.(string)
	if !ok {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, "Invalid user ID type")
		return
	}

	logger.Info("Getting the logged in user details", logger.StringField("UserId", userIDStr))
	helper.SuccessResponse(ctx, http.StatusOK, "Details fetched successfully", nil)
}