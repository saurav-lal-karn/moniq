package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	baseModel "github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/repository"
	workspaceDto "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/dto"
	workspaceModel "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/model"
	workspaceService "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/service"
	"github.com/saurav-lal-karn/moniq/backend/pkg/jwt"
	"github.com/saurav-lal-karn/moniq/backend/pkg/logger"
	"github.com/saurav-lal-karn/moniq/backend/pkg/mailer"
	"golang.org/x/crypto/bcrypt"
)

const (
	// emailVerificationTTL is how long a verification token stays valid.
	emailVerificationTTL = 24 * time.Hour
	// emailVerificationTokenBytes is the entropy of the verification token.
	emailVerificationTokenBytes = 32
)

type iamService struct {
	txm        *database.TxManager
	repo       repository.IAMRepository
	workspace  workspaceService.WorkspaceService
	mailer     mailer.Mailer
	appBaseURL string
}

type IAMService interface {
	// Define methods for IAM-related business logic here
	Register(ctx context.Context, user *dto.RegisterRequestDTO) error
	Login(ctx context.Context, loginRequest *dto.LoginRequestDTO) (*dto.LoginResponseDTO, error)
	GetByID(ctx context.Context, id string) (*model.User, error)
	List(ctx context.Context) ([]*model.User, error)
	Update(ctx context.Context, user *model.User) error
	Refresh(ctx context.Context, refreshToken string) (*dto.RefreshResponseDTO, error)
	Logout(ctx context.Context, userID string, refreshToken string) error
	LogoutFromAllDevices(ctx context.Context, userID string) error
}

// NewIAMService creates a new instance of the IAMService.
func NewIAMService(txm *database.TxManager, repo repository.IAMRepository, workspace workspaceService.WorkspaceService, mail mailer.Mailer, appBaseURL string) IAMService {
	return &iamService{
		txm:        txm,
		repo:       repo,
		workspace:  workspace,
		mailer:     mail,
		appBaseURL: appBaseURL,
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

	// Generate a single-use email verification token. Generated before the
	// transaction since it's pure CPU work and shouldn't hold a connection.
	token, err := helper.GenerateSecureToken(emailVerificationTokenBytes)
	if err != nil {
		return fmt.Errorf("failed to generate verification token: %w", err)
	}

	verification := &model.UserEmailVerification{
		BaseModel: baseModel.BaseModel{ID: uuid.New()},
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: time.Now().Add(emailVerificationTTL),
	}

	// Persist the user, their auth identifier, a default personal workspace and
	// the verification token atomically — if any write fails the whole
	// registration is rolled back. The workspace service runs its own nested
	// Run, which joins this one.
	if err := s.txm.Run(ctx, func(ctx context.Context) error {
		if err := s.repo.Create(ctx, user); err != nil {
			return err
		}
		if err := s.repo.CreateAuthIdentities(ctx, authIdentifer); err != nil {
			return err
		}
		if err := s.repo.CreateEmailVerification(ctx, verification); err != nil {
			return err
		}

		_, err := s.workspace.Create(ctx, workspaceDto.CreateWorkspaceRequestDTO{
			Name:    createUserRequest.FirstName + "'s Personal Workspace",
			Type:    workspaceModel.PersonalWorkspace,
			OwnerID: user.ID,
		})
		return err
	}); err != nil {
		return err
	}

	// Send the verification email only after the transaction commits, so we
	// never email a link for a registration that was rolled back. A delivery
	// failure shouldn't fail the registration — the user already exists and can
	// request a resend — so it's logged rather than returned.
	if err := s.sendVerificationEmail(ctx, user, token); err != nil {
		logger.Error("failed to send verification email",
			logger.StringField("Email", user.Email), logger.ErrorField(err))
	}

	logger.Info("Registering user with email: %s", logger.StringField("Email", createUserRequest.Email))
	return nil
}

// sendVerificationEmail composes and dispatches the email verification message.
// The concrete delivery mechanism (terminal log vs. real provider) is decided
// by the injected mailer.
func (s *iamService) sendVerificationEmail(ctx context.Context, user *model.User, token string) error {
	verifyURL := fmt.Sprintf("%s/api/v1/auth/verify-email?token=%s", s.appBaseURL, token)

	return s.mailer.Send(ctx, mailer.Email{
		To:      user.Email,
		Subject: "Verify your Moniq email address",
		TextBody: fmt.Sprintf(
			"Hi %s,\n\nWelcome to Moniq! Please verify your email address by opening the link below:\n\n%s\n\nThis link expires in %d hours.",
			user.FirstName, verifyURL, int(emailVerificationTTL.Hours()),
		),
	})
}

func(s *iamService) Login(ctx context.Context, loginRequest *dto.LoginRequestDTO) (*dto.LoginResponseDTO, error) {
	user, authIdentity, err := s.repo.GetByEmail(ctx, loginRequest.Email)
	if err != nil {
		return nil, err
	}

	if !user.EmailVerified {
		return nil, helper.ErrEmailNotVerified
	}

	if !user.IsActive {
		return nil, helper.ErrUserNotActive
	}

	logger.Info("User Auth", logger.StringField("Provider", authIdentity.AuthProvider))
	if authIdentity.AuthProvider == helper.AuthProviderEmail {
		// Handle the auth provider for email now
		// Will handle other cases later
		err = bcrypt.CompareHashAndPassword([]byte(*authIdentity.PasswordHash), []byte(loginRequest.Password))
		if err != nil {
			return nil, helper.ErrInvalidCredentials
		}

		claims := jwt.MyClaims {
			UserID: user.ID.String(),
			Email: user.Email,
			Role: string(user.Role),
		}

		// Issue new access tokens
		accessToken, _, err := jwt.GenerateToken(claims, "access")
		if err != nil {
			return nil, err
		}

		refreshToken, createdClaim, err := jwt.GenerateToken(claims, "refresh")
		if err != nil {
			return nil, err
		}

		// Persist the session keyed by a hash of the refresh token (never the
		// token itself) so it can later be looked up, validated and revoked. The
		// session expires when the refresh token does.
		userSes := &model.UserSession{
			BaseModel:        baseModel.BaseModel{ID: uuid.New()},
			UserID:           user.ID,
			RefreshTokenHash: helper.SHA256Hex(refreshToken),
			ExpiresAt:        createdClaim.ExpiresAt.Time,
		}

		if err = s.repo.CreateUserSession(ctx, userSes); err != nil {
			return nil, err
		}

		return &dto.LoginResponseDTO{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		}, nil
	}

	// No supported auth provider matched the identity on this account.
	return nil, helper.ErrInvalidCredentials
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

func (s *iamService) Refresh(ctx context.Context, refreshToken string) (*dto.RefreshResponseDTO, error) {
	claims, err := jwt.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}

	// Create new claims
	newClaims := jwt.MyClaims{
		UserID: claims.UserID,
		Email: claims.Email,
		Role: claims.Role,
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return nil, helper.ErrInvalidUUID
	}

	// Check if token exists in the user session
	hashToken := helper.SHA256Hex(refreshToken)
	_, err = s.repo.GetUserSessionByHash(ctx, claims.UserID, hashToken)
	if err != nil {
		return nil, helper.ErrInvalidRefreshToken
	}

	// Revoke the earlier token
	err = s.repo.RevokeRefreshToken(ctx, claims.UserID, hashToken)
	if err != nil {
		return nil, err
	}

	// Issue new access token
	// Issue new access tokens
	accessToken, _, err := jwt.GenerateToken(newClaims, "access")
	if err != nil {
		return nil, err
	}

	// Issue new refresh token
	refreshToken, createdClaim, err := jwt.GenerateToken(newClaims, "refresh")
	if err != nil {
		return nil, err
	}

	// Store the new session
	userSes := &model.UserSession{
		BaseModel:        baseModel.BaseModel{ID: uuid.New()},
		UserID:           userID,
		RefreshTokenHash: helper.SHA256Hex(refreshToken),
		ExpiresAt:        createdClaim.ExpiresAt.Time,
	}

	if err = s.repo.CreateUserSession(ctx, userSes); err != nil {
		return nil, err
	}

	return &dto.RefreshResponseDTO{
		AccessToken: accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *iamService) Logout(ctx context.Context, userID string, refreshToken string) error {
	// Validate the refresh token
	_, err := jwt.ValidateRefreshToken(refreshToken)
	if err != nil {
		return err
	}

	tokenHash := helper.SHA256Hex(refreshToken)
	if err := s.repo.RevokeRefreshToken(ctx, userID, tokenHash); err != nil {
		return err
	}

	return nil
}

func (s *iamService) LogoutFromAllDevices(ctx context.Context, userID string) error {
	if err := s.repo.RevokeAllRefreshTokenForUser(ctx, userID); err != nil {
		return err
	}

	return nil
}