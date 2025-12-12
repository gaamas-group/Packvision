# **Packvision — Intelligent Packaging Monitoring System**

*Enterprise-grade Role-Based Camera Monitoring & Packaging Analytics Platform*

Packvision is an end-to-end, AI-ready, packaging-line monitoring system designed for industrial environments.
It provides real-time camera streaming, packager activity monitoring, recording workflows, and administrative dashboards for system oversight.

This monorepo includes the full stack: **Python FastAPI backend**, **React dashboard**, and **Docker-based infrastructure**.

---

## **📁 Monorepo Structure**

```
Packvision/
│
├── backend/               # FastAPI backend - camera control, APIs, authentication
│   ├── app/
│   │   ├── api/           # Route handlers
│   │   ├── core/          # Config, logging, utilities
│   │   ├── services/      # Camera service, recording manager, workflows
│   │   ├── models/        # Pydantic models (& ORM if added)
│   │   ├── db/            # Database session, migrations
│   │   ├── security/      # JWT & role-based access
│   │   └── main.py        # Application entry point
│   └── requirements.txt
│
├── frontend/              # React (Vite) - Role based UI for Admin & Packager
│   ├── src/
│   │   ├── components/    # Reusable UI elements
│   │   ├── pages/         # Screens for different roles
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # Auth + User Role Context
│   │   └── api/           # Axios API wrappers
│   └── package.json
│
├── infra/                 # Infrastructure: Docker, Docker Compose, CI/CD, IaC
│   ├── docker/
│   ├── docker-compose.yml
│   └── terraform/         # If cloud infra automation is included
│
└── README.md              # Project documentation
```

---

# **🚀 High-Level System Workflow**

### **1. User Authentication & Roles**

* Users log in through the React app.
* FastAPI issues JWT tokens.
* Tokens include assigned roles:
  **admin**, **packager**, **supervisor**, etc.
* UI and API permissions change dynamically based on role.

### **2. Camera Management (Python Backend)**

* Admin configures available cameras (IP, USB, RTSP).
* FastAPI camera service uses:

  * `OpenCV` for live frame grabbing
  * Optional `aiortc` / `ffmpeg` integration for low-latency streaming
* Endpoints:

  * `/camera/start`
  * `/camera/stop`
  * `/camera/status`
  * `/camera/record/start`
  * `/camera/record/stop`

### **3. Recording Workflow**

* Backend handles all recording operations using Python:

  * Save recordings to local or mounted volume
  * Auto-create folders by date/user
  * Async background tasks for long-running processes
* React only *triggers* the action, it never handles video directly.

### **4. Admin Dashboard**

(Admin Role)

* View all packagers
* Monitor live camera streams
* View system logs
* Create/update roles
* Manage storage usage
* Review production timelines

### **5. Packager Dashboard**

(Packager Role)

* Start/stop packaging sessions
* View their assigned cameras
* Scan packaging codes (if implemented)
* Upload incident photos/reports
* View daily performance

---

# **🧠 Tech Stack**

## **Backend — FastAPI (Python)**

* **FastAPI** — High-performance API framework
* **OpenCV** — Camera handling & recording
* **uvicorn** — ASGI server
* **SQLAlchemy / PostgreSQL** (if enabled)
* **Redis** for caching or job queues (optional)
* **JWT Auth** (PyJWT)
* **Pydantic v2** — Request/response validation

## **Frontend — React + Vite**

* React 18
* Vite for fast builds
* Zustand / Context API for auth state
* Axios for API communication
* TailwindCSS / Material-UI (optional)
* Role-based routing

## **Infrastructure**

* Docker + Docker Compose
* Optional:

  * Nginx reverse proxy
  * Terraform for cloud deployment
  * Traefik for SSL automation
  * GitHub Actions for CI/CD

---

# **🛠️ Development Setup**

## **1. Clone Repository**

```bash
git clone https://github.com/<org>/<repo>.git
cd Packvision
```

---

## **2. Backend Setup (Manual)**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## **3. Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

---

## **4. Docker (Full Stack)**

```bash
cd infra
docker-compose up --build
```

Services:

* `backend` → FastAPI
* `frontend` → React app served on nginx (or dev server)
* `db` (optional) → PostgreSQL
* `redis` (optional)

---

# **🔐 Security & Role-Based Access**

The backend enforces access control:

| Role           | Access                                        |
| -------------- | --------------------------------------------- |
| **Admin**      | Full system access, camera control, user mgmt |
| **Packager**   | Limited dashboard, recording control          |
| **Supervisor** | Monitoring & reporting                        |
| **Auditor**    | View-only                                     |

React receives the user role from JWT and renders the right UI.

---

# **📦 Deployment (Enterprise)**

### **Recommended Architecture**

* **Backend** on Docker or Kubernetes
* **Frontend** (React) hosted on:

  * S3 + CloudFront
  * Netlify / Vercel
  * or Nginx container
* **DB** on managed PostgreSQL (RDS, Cloud SQL)
* **File storage** on:

  * AWS S3
  * or local NAS storage
* **Logs & Monitoring**:

  * Prometheus + Grafana
  * Loki for logs

---

# **🧩 Coding Conventions**

### **Backend**

* Use type hints everywhere
* Follow FastAPI’s router/module structure
* Isolate camera functions inside `services/camera_service.py`
* Avoid blocking tasks — use `asyncio` or background workers

### **Frontend**

* Feature-based folder structure
* Reusable components
* API wrappers in `src/api/`
* Centralized role-based routing

---

# **📄 License**

Proprietary — All rights reserved by GAAMAS Group.

