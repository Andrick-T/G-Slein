# G-Slein v1 - Frontend

React + Vite frontend for the G-Slein telemedicine consultation platform.

> Status: Core app shell, routing, and authentication flow are implemented. Most role-specific product modules are scaffolded and planned for Phase 8.

---

## Current Development State

Implemented now:

- App bootstrapped with React + Vite + Tailwind CSS
- Browser routing setup with public and protected routes
- Role-based access control for patient, doctor, and admin areas
- Authentication context with token persistence in localStorage
- API service wrapper for GET/POST/PUT/PATCH/DELETE requests
- Public pages: Home, Login, Register placeholder
- Error pages: Unauthorized and 404 Not Found
- Role dashboard routes and layouts (currently placeholder content)

Not yet implemented (planned in Phase 8):

- Full patient workflows (appointments, prescriptions, records, payments, reviews)
- Full doctor workflows
- Full admin management workflows
- Detailed reusable UI components per feature module

---

## Technology

- Framework: React 18
- Build tool: Vite 5
- Routing: React Router DOM
- Styling: Tailwind CSS v4 (via @tailwindcss/vite)
- Language: JavaScript / JSX

---

## Frontend Architecture (Current)

```text
src/
|- App.jsx                     BrowserRouter wrapper
|- main.jsx                    App entry with AuthProvider
|- index.css                   Tailwind import + global base styles
|- routes/
|  |- AppRoutes.jsx            Public/protected route map
|- context/
|  |- AuthContext.jsx          Auth state, login/logout, restore session
|- components/
|  |- auth/
|     |- ProtectedRoute.jsx    Route guard by auth + role
|- services/
|  |- api.js                   API base URL, token helpers, request client
|- layouts/
|  |- PublicLayout.jsx
|  |- PatientLayout.jsx
|  |- DoctorLayout.jsx
|  |- AdminLayout.jsx
|- pages/
|  |- public/Home.jsx
|  |- auth/Login.jsx
|  |- auth/Register.jsx
|  |- patient/PatientDashboard.jsx
|  |- doctor/DoctorDashboard.jsx
|  |- admin/AdminDashboard.jsx
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

- /patient (role: patient)
- /doctor (role: doctor)
- /admin (role: admin)

Fallback:

- - -> 404 page

Behavior:

- Unauthenticated users are redirected to /login
- Authenticated users without required role are redirected to /unauthorized

---

## Authentication and API Integration

Auth flow:

- Login sends credentials to /auth/login
- Returned token is saved under localStorage key: g_slein_token
- On app load, session restoration calls /auth/me
- Logout clears the token and user state

API client:

- Base URL from VITE_API_BASE_URL
- Default fallback: http://localhost:5000/api
- Adds Authorization: Bearer <token> when token exists
- Normalizes request errors with status and response payload

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

Set values in .env.

3. Start development server

```bash
npm run dev
```

Default local URL: http://localhost:5173

4. Build for production

```bash
npm run build
```

Build output directory: dist/

5. Preview production build

```bash
npm run preview
```

---

## Environment Variables

| Variable          | Description          | Default                   |
| ----------------- | -------------------- | ------------------------- |
| VITE_API_BASE_URL | Backend API base URL | http://localhost:5000/api |

Note: Only variables prefixed with VITE\_ are exposed to browser code.

---

## Notes for Ongoing Frontend Work

- Keep existing route and auth guard patterns consistent.
- Build feature modules incrementally on top of the current role-based layout structure.
- Reuse the API service wrapper for all backend communication.
- Preserve current working shell and avoid unnecessary refactors during Phase 8 delivery.
