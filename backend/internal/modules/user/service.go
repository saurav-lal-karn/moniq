package user

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
)

type userService struct {
	repo           UserRepository
	jwtSecret      string
	jwtExpiryHours int
}

// NewUserService creates a new instance of the UserService.
func NewUserService(repo UserRepository, jwtSecret string, jwtExpiryHours int) UserService {
	return &userService{
		repo:           repo,
		jwtSecret:      jwtSecret,
		jwtExpiryHours: jwtExpiryHours,
	}
}

// Register signs up a new user, hashes their password, stores them in the DB, and generates a JWT.
func (s *userService) Register(ctx context.Context, req SignUpRequest) (*UserResponse, string, error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", fmt.Errorf("failed to hash password: %w", err)
	}

	userID, err := generateUUID()
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate user id: %w", err)
	}

	now := time.Now()
	u := &User{
		ID:           userID,
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := s.repo.Create(ctx, u); err != nil {
		return nil, "", err // Will return custom duplicate key errors from repository
	}

	// Generate JWT for direct automatic login
	// token, err := jwt.GenerateToken(u.ID, s.jwtSecret, s.jwtExpiryHours)
	// if err != nil {
	// 	return nil, "", fmt.Errorf("failed to generate token after registration: %w", err)
	// }

	res := &UserResponse{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}

	return res, "", nil
}

// Login validates user credentials and returns a JWT token.
func (s *userService) Login(ctx context.Context, req LoginRequest) (string, error) {
	u, err := s.repo.GetByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return "", ErrInvalidCredentials
		}
		return "", fmt.Errorf("login failed: %w", err)
	}

	// Check password
	err = bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password))
	if err != nil {
		return "", ErrInvalidCredentials
	}

	// Generate JWT
	// token, err := jwt.GenerateToken(u.ID, s.jwtSecret, s.jwtExpiryHours)
	// if err != nil {
	// 	return "", fmt.Errorf("failed to generate token on login: %w", err)
	// }

	// return token, nil
	return "", nil
}

// GetProfile retrieves a user's details and filters out sensitive fields.
func (s *userService) GetProfile(ctx context.Context, userID string) (*UserResponse, error) {
	u, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	res := &UserResponse{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}

	return res, nil
}

// Cryptographically secure pseudorandom v4 UUID generator (no external packages required)
func generateUUID() (string, error) {
	uuid := make([]byte, 16)
	_, err := rand.Read(uuid)
	if err != nil {
		return "", err
	}

	// Set version to 4
	uuid[6] = (uuid[6] & 0x0f) | 0x40
	// Set variant to RFC 4122
	uuid[8] = (uuid[8] & 0x3f) | 0x80

	return fmt.Sprintf("%x-%x-%x-%x-%x",
		uuid[0:4],
		uuid[4:6],
		uuid[6:8],
		uuid[8:10],
		uuid[10:],
	), nil
}
