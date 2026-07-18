package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/mapper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/service"
)

type contactHandler struct {
	contactService service.ContactService
}

func NewContactHandler(contactService service.ContactService) *contactHandler {
	return &contactHandler{
		contactService: contactService,
	}
}

// Create Contact godoc
//
// @Summary Create a new contact
// @Description Create a new contact in the workspace
// @Tags Contact
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param request body dto.CreateContactRequestDTO true "Create Contact Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /contact [post]
func (h *contactHandler) CreateContact(ctx *gin.Context) {
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
	if workspaceId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	var req dto.CreateContactRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	req.WorkspaceID = workspaceID
	req.CreatedBy = userID

	contact := &model.Contact{
		Name:        req.Name,
		Type:        model.ContactType(req.Type),
		WorkspaceID: req.WorkspaceID,
		CreatedBy:   req.CreatedBy,
	}
	contact.ID = uuid.New()

	if req.Email != "" {
		contact.Email = &req.Email
	}
	if req.Phone != "" {
		contact.Phone = &req.Phone
	}
	if req.Address != "" {
		contact.Address = &req.Address
	}

	err = h.contactService.Create(ctx, workspaceID, contact)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusCreated, "Contact created successfully", nil)
}

// List Contacts godoc
//
// @Summary List all contacts
// @Description List all contacts in the workspace
// @Tags Contact
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /contact [get]
func (h *contactHandler) ListAll(ctx *gin.Context) {
	workspaceId := ctx.GetHeader("X-Workspace-Id")
	if workspaceId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	contacts, err := h.contactService.List(ctx, workspaceID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response := mapper.ToContactResponseList(contacts)

	helper.SuccessResponse(ctx, http.StatusOK, "Contacts fetched successfully", response)
}

// Get Contact by ID godoc
//
// @Summary Get contact by ID
// @Description Get contact details by ID
// @Tags Contact
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param id path string true "Contact ID"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /contact/{id} [get]
func (h *contactHandler) GetByID(ctx *gin.Context) {
	workspaceId := ctx.GetHeader("X-Workspace-Id")
	if workspaceId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	contactId := ctx.Param("id")
	if contactId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Contact ID not found in request. Please try again")
		return
	}

	contactID, err := uuid.Parse(contactId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed contact ID in request. Please check again")
		return
	}

	contact, err := h.contactService.GetByID(ctx, workspaceID, contactID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response := mapper.ToContactResponse(contact)

	helper.SuccessResponse(ctx, http.StatusOK, "Contact details fetched successfully", response)
}

// Update Contact godoc
//
// @Summary Update contact
// @Description Update contact details
// @Tags Contact
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param id path string true "Contact ID"
// @Param request body dto.UpdateContactRequestDTO true "Update Contact Request"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /contact/{id} [put]
func (h *contactHandler) UpdateContact(ctx *gin.Context) {
	workspaceId := ctx.GetHeader("X-Workspace-Id")
	if workspaceId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	contactId := ctx.Param("id")
	if contactId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Contact ID not found in request. Please try again")
		return
	}

	contactID, err := uuid.Parse(contactId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed contact ID in request. Please check again")
		return
	}

	var req dto.UpdateContactRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	req.ID = contactID
	req.WorkspaceID = workspaceID

	contact := &model.Contact{
		Name:        req.Name,
		Type:        model.ContactType(req.Type),
		WorkspaceID: req.WorkspaceID,
	}
	contact.ID = contactID

	if req.Email != "" {
		contact.Email = &req.Email
	}
	if req.Phone != "" {
		contact.Phone = &req.Phone
	}
	if req.Address != "" {
		contact.Address = &req.Address
	}

	err = h.contactService.Update(ctx, workspaceID, contact)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Contact updated successfully", nil)
}

// Delete Contact godoc
//
// @Summary Delete contact
// @Description Delete contact by ID
// @Tags Contact
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param id path string true "Contact ID"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /contact/{id} [delete]
func (h *contactHandler) DeleteContact(ctx *gin.Context) {
	workspaceId := ctx.GetHeader("X-Workspace-Id")
	if workspaceId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	contactId := ctx.Param("id")
	if contactId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Contact ID not found in request. Please try again")
		return
	}

	contactID, err := uuid.Parse(contactId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed contact ID in request. Please check again")
		return
	}

	err = h.contactService.Delete(ctx, workspaceID, contactID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Contact deleted successfully", nil)
}
