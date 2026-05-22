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

To get a local copy of Moniq up and running, follow these simple steps.

### Prerequisites

- Go (1.21 or higher)
- Node.js (v18 or higher) and npm/pnpm

### Setup & Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/saurav-lal-karn/moniq.git
   cd moniq
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory (or respective frontend/backend folders) and set up your database credentials and server port configurations.

3. **Run the Backend Server**
   ```bash
   # Navigate to the backend directory (if applicable)
   go run main.go
   ```

4. **Run the Frontend Application**
   ```bash
   # Navigate to the frontend directory
   npm install
   # Run the development server
   npm run dev
   ```

---

## 📁 Project Structure

```text
moniq/
├── cmd/                # Entrypoints for the application
├── internal/           # Core application code (domain, services, repositories)
├── web/                # Frontend codebase (components, pages, styles)
├── LICENSE             # Open-source license
└── README.md           # Project documentation
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](file:///Users/sauravlalkarn/Projects/personal/moniq/LICENSE) for more information.
