package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/repository"
)

type contactService struct {
	contactRepo repository.ContactRepository
}

type ContactService interface {
	Create(ctx context.Context, workspaceID uuid.UUID, contact *model.Contact) error
	GetByID(ctx context.Context, workspaceID uuid.UUID, id uuid.UUID) (*model.Contact, error)
	List(ctx context.Context, workspaceID uuid.UUID) ([]*model.Contact, error)
	Update(ctx context.Context, workspaceID uuid.UUID, contact *model.Contact) error
	Delete(ctx context.Context, workspaceID uuid.UUID, id uuid.UUID) error
}

func NewContactService(contactRepo repository.ContactRepository) ContactService {
	return &contactService{
		contactRepo: contactRepo,
	}
}

func (s *contactService) Create(ctx context.Context, workspaceID uuid.UUID, contact *model.Contact) error {
	return s.contactRepo.Create(ctx, contact)
}

func (s *contactService) GetByID(ctx context.Context, workspaceID uuid.UUID, id uuid.UUID) (*model.Contact, error) {
	contact, err := s.contactRepo.GetByID(ctx, id)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, helper.ErrContactNotFound
		}
		return nil, err
	}
	return contact, nil
}

func (s *contactService) List(ctx context.Context, workspaceID uuid.UUID) ([]*model.Contact, error) {
	return s.contactRepo.List(ctx, &workspaceID)
}

func (s *contactService) Update(ctx context.Context, workspaceID uuid.UUID, contact *model.Contact) error {
	_, err := s.contactRepo.GetByID(ctx, contact.ID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return helper.ErrContactNotFound
		}
		return err
	}
	return s.contactRepo.Update(ctx, contact)
}

func (s *contactService) Delete(ctx context.Context, workspaceID uuid.UUID, id uuid.UUID) error {
	_, err := s.contactRepo.GetByID(ctx, id)
	if err != nil {
		if err == pgx.ErrNoRows {
			return helper.ErrContactNotFound
		}
		return err
	}
	return s.contactRepo.Delete(ctx, id)
}