package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/repository"
)

type tagService struct {
	repo repository.TagRepository
}

type TagService interface {
	Create(ctx context.Context, req *dto.CreateTagRequestDTO, createdBy *uuid.UUID) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.Tag, error)
	List(ctx context.Context, workspaceID *uuid.UUID) ([]*model.Tag, error)
	Update(ctx context.Context, id uuid.UUID, req *dto.UpdateTagRequestDTO) error
	Delete(ctx context.Context, id uuid.UUID) error
}

func NewTagService(repo repository.TagRepository) TagService {
	return &tagService{
		repo: repo,
	}
}

func (s *tagService) Create(ctx context.Context, req *dto.CreateTagRequestDTO, createdBy *uuid.UUID) error {
	tag := &model.Tag{
		Name:        req.Name,
		WorkspaceID: req.WorkspaceID,
		CreatedBy:   createdBy,
	}
	tag.ID = uuid.New()

	return s.repo.Create(ctx, tag)
}

func (s *tagService) GetByID(ctx context.Context, id uuid.UUID) (*model.Tag, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *tagService) List(ctx context.Context, workspaceID *uuid.UUID) ([]*model.Tag, error) {
	return s.repo.List(ctx, workspaceID)
}

func (s *tagService) Update(ctx context.Context, id uuid.UUID, req *dto.UpdateTagRequestDTO) error {
	tag, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	tag.Name = req.Name

	return s.repo.Update(ctx, tag)
}

func (s *tagService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
