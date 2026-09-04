# MyDuka Frontend

MyDuka Frontend is the React + Vite client for a role-based inventory and operations dashboard used by merchants, store admins, and clerks. The app enforces access by role, uses a JWT-style session stored in local storage, and connects to the MyDuka backend API for authentication, member management, and inventory workflows.



## Overview

This frontend focuses on the user experience for a multi-role retail workflow:

- Merchants manage the business and invite/store admins
- Admins manage clerks and review stock-related activity
- Clerks handle stock intake, spoilage reporting, and supply requests

The app is organized around protected routes, shared layout navigation, and modular pages. It is designed to work with a real backend while also supporting a demo login flow for local development.

## Tech stack

- React 19
- Vite 8
- React Router
- Fetch-based API layer with bearer token auth
- Vitest + Testing Library
- ESLint
- Sonner for toast notifications

## Prerequisites

Before running the project, make sure you have:

- Node.js 18 or newer
- npm or another Node package manager
- A running MyDuka backend on the expected API URL

## Quick start

From the project root:

```bash
cd Myduka-frontend
npm install
```

Create a local environment file if you want to point the app at a different backend:

```bash
cat > .env <<'EOF'
VITE_API_URL=http://127.0.0.1:8000/api
EOF
```

If you do not set `VITE_API_URL`, the app defaults to:

```text
http://127.0.0.1:8000/api
```

Start the dev server:

```bash
npm run dev
```

Then open:

```text
http://localhost:5173/
```

## Default demo accounts

The app includes demo account entries used for login and role testing.

| Role | Email | Password | Purpose |
| --- | --- | --- | --- |
| Merchant | merchant@myduka.com | password123 | Business owner / oversight roles |
| Admin | admin@myduka.com | password123 | Store operations / clerk management |
| Clerk | clerk@myduka.com | password123 | Stock updates and warehouse tasks |

These credentials are useful as a reference for the expected backend login values and for verifying role-specific navigation during local development.

## Authentication and session flow

Authentication is handled through the API client in `src/lib/api.js` and the auth provider in `src/lib/auth.jsx`.

The app:

- calls `/token/` to sign in
- stores the returned access token and user data in browser local storage under `myduka_session`
- restores the session on page reload
- redirects users to the correct dashboard based on role
- blocks access to pages the user is not allowed to view

The default role mapping is:

- `merchant` -> `/merchant`
- `admin` -> `/admin`
- `clerk` -> `/clerk`

## Role-based routes

The application routes are defined in `src/App.jsx`.

### Merchant routes

- `/merchant` - Merchant dashboard
- `/merchant/admins` - Admin management and invitations

### Admin routes

- `/admin` - Store overview dashboard
- `/admin/clerks` - Clerk management
- `/admin/received` - Received stock review
- `/admin/unpaid` - Unpaid stock/payment tracking
- `/admin/supply` - Supply request management

### Clerk routes

- `/clerk` - Clerk workspace dashboard
- `/clerk/stock` - Stock levels and inventory info
- `/clerk/receive-stock` - Stock receiving workflow
- `/clerk/spoilage` - Spoilage tracking
- `/clerk/supply-requests` - Create and review supply requests

### Public routes

- `/` - Redirects to the correct dashboard or login screen
- `/login` - Login form
- `/admin/register` - Admin account registration
- `/accept-invite` - Invite acceptance flow

## Application structure

```text
Myduka-frontend/
├── public/                  # Static assets and public files
├── src/
│   ├── components/          # Reusable UI pieces such as nav, cards, and layout
│   ├── context/             # App context and demo user state
│   ├── hooks/               # Small custom hooks
│   ├── lib/                 # API client, auth helpers, and shared utilities
│   ├── pages/               # Screens by role and workflow
│   ├── services/            # Service wrappers and domain-specific API clients
│   ├── styles/              # Global CSS and module styles
│   ├── App.jsx              # Route definitions and role guards
│   ├── main.jsx             # App bootstrap and router setup
│   └── index.css            # Base styling
├── config.js                # App-level defaults, e.g. API URL and app name
├── eslint.config.js         # ESLint configuration
├── index.html               # Vite entry file
├── package.json             # Scripts and dependencies
├── vite.config.js           # Vite setup
├── vitest.config.js         # Vitest setup
├── dockerfile               # Container build config
├── nginx.conf               # Nginx config
├── README.md                # Project documentation
└── .gitignore
```

## Backend integration notes

This frontend expects a MyDuka backend with endpoints similar to those used in the API layer:

- `/token/` for login
- `/accounts/invites/` and related invite endpoints
- `/accounts/members/` for admin/clerk management
- store- and stock-related endpoints used by the app screens

If the backend is not available, the app may fail with a message like:

```text
Cannot reach the MyDuka server. Is the Django backend running?
```

In that case, ensure the backend is running and that `VITE_API_URL` points to the correct host and port.

## Available scripts

```bash
npm run dev       # launch the Vite development server
npm run build     # create a production build
npm run preview   # preview the production build locally
npm run test      # run the Vitest suite
npm run lint      # run ESLint checks
```

## Testing

The project includes unit and component tests for the login flow and core frontend behavior.

Run:

```bash
npm run test
```

## Development tips

- Keep all route-level access restrictions in `src/App.jsx` and `src/lib/auth.jsx`.
- Use the role-based page structure to keep features separated by user responsibility.
- Prefer adding reusable UI pieces to `src/components/` instead of duplicating markup.
- If you change the backend contract, update the API helpers in `src/lib/api.js` to match.

## Troubleshooting

### Cannot reach the server

- Check that the backend is running
- Confirm `VITE_API_URL` is set correctly
- Verify the API host is reachable from the browser environment

### Redirected unexpectedly

- The app redirects unauthenticated users to `/login`
- Users without the required role are redirected to their home dashboard

### Session not persisting

- Session data is stored in browser local storage
- Clear the stored `myduka_session` key in devtools if you need to reset login state

## Notes

This project is a frontend application intended to support the full MyDuka operational flow. It is best used alongside the corresponding backend service, which provides authentication, invitation management, and inventory data. The current front-end layer is structured to make that backend integration straightforward and maintainable.

## Contributors
- Kelvin Tullo
- Gabriel Ngige
- Elias Kosh
- Joshua Mbili
- George Njenga