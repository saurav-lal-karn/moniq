# Stage 1: Build the Go binary
FROM golang:1.23-alpine AS builder

# Install build dependencies
RUN apk update && apk add --no-cache git ca-certificates tzdata && update-ca-certificates

WORKDIR /app

# Copy go.mod and go.sum first to leverage Docker caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build a statically linked binary for production
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags="-w -s" -o main cmd/api/main.go

# Stage 2: Final minimal execution image
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy the statically linked binary from builder
COPY --from=builder /app/main .

# Copy migration files for deployment/startup schema initialization if needed
COPY --from=builder /app/migrations ./migrations

# Expose HTTP port
EXPOSE 8080

# Run the binary
CMD ["./main"]
