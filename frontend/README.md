# Packager System Frontend

## Overview
This is the React application for the Packager System, built with Vite. It features a role-based UI that adapts depending on whether the logged-in user is an Admin or a Packager.

## Code Flow
1.  **Entry Point**: `src/main.jsx` mounts the React application into the DOM.
2.  **Routing & Logic**: `src/App.jsx` defines the main routes and uses `react-router-dom`.
3.  **Authentication & Protection**:
    - The `useAuth` hook (`src/auth/useAuth.js`) manages user state (stubbed for now).
    - `src/auth/ProtectedRoute.jsx` wraps routes to ensure only authorized roles can access specific pages.
4.  **Role-Based Areas**:
    - **Admin**: Routes under `/admin` load components from `src/roles/admin/`.
    - **Packager**: Routes under `/packager` load components from `src/roles/packager/`.

## Project Structure
- `src/App.jsx`: Main routing configuration.
- `src/auth/`: Authentication logic (`LoginPage`, `ProtectedRoute`, `useAuth`).
- `src/roles/`: Role-specific code.
    - `admin/`: Admin pages and components (e.g., `AdminDashboard`).
    - `packager/`: Packager pages and components (e.g., `ScannerRecordingPage`).
- `src/components/`: Shared UI components.
- `src/api/`: API integration services (Axios).

## How to Run Locally

### Prerequisites
- Node.js and npm installed.

### Steps
1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  **Access the Application**:
    - Open your browser and go to `http://localhost:5173` (or the port shown in the terminal).
    - **Login**: usage is currently stubbed. You will be redirected to the login page if not authenticated.
