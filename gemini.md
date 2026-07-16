# Moniq AI Agent Guide 🤖

Welcome! This guide is designed for Gemini, Antigravity, and other AI coding assistants working on the **Moniq** project. It provides context on the repository structure, code conventions, environment settings, and workflows to ensure high-quality and consistent contributions.

---

## 📌 Project Overview
Moniq is a sleek, minimalist personal finance tracker designed for managing wallets, tracking transactions, and providing visual analytics of income vs. expenses.

### Architecture
- **Backend**: Go (Golang) REST API. Live-reload supported via `air`.
- **Frontend**: Next.js (TypeScript) web application with shadcn/ui components and responsive CSS/Tailwind.
- **AI Server**: (Placeholder) Located in `ai-server/`, intended for future AI-powered finance analysis and categorizations.

---

## 📂 Repository Structure

```text
moniq/
├── backend/                # Go Backend
│   ├── cmd/                # Entrypoints (e.g., main.go)
│   ├── internal/           # Private application code (business logic, DB)
│   ├── pkg/                # Public/sharable packages
│   ├── migrations/         # SQL database migrations
│   ├── docs/               # API documentation
│   ├── .air.toml           # Live reload configuration for Go
│   └── Makefile            # Commands for running, migrating, and testing
│
├── frontend/               # Next.js Frontend
│   ├── src/                # Source code (app/pages, components, hooks)
│   ├── public/             # Static assets
│   ├── package.json        # Dependencies & scripts
│   └── components.json     # shadcn/ui configuration
│
└── ai-server/              # Future AI services directory (currently empty)
```

---

## 🛠️ Developer Setup & Commands

### Backend (Go)
- **Start Development Server (with Live Reload)**:
  ```bash
  cd backend
  air
  # Or if air is not installed:
  go run cmd/server/main.go
  ```
- **Configuration**: Resides in `backend/.env`. Refer to [backend/.env.example](file:///Users/sauravlalkarn/Projects/personal/moniq/backend/.env.example) for template configuration.

### Frontend (Next.js & TypeScript)
- **Install Dependencies**:
  ```bash
  cd frontend
  npm install # or yarn install
  ```
- **Start Development Server**:
  ```bash
  npm run dev
  ```
- **Configuration**: Resides in `frontend/.env`. Refer to [frontend/.env.example](file:///Users/sauravlalkarn/Projects/personal/moniq/frontend/.env.example).

---

## 💾 Database & Schema

- High-level database visual schemas are available in the root folder:
  - Reference the current schema image: [database_schema.png](file:///Users/sauravlalkarn/Projects/personal/moniq/database_schema.png)
  - Reference the initial schema image: [initial-expense-tracker-db-schema.png](file:///Users/sauravlalkarn/Projects/personal/moniq/initial-expense-tracker-db-schema.png)
- Database schema changes must be written as migrations inside `backend/migrations/`. Do not modify existing migrations directly; create new sequential migration files instead.

---

## 📝 Guidelines for AI Agents

When implementing features, modifications, or bug fixes:

1. **Keep Documentation & Comments Intact**:
   - Do not delete or strip existing comments, docstrings, or annotations unless specifically asked.
   - Document new Go functions/structs following standard Golang conventions.

2. **Go Backend Conventions**:
   - Separate concerns clearly: handlers parse requests, services contain business logic, and repositories query the database.
   - Maintain type safety, handle all errors gracefully, and return appropriate HTTP status codes.

3. **Frontend React & Tailwind Styling**:
   - Maintain the premium, minimalist design language of Moniq.
   - Leverage `shadcn/ui` components when creating or modifying forms, dialogs, and tables.
   - Ensure all new pages/components are responsive and support clean states (e.g. loading, empty, and error views).

4. **Safety & Verification**:
   - Ensure you run compiler checks (`go build`, `npm run build`, or typescript checks) before concluding task execution to prevent syntax or type errors.
