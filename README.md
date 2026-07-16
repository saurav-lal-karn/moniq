# Moniq 💸

Moniq is a sleek, minimalist, and premium personal finance tracker designed to help you organize your financial life. Manage multiple wallets, track income and expenses, and gain clear insights into your spending habits with ease.

---

## ✨ Features

- **Wallet Management**: Track balances across multiple accounts (e.g., Cash, Bank, Credit Cards, Savings) in one unified interface.
- **Income & Expense Tracking**: Quickly log transactions with customizable categories, tags, and notes to stay organized.
- **Visual Analytics**: Interactive summaries and charts showing your monthly income vs. expenses, helping you make smarter financial decisions.
- **Clean UI/UX**: A beautiful, modern interface featuring custom styling, support for dark/light modes, and seamless micro-animations.

---

## 🛠️ Tech Stack

Moniq is built using a modern, fast, and robust stack:

- **Backend**: [Go (Golang)](https://go.dev/) for a high-performance, type-safe REST API.
- **Frontend**: [TypeScript](https://www.typescriptlang.org/) & modern web framework (React/Next.js) with premium responsive styles.
- **Database**: SQL-based storage for reliable transaction and wallet tracking.

---

## 🚀 Getting Started

Follow these steps to get Moniq up and running locally.

### Prerequisites

- Go (1.21 or higher)
- Node.js (v18 or higher) and npm/yarn/pnpm

### Setup & Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/saurav-lal-karn/moniq.git
   cd moniq
   ```

2. **Backend Setup**
   ```bash
   cd backend
   # Copy environment example and configure it
   cp .env.example .env
   
   # Run the development server (with hot reload using air)
   make dev
   # Or run directly:
   go run ./cmd/server
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   # Copy environment example
   cp .env.example .env
   
   # Install dependencies
   npm install
   
   # Run development server
   npm run dev
   ```

---

## 📁 Project Structure

```text
moniq/
├── backend/                # Go Backend REST API
│   ├── cmd/                # Application entrypoints (e.g., cmd/server/main.go)
│   ├── internal/           # Business logic, repositories, handlers
│   ├── pkg/                # Public/utility packages
│   ├── migrations/         # Database migrations (SQL)
│   └── Makefile            # Shortcut commands for running, testing, migrating
│
├── frontend/               # Next.js Frontend (TypeScript & Tailwind/shadcn)
│   ├── src/                # Component files, custom hooks, and pages
│   ├── public/             # Static assets
│   └── components.json     # shadcn/ui configuration
│
└── ai-server/              # AI Service placeholder (future features)
```

---

## 💾 Database Migrations (Backend)

The backend uses SQL-based migrations. You can manage migrations using the `Makefile` inside the `backend/` directory:

- **Create a new migration**:
  ```bash
  make migrate-create name=migration_name
  ```
- **Apply migrations**:
  ```bash
  make migrate-up
  ```
- **Rollback last migration**:
  ```bash
  make migrate-down
  ```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](file:///Users/sauravlalkarn/Projects/personal/moniq/LICENSE) for more information.

