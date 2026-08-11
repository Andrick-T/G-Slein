# G-Slein v1 — Backend

Node.js + Express.js REST API for the G-Slein telemedicine consultation platform.

> **Status:** Initial project foundation. No features have been implemented yet.

---

## Technology

- **Runtime:** Node.js (≥ 18)
- **Framework:** Express.js
- **Module system:** ES Modules (`import` / `export`)
- **Environment:** dotenv

---

## Source Directory Structure

```
src/
├── config/        Application and infrastructure configuration
├── models/        Database models
├── controllers/   Request/response controllers
├── routes/        API route definitions
├── middleware/    Express middleware (auth, error handling, etc.)
├── validators/    Request validation schemas and rules
├── utils/         Reusable backend utility functions
├── seeders/       Database seed scripts
├── docs/          Backend and API documentation assets
├── app.js         Express application setup
└── server.js      HTTP server entry point
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

The server will start on `http://localhost:5000` (or the port set in `.env`).

### 4. Start production server

```bash
npm start
```

---

## Environment Variables

See [`.env.example`](.env.example) for all available environment variables and their descriptions.

---

## Health Check

```
GET http://localhost:5000/
```

Returns:

```json
{ "status": "ok", "message": "G-Slein v1 API is running." }
```
