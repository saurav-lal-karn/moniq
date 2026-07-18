package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/saurav-lal-karn/moniq/backend/internal/config"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/pkg/logger"
)

type WalletTypeSeed struct {
	Name        string
	Description string
}

type ContactSeed struct {
	Name    string
	Type    string
}

func main() {
	// 1. Load Configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		slog.Error("Failed to load configuration", "error", err)
		os.Exit(1)
	}

	// 2. Initialize Logger
	logger.InitLogger(cfg.Env)
	logger.Info("Starting database seed script...")

	// 3. Connect to Database
	databaseURL := "postgres://" + cfg.DatabaseUser + ":" + cfg.DatabasePassword + "@" + cfg.DatabaseHost + ":" + cfg.DatabasePort + "/" + cfg.DatabaseName + "?sslmode=" + cfg.DatabaseSSLMode
	db, err := database.ConnectPostgres(databaseURL)
	if err != nil {
		logger.Error("Database connection failed", logger.ErrorField(err))
		os.Exit(1)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 4. Seed Wallet Types
	walletTypes := []WalletTypeSeed{
		{Name: "Cash", Description: "Physical cash in hand"},
		{Name: "Bank Account", Description: "Checking or savings accounts at a bank"},
		{Name: "Credit Card", Description: "Credit card accounts"},
		{Name: "Savings", Description: "Dedicated savings accounts"},
		{Name: "Investment", Description: "Stock, mutual funds, or investment accounts"},
		{Name: "Mobile Wallet", Description: "Digital wallets like Apple Pay, Google Pay, PayPal, etc."},
	}

	logger.Info("Seeding wallet types...")
	for _, wt := range walletTypes {
		var exists bool
		err := db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM wallet_types WHERE name = $1 AND workspace_id IS NULL)", wt.Name).Scan(&exists)
		if err != nil {
			logger.Error("Failed to check wallet type existence", logger.StringField("name", wt.Name), logger.ErrorField(err))
			continue
		}

		if !exists {
			_, err = db.Exec(ctx, "INSERT INTO wallet_types (name, description, workspace_id, created_by) VALUES ($1, $2, NULL, NULL)", wt.Name, wt.Description)
			if err != nil {
				logger.Error("Failed to seed wallet type", logger.StringField("name", wt.Name), logger.ErrorField(err))
			} else {
				logger.Info("Seeded wallet type", logger.StringField("name", wt.Name))
			}
		} else {
			logger.Info("Wallet type already exists, skipping", logger.StringField("name", wt.Name))
		}
	}

	// 5. Seed Tags
	tags := []string{
		"Food & Drinks",
		"Shopping",
		"Housing",
		"Transportation",
		"Vehicle",
		"Life & Entertainment",
		"Communication",
		"Financial Expenses",
		"Income",
		"Salary",
		"Investment",
		"Medical & Healthcare",
		"Education",
		"Gifts & Donations",
	}

	logger.Info("Seeding tags...")
	for _, tagName := range tags {
		var exists bool
		err := db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM tags WHERE name = $1 AND workspace_id IS NULL)", tagName).Scan(&exists)
		if err != nil {
			logger.Error("Failed to check tag existence", logger.StringField("name", tagName), logger.ErrorField(err))
			continue
		}

		if !exists {
			_, err = db.Exec(ctx, "INSERT INTO tags (name, workspace_id, created_by) VALUES ($1, NULL, NULL)", tagName)
			if err != nil {
				logger.Error("Failed to seed tag", logger.StringField("name", tagName), logger.ErrorField(err))
			} else {
				logger.Info("Seeded tag", logger.StringField("name", tagName))
			}
		} else {
			logger.Info("Tag already exists, skipping", logger.StringField("name", tagName))
		}
	}

	// 6. Seed Contacts (sample contacts for demonstration)
	contacts := []ContactSeed{
		{Name: "John Doe", Type: "client"},
		{Name: "Jane Smith", Type: "vendor"},
		{Name: "Bob Johnson", Type: "employee"},
		{Name: "Alice Williams", Type: "lender"},
		{Name: "Charlie Brown", Type: "other"},
	}

	logger.Info("Seeding contacts...")
	for _, contact := range contacts {
		var exists bool
		err := db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM contacts WHERE name = $1 AND workspace_id IS NULL)", contact.Name).Scan(&exists)
		if err != nil {
			logger.Error("Failed to check contact existence", logger.StringField("name", contact.Name), logger.ErrorField(err))
			continue
		}

		if !exists {
			_, err = db.Exec(ctx, "INSERT INTO contacts (name, type, workspace_id, created_by) VALUES ($1, $2, NULL, NULL)", contact.Name, contact.Type)
			if err != nil {
				logger.Error("Failed to seed contact", logger.StringField("name", contact.Name), logger.ErrorField(err))
			} else {
				logger.Info("Seeded contact", logger.StringField("name", contact.Name))
			}
		} else {
			logger.Info("Contact already exists, skipping", logger.StringField("name", contact.Name))
		}
	}

	logger.Info("Database seeding completed successfully!")
}
