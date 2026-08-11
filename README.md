# G-Slein v1

Telemedicine consultation platform (MERN-style architecture) with a Node.js/Express API and React/Vite frontend.

> Status: Core backend API modules are implemented and wired. Frontend has routing/auth shell implemented, with most role-specific product UIs scaffolded for Phase 8 completion.

---

## Overview

G-Slein v1 provides the base for:

- User authentication and role-based access (patient, doctor, admin)
- Doctor discovery and profile management
- Appointment workflows
- Consultations, prescriptions, medical records, payments, and reviews

Backend endpoints for these domains exist and are integrated into the API router. Frontend currently includes public pages, authentication flow, protected routing, and role layout shells.

---

## Technology Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Backend  | Node.js, Express.js, MongoDB (Mongoose), JWT    |
| Frontend | React 18, Vite 5, React Router, Tailwind CSS v4 |
| Language | JavaScript / JSX                                |

---

## Repository Structure

```text
G-slein-v1/
|- backend/      Node.js + Express REST API
|- frontend/     React + Vite web application
|- docs/         Project-level documentation
|- text.txt
|- README.md
```

### Backend (current state)

Location: [backend](backend)

Implemented:

- Express app with global middleware, health/root endpoints, and centralized error handling
- JWT auth (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- Role-aware route protection (patient/doctor/admin)
- API modules mounted for:
  - users
  - doctors
  - appointments
  - consultations
  - medical records
  - prescriptions
  - payments
  - reviews
- Seed script available (`npm run seed`)

### Frontend (current state)

Location: [frontend](frontend)

Implemented:

- React app shell with BrowserRouter
- Auth context with token persistence and session restore
- Protected routes by role
- Public routes: home, login, register placeholder, unauthorized
- Role route shells: patient, doctor, admin dashboards (placeholders for Phase 8 feature UIs)
- API client wrapper with Bearer token support

Frontend visual guidance reference:

- [frontend/docs/UI_VISUAL_SYSTEM.txt](frontend/docs/UI_VISUAL_SYSTEM.txt)

### Project Docs

Location: [docs](docs)

Areas:

- [docs/architecture](docs/architecture)
- [docs/api](docs/api)
- [docs/database](docs/database)
- [docs/setup](docs/setup)

---

## Local Development

### Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB instance (local or remote)

### 1) Backend setup

```bash
cd backend
npm install
```

Create env file from `.env.example` and set required values (especially database and JWT settings), then run:

```bash
npm run dev
```

Backend default URL: `http://localhost:5000`
API base path: `http://localhost:5000/api`

Useful backend scripts:

- `npm run dev` - start with nodemon
- `npm start` - start production mode
- `npm run seed` - run database seeder

### 2) Frontend setup

```bash
cd frontend
npm install
```

Create env file from `.env.example` and set frontend env values, then run:

```bash
npm run dev
```

Frontend default URL: `http://localhost:5173`

Useful frontend scripts:

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run preview` - preview production build

---

## Current Delivery Snapshot

Completed:

- Backend service foundation and domain route wiring
- JWT authentication and authorization middleware
- Frontend auth + route protection flow
- Core repository structure and docs scaffolding

In progress / next (Phase 8 focus):

- Full frontend feature implementation for patient/doctor/admin workflows
- UI completion for appointments, consultations, records, prescriptions, payments, and reviews
- Final UX polish and consistency against the visual system reference
