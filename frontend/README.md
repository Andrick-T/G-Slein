# G-Slein v1 — Frontend

React + Vite frontend for the G-Slein telemedicine consultation platform.

> **Status:** Initial project foundation. No features have been implemented yet.

---

## Technology

- **Framework:** React 18
- **Build tool:** Vite
- **Language:** JavaScript / JSX

---

## Source Directory Structure

```
src/
├── assets/              Static assets (images, fonts, icons)
├── components/          Reusable UI components
│   ├── common/          Shared generic components (buttons, inputs, modals, etc.)
│   ├── layout/          Layout components (navbar, sidebar, footer, etc.)
│   ├── auth/            Authentication-related components
│   ├── doctor/          Doctor profile and listing components
│   ├── appointment/     Appointment booking and management components
│   ├── prescription/    Prescription components
│   ├── medical-record/  Medical record components
│   ├── review/          Doctor review and rating components
│   └── payment/         Payment flow components
├── layouts/             Page layout wrappers
├── pages/               Route-level page components
│   ├── auth/            Login, registration, password reset pages
│   ├── patient/         Patient dashboard and related pages
│   ├── doctor/          Doctor dashboard and related pages
│   ├── admin/           Admin dashboard and management pages
│   ├── public/          Publicly accessible pages (home, about, etc.)
│   └── errors/          Error pages (404, 500, unauthorized)
├── services/            API communication layer (HTTP clients)
├── hooks/               Custom React hooks
├── context/             React Context providers
├── routes/              Application routing configuration
├── utils/               Reusable frontend utility functions
├── App.jsx              Root application component
├── main.jsx             Application entry point
└── index.css            Global stylesheet
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your local values.

### 3. Start development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
```

The production build will be output to the `dist/` directory.

### 5. Preview production build

```bash
npm run preview
```

---

## Environment Variables

| Variable            | Description          | Default                     |
| ------------------- | -------------------- | --------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |

All Vite environment variables must be prefixed with `VITE_` to be accessible in the browser.
