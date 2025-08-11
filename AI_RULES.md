# AI Rules for SDMS Application Development

This document outlines the core technologies and specific libraries to be used when developing or modifying the Student Development Management System (SDMS). Adhering to these rules ensures consistency, maintainability, and leverages the strengths of the chosen tech stack.

## 🚀 Tech Stack Overview

The SDMS application is built with a modern full-stack JavaScript/TypeScript architecture:

*   **Frontend:** React with TypeScript for building dynamic user interfaces.
*   **UI Components & Styling:** Chakra UI provides a comprehensive, accessible component library and styling system.
*   **Client-Side Routing:** React Router handles navigation within the single-page application.
*   **Data Management (Frontend):** React Query is used for efficient data fetching, caching, and synchronization with the server.
*   **State Management (Frontend):** Zustand is a lightweight solution for global application state.
*   **Form Handling (Frontend):** React Hook Form, combined with Zod for validation, streamlines form creation and management.
*   **Backend Framework:** Node.js with Express.js powers the RESTful API.
*   **Database:** PostgreSQL is the relational database, accessed via Sequelize ORM.
*   **Real-time Communication:** Socket.io enables real-time features and notifications between the frontend and backend.
*   **Validation:** Zod is used for schema-based data validation on both the frontend and backend.

## 🛠️ Library Usage Rules

To maintain consistency and leverage existing patterns, please follow these rules for library usage:

*   **UI Components & Styling:**
    *   **Always** use components from **Chakra UI** for building the user interface.
    *   Style components using Chakra UI's props (e.g., `p`, `m`, `bg`, `color`) and extend the existing `src/theme.ts` for custom design tokens or component styles.
    *   **Avoid** writing raw CSS or using other styling libraries (e.g., Styled Components, Emotion directly) unless explicitly approved for a specific, complex requirement that Chakra UI cannot handle elegantly.

*   **Routing (Frontend):**
    *   Use **React Router** for all client-side navigation.
    *   Define and manage main application routes within `src/App.tsx`.

*   **State Management (Frontend):**
    *   For global or shared application state (e.g., authentication status, user details), use **Zustand**.
    *   For form-specific state, validation, and submission, use **React Hook Form**.

*   **Data Fetching & Caching (Frontend):**
    *   All interactions with the backend API should be performed using **React Query**. This includes fetching, mutating, and invalidating data.
    *   Leverage React Query's features for loading states, error handling, and automatic refetching.

*   **Form Handling (Frontend):**
    *   Implement all forms using **React Hook Form**.
    *   Integrate **Zod** with `@hookform/resolvers/zod` for schema-based form validation.

*   **HTTP Requests (Frontend):**
    *   Use **Axios** for making HTTP requests to the backend.
    *   Utilize the pre-configured `src/services/api.ts` for authenticated API calls.

*   **Icons (Frontend):**
    *   Use icons from the **`react-icons/fi`** (Feather Icons) library.

*   **Backend API Development:**
    *   Build all RESTful API endpoints using **Express.js**.
    *   Organize routes into feature-specific files within `src/features/*/routes.js`.

*   **Database Interactions (Backend):**
    *   Interact with the PostgreSQL database exclusively through **Sequelize ORM**.
    *   Define database models in `src/db/` and ensure all associations are correctly set up in `src/db/models.js`.
    *   Database migrations should be managed via `src/migrations/migration.js`.

*   **Authentication & Authorization (Backend):**
    *   Implement token-based authentication using **JWT (`jsonwebtoken`)** and password hashing with **`bcryptjs`**.
    *   Utilize the existing `src/middleware/auth.js` for `authenticateToken` and `requireRole` for role-based access control.

*   **Real-time Communication:**
    *   Use **Socket.io** for all real-time features (e.g., notifications).
    *   Ensure proper connection and disconnection handling on both frontend (`frontend/src/hooks/useNotifications.ts`, `frontend/src/services/socket.ts`) and backend (`src/services/socket.js`).
    *   Use `emitToUser` for targeted notifications to specific users.

*   **Validation (Backend):**
    *   Apply **Zod** schemas for robust input validation on all incoming API requests using the `src/middleware/validate.js` middleware.

*   **File Uploads (Backend):**
    *   Handle file uploads using **Multer**, configured to store files in the `uploads/` directory.

*   **Logging (Backend):**
    *   Use **Morgan** for HTTP request logging.
    *   Utilize the custom `src/middleware/apiLogger.js` for detailed API request and response logging.

*   **Rate Limiting (Backend):**
    *   Apply **`express-rate-limit`** middleware from `src/middleware/rateLimiter.js` to protect API endpoints from excessive requests.