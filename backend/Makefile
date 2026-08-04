DB_URL=postgres://postgres:postgres@localhost:5433/moniq?sslmode=disable
MIGRATIONS_PATH=./migrations

.PHONY: build run swagger test clean tidy dev migrate-up migrate-down migrate-force migrate-version migrate-create seed

# Build the application
build: swagger
	go build -o bin/server ./cmd/server

# Run the application
run: swagger
	go run ./cmd/server

# Seed the database with default wallet types and tags
seed:
	go run ./cmd/seed

# Generate swagger docs
swagger:
	swag init -g cmd/server/main.go --parseInternal

# Run tests
test:
	go test -v ./...

# Clean build artifacts
clean:
	rm -rf bin/
	rm -rf docs/

# Tidy dependencies
tidy:
	go mod tidy

# Development mode with air (hot reload)
dev-api: swagger
	air

# Create a new migration
# Usage:
# make migrate-create name=create_users_table
migrate-create:
	@if [ -z "$(name)" ]; then \
		echo "Usage: make migrate-create name=your_migration_name"; \
		exit 1; \
	fi
	migrate create -ext sql -dir $(MIGRATIONS_PATH) -seq $(name)

# Apply all up migrations
migrate-up:
	migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" up

# Rollback last migration
migrate-down:
	migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" down 1

# Rollback all migrations
migrate-down-all:
	migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" down

# Show current migration version
migrate-version:
	migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" version

# Force migration version (used when migration gets dirty)
# Usage:
# make migrate-force version=1
migrate-force:
	@if [ -z "$(version)" ]; then \
		echo "Usage: make migrate-force version=VERSION_NUMBER"; \
		exit 1; \
	fi
	migrate -path $(MIGRATIONS_PATH) -database "$(DB_URL)" force $(version)