package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	iamModel "github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/model"
)

type iamRepository struct {
	db database.DB
}

type IAMRepository interface {
	// Define methods for IAM-related database operations here
	Create(ctx context.Context, user *iamModel.User) error
	GetByEmail(ctx context.Context, email string) (*iamModel.User, *iamModel.AuthIdentifier, error) // Added method to get user by email for login purposes
	CheckUserExists(ctx context.Context, email string) (bool, error) // Added method to check if a user already exists by email
	CreateAuthIdentities(ctx context.Context, authIdentifier *iamModel.AuthIdentifier) error // Added method to create auth identifiers (e.g., password hash)
	CreateEmailVerification(ctx context.Context, emailVetification *iamModel.UserEmailVerification) error
	CreateUserSession(ctx context.Context, userSession *iamModel.UserSession) error
	GetUserSessionByHash(ctx context.Context, userID string, tokenHash string) (*iamModel.UserSession, error)
	RevokeRefreshToken(ctx context.Context, userID string, tokenHash string) error
	RevokeAllRefreshTokenForUser(ctx context.Context, userID string) error
}

func NewIAMRepository(db database.DB) IAMRepository {
	return &iamRepository{
		db: db,
	}
}

func (r *iamRepository) Create(ctx context.Context, user *iamModel.User) error {
	// TODO: Check for errors and handle them appropriately (e.g., unique constraint violations)
	// TODO: Create the auth identifiers (e.g., password hash, tokens, etc.) and store them securely
	query := `
		INSERT INTO users (id, first_name, last_name, email)
		VALUES ($1, $2, $3, $4)
	`
	_, err := r.db.Executor(ctx).Exec(ctx, query, user.ID, user.FirstName, user.LastName, user.Email)
	return err
}

func (r *iamRepository) GetByEmail(ctx context.Context, email string) (*iamModel.User, *iamModel.AuthIdentifier, error) {
	query := `
		SELECT 
			users.id,
			users.first_name,
			users.last_name,
			users.email,
			users.email_verified,
			users.profile_picture_url,
			users.is_active,
			users.role,
			ais.password_hash,
			ais.auth_provider,
			ais.auth_provider_user_id
		FROM public.users AS users
		LEFT JOIN auth_identities AS ais ON users.id = ais.user_id 
		WHERE users.email = $1
		AND ais.deleted_at IS NULL
	`
	row := r.db.Executor(ctx).QueryRow(ctx, query, email)
	var user iamModel.User
	var authIdentity iamModel.AuthIdentifier
	if err := row.Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.EmailVerified, &user.ProfilePictureURL, &user.IsActive, &user.Role,
		&authIdentity.PasswordHash, &authIdentity.AuthProvider, &authIdentity.AuthProviderUserID,
	); err != nil {
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return nil, nil, helper.ErrUserNotFound
			}
		return nil, nil, fmt.Errorf("failed to query user by email: %w", err)
	}
	}
	return &user, &authIdentity, nil // Return the found user
}

func (r *iamRepository) CheckUserExists(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.db.Executor(ctx).QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", email).Scan(&exists)
	return exists, err
}

func (r *iamRepository) CreateAuthIdentities(ctx context.Context, authIdentifier *iamModel.AuthIdentifier) error {
	query := `
		INSERT INTO auth_identities (id, user_id, password_hash, refresh_token_hash, auth_provider, auth_provider_user_id)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.Executor(ctx).Exec(ctx, query, authIdentifier.ID, authIdentifier.UserID, authIdentifier.PasswordHash, authIdentifier.RefreshTokenHash, authIdentifier.AuthProvider, authIdentifier.AuthProviderUserID)
	return err
}

func(r *iamRepository) CreateEmailVerification(ctx context.Context, emailVetification *iamModel.UserEmailVerification) error {
	query := `
		INSERT INTO user_email_verifications(id, user_id, token, expires_at)
		VALUES ($1, $2, $3, $4)
	`
	_, err := r.db.Executor(ctx).Exec(ctx, query, emailVetification.ID, emailVetification.UserID, emailVetification.Token, emailVetification.ExpiresAt)
	return err
}

func(r *iamRepository) CreateUserSession(ctx context.Context, userSession *iamModel.UserSession) error {
	query := `
		INSERT INTO user_sessions(id, user_id, refresh_token_hash, device_name, ip_address, user_agent, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := r.db.Executor(ctx).Exec(ctx, query, userSession.ID, userSession.UserID, userSession.RefreshTokenHash, userSession.DeviceName, userSession.IPAddress, userSession.UserAgent, userSession.ExpiresAt)
	return err
}

func (r *iamRepository) GetUserSessionByHash(ctx context.Context, userID string, tokenHash string) (*iamModel.UserSession, error) {
	query := `
		SELECT * FROM user_sessions WHERE user_id = $1 AND refresh_token_hash = $2
	`
	row := r.db.Executor(ctx).QueryRow(ctx, query, userID, tokenHash)
	var user_session iamModel.UserSession
	if err := row.Scan(
		&user_session.ID, &user_session.UserID, &user_session.RefreshTokenHash,
	); err != nil {
		return nil, err
	}
	return &user_session, nil
}

func (r *iamRepository) RevokeRefreshToken(ctx context.Context, userID string, tokenHash string) error {
	query := `
		DELETE FROM user_sessions WHERE user_id = $1 AND refresh_token_hash = $2
	`
	_, err := r.db.Executor(ctx).Exec(ctx, query, userID, tokenHash)
	return err
}

func (r *iamRepository) RevokeAllRefreshTokenForUser(ctx context.Context, userID string) error {
	query := `
		DELETE FROM user_sessions WHERE user_id = $1
	`
	_, err := r.db.Executor(ctx).Exec(ctx, query, userID)
	return err
}