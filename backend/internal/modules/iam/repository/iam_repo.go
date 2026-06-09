package repository

import (
	"context"

	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	iamModel "github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/model"
)

type iamRepository struct {
	db database.DB
}

type IAMRepository interface {
	// Define methods for IAM-related database operations here
	Create(ctx context.Context, user *iamModel.User) error
	GetByID(ctx context.Context, id string) (*iamModel.User, error)
	GetByEmail(ctx context.Context, email string) (*iamModel.User, error) // Added method to get user by email for login purposes
	CheckUserExists(ctx context.Context, email string) (bool, error) // Added method to check if a user already exists by email
	List(ctx context.Context) ([]*iamModel.User, error)
	Update(ctx context.Context, user *iamModel.User) error
	CreateAuthIdentities(ctx context.Context, authIdentifier *iamModel.AuthIdentifier) error // Added method to create auth identifiers (e.g., password hash)
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

func (r *iamRepository) GetByID(ctx context.Context, id string) (*iamModel.User, error) {
	// Implement the logic to get an IAM record by ID from the database
	// Example:
	// row := r.db.QueryRow(ctx, "SELECT * FROM iam_table WHERE id = $1", id)
	//	var iam model.IAM
	// if err := row.Scan(&iam.ID, &iam.Name); err != nil {
	//     return nil, err
	// }
	// return &iam, nil

	return nil, nil // Placeholder return statement
}

func (r *iamRepository) List(ctx context.Context) ([]*iamModel.User, error) {
	// Implement the logic to list IAM records from the database
	// Example:
	// rows, err := r.db.Query(ctx, "SELECT * FROM iam_table")
	// if err != nil {
	//     return nil, err
	// }
	// defer rows.Close()

	// var iams []*model.IAM
	// for rows.Next() {
	//     var iam model.IAM
	//     if err := rows.Scan(&iam.ID, &iam.Name); err != nil {
	//         return nil, err
	//     }
	//     iams = append(iams, &iam)
	// }

	// return iams, nil

	return nil, nil // Placeholder return statement
}

func (r *iamRepository) Update(ctx context.Context, user *iamModel.User) error {
	// Implement the logic to update an existing IAM record in the database
	// Example:
	// _, err := r.db.Exec(ctx, "UPDATE iam_table SET column1 = $1 WHERE id = $2", value1, id)
	// return err

	return nil // Placeholder return statement
}

func (r *iamRepository) GetByEmail(ctx context.Context, email string) (*iamModel.User, error) {
	row := r.db.Executor(ctx).QueryRow(ctx, "SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE email = $1", email)
	var user iamModel.User
	if err := row.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.CreatedAt, &user.UpdatedAt); err != nil {
		return nil, err
	}
	return &user, nil // Return the found user
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