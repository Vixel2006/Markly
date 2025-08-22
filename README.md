# Markly

Markly is a full-stack application designed to help users manage and organize their bookmarks efficiently. It provides a robust backend for data storage and retrieval, and a modern, responsive frontend for an intuitive user experience.

## Features

*   **Bookmark Management**: Add, edit, delete, and view your bookmarks.
*   **Categorization**: Organize bookmarks into custom categories.
*   **Tagging**: Apply tags to bookmarks for easy searching and filtering.
*   **Collections**: Group related bookmarks into collections.
*   **User Authentication**: Secure user accounts for personalized bookmark management.

## Technologies Used

### Backend

*   **Go**: Primary language for the backend API.
*   **Gin Gonic**: Web framework for building the API.
*   **PostgreSQL**: Database for storing application data.
*   **Docker**: For containerizing the database.

### Frontend

*   **Next.js**: React framework for building the user interface.
*   **TypeScript**: For type-safe JavaScript development.
*   **Tailwind CSS**: For rapid UI development and styling.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Go (version 1.20 or higher)
*   Node.js (LTS version)
*   npm or yarn
*   Docker and Docker Compose

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/Markly.git
    cd Markly
    ```

2.  **Backend Setup:**

    Navigate to the backend directory:

    ```bash
    cd backend/markly
    ```

    Install Go dependencies:

    ```bash
    go mod tidy
    ```

    Set up the database using Docker Compose:

    ```bash
    make docker-run
    ```

    This will start a PostgreSQL container. Ensure your `.env` file is configured correctly for database connection.

    Run database migrations (if any, this step might need to be added later if not handled by `make run`):

    ```bash
    # Placeholder for migration command if needed
    ```

3.  **Frontend Setup:**

    Navigate to the client directory:

    ```bash
    cd ../../client
    ```

    Install Node.js dependencies:

    ```bash
    npm install # or yarn install
    ```

### Running the Application

1.  **Start the Backend:**

    From the `backend/markly` directory:

    ```bash
    make run
    ```

    This will start the Go API server, typically on `http://localhost:8080`.

2.  **Start the Frontend:**

    From the `client` directory:

    ```bash
    npm run dev # or yarn dev
    ```

    This will start the Next.js development server, typically on `http://localhost:3000`. Open `http://localhost:3000` in your browser to see the application.

## Project Structure

```
.
├── backend/                # Go backend application
│   └── markly/
│       ├── cmd/            # Main application entry points
│       ├── internal/       # Internal packages (database, handlers, models, etc.)
│       ├── go.mod          # Go module file
│       └── Makefile        # Build and run commands
└── client/                 # Next.js frontend application
    ├── public/             # Static assets
    ├── src/                # React components, pages, styles
    ├── package.json        # Node.js dependencies
    └── next.config.ts      # Next.js configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details. (Note: A LICENSE.md file should be created if not already present).
