# G-Slein v1

Telemedicine consultation platform built with a Node.js/Express backend and a React/Vite frontend.

> Status: The core app is already implemented across both layers. The project includes real authentication, role-based protected routing, patient/doctor/admin dashboards, domain feature pages, and wired backend APIs for the main telemedicine workflows.

---

## Overview

G-Slein v1 is a working telemedicine platform covering the main healthcare journeys for:

- Patients: doctor discovery, appointment booking, clinical records, prescriptions, payments, and reviews
- Doctors: appointment management, patient oversight, consultation workflow, and history
- Admins: doctor management, user oversight, appointment monitoring, payment tracking, and review oversight

The backend exposes domain-specific API modules and the frontend has implemented page flows for each major role and feature area rather than only a shell.

---

## Current Implementation Status

### Backend

Location: [backend](backend)

Implemented modules include:

- Express API with health checks and centralized error handling
- Authentication and session flow with JWT
- Role-aware middleware for patient, doctor, and admin access
- API routes for:
  - users
  - doctors
  - appointments
  - medical records
  - prescriptions
  - payments
  - reviews
  - consultations
- Database seeder support for bootstrapping local data

### Frontend

Location: [frontend](frontend)

Implemented frontend features include:

- React + Vite app shell with router setup
- Authentication context, token persistence, and session restore
- Protected role-based routing for patient, doctor, and admin workspaces
- Public pages for home, login, registration, unauthorized access, and not found
- Functional dashboard screens for each role
- Patient feature pages for:
  - profile
  - doctor discovery and detail views
  - booking and confirmation flow
  - appointments and appointment details
  - medical records and record details
  - prescriptions and prescription details
  - payments and payment details
  - reviews
- Doctor feature pages for:
  - appointments
  - appointment details
  - patient list
  - consultation workflow
  - history
- Admin feature pages for:
  - dashboard summary
  - users
  - doctors and doctor detail views
  - appointments
  - payments
  - reviews

The UI design reference remains useful for styling consistency:

- [frontend/docs/UI_VISUAL_SYSTEM.txt](frontend/docs/UI_VISUAL_SYSTEM.txt)

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
|- docs/         Project docs and architecture references
|- text.txt
|- README.md
```

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

Create the environment file and set the required values, then run:

```bash
npm run dev
```

Backend default URL:

- `http://localhost:5000`
- API base path: `http://localhost:5000/api`

Useful scripts:

- `npm run dev` - start with nodemon
- `npm start` - production mode
- `npm run seed` - populate local data

### 2) Frontend setup

```bash
cd frontend
npm install
```

Configure the frontend environment file, then run:

```bash
npm run dev
```

Frontend default URL:

- `http://localhost:5173`

Useful scripts:

- `npm run dev` - start the dev server
- `npm run build` - build for production
- `npm run preview` - preview the build

---

## Current Delivery Snapshot

Completed:

- Full backend domain coverage for telemedicine operations
- JWT auth and role-based access control
- Frontend authentication and session handling
- Protected patient, doctor, and admin app areas
- Functional doctor booking, consultation, records, payment, prescription, review, and admin management flows
- Documentation and UI guidance baseline for ongoing refinement

Current focus:

- Final QA and edge-case validation
- UX polish and visual consistency tuning
- Production hardening, data validation, and refinements based on real usage
