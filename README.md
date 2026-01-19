# **Packvision — Intelligent Packaging Monitoring System**

_Enterprise-grade Role-Based Camera Monitoring & Packaging Analytics Platform_

Packvision is an end-to-end, AI-ready, packaging-line monitoring system designed for industrial environments.
It provides real-time camera streaming, packager activity monitoring, recording workflows, and administrative dashboards for system oversight.

This monorepo includes the full stack: **Node.js (Express) backend**, **React (TypeScript) dashboard**, and **Docker-based infrastructure**.

---

## **📁 Monorepo Structure**

```
Packvision/
│
├── backend/               # Node.js (Express) backend - camera control, APIs, authentication
│   ├── app/
│   │   ├── api/           # Route handlers (v1)
│   │   ├── services/      # S3 storage service, recording logic
│   │   └── utils/         # Helper functions
│   ├── server.js          # Application entry point
│   └── package.json       # Node.js dependencies
│
├── frontend/              # React (Vite + TypeScript) - Role based UI for Admin & Packager
│   ├── src/
│   │   ├── components/    # Reusable UI elements (Custom UI Kit)
│   │   ├── pages/         # Screens for different roles
│   │   ├── hooks/         # Custom React hooks
│   │   ├── auth/          # Authentication logic
│   │   └── api/           # Axios API wrappers
│   └── package.json
│
├── infra/                 # Infrastructure: Docker, Docker Compose
│   ├── docker/
│   └── docker-compose.yml
│
└── README.md              # Project documentation
```

---

# **🚀 High-Level System Workflow**

### **1. User Authentication & Roles**

- Users log in through the React app.
- Node.js backend issues JWT tokens.
- Tokens include assigned roles:
  **admin**, **packager**, **supervisor**, etc.
- UI and API permissions change dynamically based on role.

### **2. Recording & Storage Workflow**

- Backend handles recording orchestration and storage management.
- **S3-Compatible Storage**: Uses AWS SDK for interaction with S3 or MinIO.
- **Presigned URLs**:
  - Generates secure `PutObject` presigned URLs for client-side uploads.
  - Generates secure `GetObject` presigned URLs for video playback.
- Endpoints:
  - `POST /api/v1/videos/upload-url`
  - `GET /api/v1/videos/download-url/:key`

### **3. Admin Dashboard**

(Admin Role)

- View all packagers and active sessions.
- Monitor system logs and production timelines.
- Manage storage usage and recording archives.
- Create and update user roles.

### **4. Packager Dashboard**

(Packager Role)

- Start/stop packaging sessions.
- Scan packaging codes and link them to recordings.
- Upload incident photos/reports directly to cloud storage.
- View daily performance metrics.

---

# **🧠 Tech Stack**

## **Backend — Node.js (Express)**

- **Express** — Fast, unopinionated web framework.
- **AWS SDK (@aws-sdk/client-s3)** — S3-compatible storage integration.
- **JWT Auth (jsonwebtoken)** — Secure token-based authentication.
- **bcryptjs** — Password hashing and security.
- **dotenv** — Environment variable management.

## **Frontend — React + Vite (TypeScript)**

- **React 19** — Latest React features.
- **TypeScript** — Strong typing for better maintainability.
- **Tailwind CSS** — Utility-first styling with modern configuration.
- **Zustand** — Lightweight state management.
- **TanStack Table** — Powerful data tables for admin dashboards.
- **Custom UI Kit** — Custom-built, accessible UI components.
- **Lucide React** — Modern icon set.

## **Infrastructure**

- **Docker + Docker Compose**
- **Nginx** (planned for production reverse proxy)
- **Prometheus + Grafana** (planned for monitoring)

---

# **🛠️ Development Setup**

## **1. Clone Repository**

```bash
git clone https://github.com/<org>/<repo>.git
cd Packvision
```

---

## **2. Backend Setup**

```bash
cd backend
npm install
# Create a .env file with your AWS/MinIO credentials
npm run dev
```

---

## **3. Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

---

# **🔐 Security & Role-Based Access**

The backend enforces access control via JWT middleware:

| Role           | Access                                      |
| -------------- | ------------------------------------------- |
| **Admin**      | Full system access, storage mgmt, user mgmt |
| **Packager**   | Session control, recording uploads          |
| **Supervisor** | Monitoring & reporting                      |
| **Auditor**    | View-only access to logs and analytics      |

---

# **📦 Deployment (Enterprise)**

### **Recommended Architecture**

- **Backend**: Node.js containers orchestrated by Kubernetes or Docker Swarm.
- **Frontend**: Static hosting (S3 + CloudFront, Vercel, or Nginx).
- **Storage**: MinIO for on-premise or AWS S3 for cloud-native deployments.
- **Database**: PostgreSQL for persistent metadata (planned).

---

# **🧩 Coding Conventions**

### **Backend**

- Use ES Modules (`import/export`).
- Keep services (S3, Auth) isolated from route handlers.
- Implement robust error handling middleware.

### **Frontend**

- Standardize on TypeScript for all new components.
- Use the custom UI kit for consistent design patterns.
- Keep state centralized in Zustand or Context where appropriate.

---

# **📄 License**

Proprietary — All rights reserved by GAAMAS Group.
