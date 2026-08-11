# G-Slein v1

**Telemedicine consultation platform**

> **Status:** Initial project foundation — no features implemented yet.

---

## Overview

G-Slein v1 is a full-stack telemedicine consultation platform that will enable patients to discover doctors, book appointments, conduct video consultations, and manage medical records — all through a secure web application.

---

## Technology Stack

| Layer    | Technology          |
| -------- | ------------------- |
| Backend  | Node.js, Express.js |
| Frontend | React 18, Vite      |
| Language | JavaScript / JSX    |

---

## Repository Structure

```
G-Slein-v1/
├── backend/     Node.js + Express.js REST API
├── frontend/    React + Vite web application
├── docs/        Project documentation
└── README.md    This file
```

### `backend/`

The REST API server built with Node.js and Express.js using ES Modules. Responsible for handling all business logic, data persistence, authentication, and third-party integrations.

See [backend/README.md](backend/README.md) for backend-specific setup and documentation.

### `frontend/`

The web client built with React and Vite. Responsible for all user-facing interfaces and communicates with the backend API over HTTP.

See [frontend/README.md](frontend/README.md) for frontend-specific setup and documentation.

### `docs/`

Project-level documentation organized into four areas:

| Directory            | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| `docs/architecture/` | System architecture, technical design, and ADRs       |
| `docs/api/`          | API specifications and endpoint documentation         |
| `docs/database/`     | Database schema, ER diagrams, and migration decisions |
| `docs/setup/`        | Developer environment setup and deployment guides     |

---

## Local Development

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API available at: `http://localhost:5000`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Application available at: `http://localhost:5173`

---

## Development Stage

This repository contains the initial clean project foundation:

- Directory structure established
- Backend Express application initialized
- Frontend React + Vite application initialized
- Environment variable configuration in place
- No business features have been implemented yet

Feature development will proceed in explicitly defined, incremental phases.
