# G-Slein v1 - Frontend

React + Vite frontend for the G-Slein telemedicine platform.

> Status: The frontend is already implementing a complete role-based telemedicine experience, including real dashboard modules, protected routes, and the major patient, doctor, and admin workflows.

---

## Current Frontend Scope

Implemented now:

- React + Vite app bootstrapped with Tailwind styling
- Browser router with public and protected routes
- Role-based auth guards for patient, doctor, and admin users
- Authentication context with token persistence and session restore
- Shared API client for authenticated backend requests
- Public routes: home, login, register, unauthorized, and 404
- Role dashboards and feature-rich management screens

### Patient workflow

The patient experience includes:

- dashboard and profile management
- doctor browsing and doctor profile details
- appointment booking and confirmation
- appointment list and detail views
- medical record browsing and detail views
- prescription tracking and detail views
- payment overview and detail pages
- review workflow

### Doctor workflow

The doctor experience includes:

- dashboard overview with scheduling metrics
- appointment list and detail views
- patient directory
- consultation workflow
- historical records and appointment history

### Admin workflow

The admin experience includes:

- platform overview dashboard
- user management
- doctor management and detail pages
- appointment oversight
- payment monitoring
- review monitoring

---

## Technology

- Framework: React 18
- Build tool: Vite 5
- Routing: React Router DOM
- Styling: Tailwind CSS v4
- Language: JavaScript / JSX

---

## Frontend Architecture

```text
src/
|- App.jsx                     BrowserRouter wrapper
|- main.jsx                    App entry with AuthProvider
|- index.css                   Tailwind import + global base styles
|- routes/
|  |- AppRoutes.jsx            Public/protected role-based route map
|- context/
|  |- AuthContext.jsx          Auth state, login/logout, restore session
|- components/
|  |- auth/
|     |- ProtectedRoute.jsx    Route guard by auth + role
|  |- common/
|     |- Button.jsx
|     |- Card.jsx
|     |- EmptyState.jsx
|     |- Input.jsx
|     |- Spinner.jsx
|     |- StatusBadge.jsx
|- services/
|  |- api.js                   API client with token-aware requests
|- layouts/
|  |- PublicLayout.jsx
|  |- PatientLayout.jsx
|  |- DoctorLayout.jsx
|  |- AdminLayout.jsx
|- pages/
|  |- public/Home.jsx
|  |- auth/Login.jsx
|  |- auth/Register.jsx
|  |- patient/*                Complete patient workflow pages
|  |- doctor/*                 Complete doctor workflow pages
|  |- admin/*                  Complete admin workflow pages
|  |- errors/Unauthorized.jsx
|  |- errors/NotFound.jsx
```

---

## Routing Summary

Public routes:

- /
- /login
- /register
- /unauthorized

Protected routes:

- /patient
- /doctor
- /admin

Nested feature routes are implemented for each role and include dashboard subpages for appointments, records, payments, reviews, consultations, and management tools.

Behavior:

- Unauthenticated users are redirected to /login
- Authenticated users without the required role are redirected to /unauthorized

---

## Authentication and API Integration

Auth flow:

- Login sends credentials to /auth/login
- Returned token is stored in localStorage under the key `g_slein_token`
- Session restore calls /auth/me on app startup
- Logout clears the stored session and user state

API client:

- Reads base URL from `VITE_API_BASE_URL`
- Default fallback: `http://localhost:5000/api`
- Adds `Authorization: Bearer <token>` automatically when a token is available
- Normalizes error payloads and request status details

---

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

3. Start the dev server

```bash
npm run dev
```

Default local URL:

- `http://localhost:5173`

4. Build for production

```bash
npm run build
```

5. Preview the production build

```bash
npm run preview
```

---

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| VITE_API_BASE_URL | Backend API base URL | http://localhost:5000/api |

Only variables prefixed with `VITE_` are exposed to browser code.

---

## Current Notes

- The frontend is already beyond a routing-only prototype.
- The existing role-based structure is being used to support real product flows rather than placeholder screens.
- Future work is focused on validation, polish, and hardening rather than basic feature scaffolding.
