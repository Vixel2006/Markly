# Markly

**Markly** is a full-stack application for managing and organizing bookmarks efficiently.  
It combines a robust Go backend with a modern, responsive Next.js frontend, providing users with a seamless experience to save, categorize, tag, and explore their bookmarks.

> Private project — internal contributors only.

---

## Table of Contents
1. [Features](#features)
2. [Architecture Overview](#architecture-overview)
3. [Technologies](#technologies)
4. [Getting Started](#getting-started)
5. [Development Workflow](#development-workflow)
6. [Environment Variables](#environment-variables)
7. [Project Structure](#project-structure)
8. [Contributing](#contributing)
9. [License](#license)

---

## Features

- **Bookmark Management:** Add, edit, delete, and view bookmarks.
- **Categorization & Tagging:** Organize bookmarks by categories and tags for easier filtering.
- **Collections:** Group related bookmarks together.
- **AI Suggestions:** Personalized recommendations based on bookmarks, categories, or tags.
- **User Authentication:** Secure accounts with unique profiles.

---

## Architecture Overview

Markly follows a **frontend-backend separation**:

- **Frontend:** Next.js application handles the UI/UX.
- **Backend:** Go API serves data and manages business logic.
- **Database:** PostgreSQL for persistent storage.
- **Deployment:** Docker is used for containerization; CI/CD pipelines handle automated testing and deployment.

---

## Technologies

**Backend:**

- Go (v1.20+)
- Gin Gonic (HTTP framework)
- PostgreSQL (database)
- Docker & Docker Compose

**Frontend:**

- Next.js (React framework)
- TypeScript
- Tailwind CSS (UI styling)

---

## Getting Started

### Prerequisites

- Go 1.20+
- Node.js (LTS)
- npm or yarn
- Docker & Docker Compose

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/Markly.git
cd Markly
```

2. **Backend Setup**
```bash
cd backend/markly
go mod tidy
make docker-run  # Start PostgreSQL container
# Add database migrations here if needed
```

3. **Frontend Setup**
```bash
cd ../../client
npm install # or yarn install
```

### Running the Application

**Backend:**
```bash
cd backend/markly
make run
```
**Frontend:**
```bash
cd client
npm run dev # or yarn dev
```
Open `http://localhost:3000` to view the app.

---

## Development Workflow

- **Branching:** Use feature branches named `feature/<name>` or `bugfix/<name>`.
- **Commits:** Use clear, descriptive messages.
- **Pull Requests:** PRs should reference issues and pass CI/CD checks.
- **Testing:** Write unit tests for backend and frontend features. Backend tests: `go test ./...`. Frontend tests: `npm test`.

---

## Environment Variables

Create a `.env` file in the backend folder with variables like:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=markly
JWT_SECRET=your_secret
```

Frontend environment variables (optional):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Project Structure

```
.
├── backend/markly/       # Go backend
│   ├── cmd/              # Entry points
│   ├── internal/         # Packages: handlers, models, database, etc.
│   ├── go.mod
│   └── Makefile          # Build/run commands
└── client/               # Next.js frontend
    ├── public/           # Static assets
    ├── src/              # Components, pages, styles
    ├── package.json
    └── next.config.ts
```

---

## Contributing

1. Fork the repo or create a branch for your work.
2. Follow coding standards and add tests for new features.
3. Submit a pull request referencing the relevant issue.
4. Make sure CI/CD passes before merging.

---

## License

MIT License — see [LICENSE.md](LICENSE.md) for details.
