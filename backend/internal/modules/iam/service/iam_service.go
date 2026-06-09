package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	baseModel "github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/repository"
	"github.com/saurav-lal-karn/moniq/backend/pkg/logger"
	"golang.org/x/crypto/bcrypt"
)

type iamService struct {
	txm  *database.TxManager
	repo repository.IAMRepository
}

type IAMService interface {
	// Define methods for IAM-related business logic here
	Register(ctx context.Context, user *dto.RegisterRequestDTO) error
	GetByID(ctx context.Context, id string) (*model.User, error)
	List(ctx context.Context) ([]*model.User, error)
	Update(ctx context.Context, user *model.User) error
}

// NewIAMService creates a new instance of the IAMService.
func NewIAMService(txm *database.TxManager, repo repository.IAMRepository) IAMService {
	return &iamService{
		txm:  txm,
		repo: repo,
	}
}

func (s *iamService) Register(ctx context.Context, createUserRequest *dto.RegisterRequestDTO) error {
	// Check if the user exists by email
	exists, err := s.repo.CheckUserExists(ctx, createUserRequest.Email)
	if err != nil {
		logger.Error("Error on checking user exists", logger.ErrorField(err))
		return err
	}

	if exists {
		return fmt.Errorf("user with email %s already exists", createUserRequest.Email)
	}

	// Hash the password before storing it in the database. Done outside the
	// transaction since bcrypt is CPU-bound and shouldn't hold a connection.
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(createUserRequest.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	user := &model.User{
		ID:        uuid.New(),
		FirstName: createUserRequest.FirstName,
		LastName:  helper.StringPtr(createUserRequest.LastName),
		Email:     createUserRequest.Email,
	}

	// Create auth identifiers (e.g., password hash, tokens, etc.) and store them securely
	authIdentifer := &model.AuthIdentifier{
		BaseModel:          baseModel.BaseModel{ID: uuid.New()},
		UserID:             user.ID,
		PasswordHash:       helper.StringPtr(string(hashedPassword)),
		AuthProvider:       "email",
		AuthProviderUserID: createUserRequest.Email,
	}

	// Persist the user and their auth identifier atomically — if either write
	// fails the whole registration is rolled back.
	if err := s.txm.Run(ctx, func(ctx context.Context) error {
		if err := s.repo.Create(ctx, user); err != nil {
			return err
		}
		return s.repo.CreateAuthIdentities(ctx, authIdentifer)
	}); err != nil {
		return err
	}

	logger.Info("Registering user with email: %s", logger.StringField("Email", createUserRequest.Email))
	return nil
}

func (s *iamService) GetByID(ctx context.Context, id string) (*model.User, error) {
	return nil, nil // Placeholder return statement
}

func (s *iamService) List(ctx context.Context) ([]*model.User, error) {
	return nil, nil // Placeholder return statement
}

func (s *iamService) Update(ctx context.Context, user *model.User) error {
	return nil // Placeholder return statement
}