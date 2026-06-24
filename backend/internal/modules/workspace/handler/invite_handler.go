package handler

import "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/service"

type inviteHandler struct {
	service service.MemberService
}

func NewInviteHandler(service service.MemberService) *inviteHandler {
	return &inviteHandler{
		service: service,
	}
}

