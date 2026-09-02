# MyDuka Frontend

MyDuka is a role-based inventory management dashboard for merchants, administrators, and clerks. This frontend is built with React + Vite and uses a local demo data layer so the app can be explored without a backend.

## Features

- Merchant dashboard for inviting and managing store admins
- Admin dashboard for managing clerks and store operations
- Clerk dashboard for recording stock activity
- Demo-mode authentication using local storage
- Protected routes based on user role
- Inventory, stock, and supply request interfaces

## Local demo accounts

The app ships with demo users in the local mock API.

- Merchant: merchant@myduka.com / password123
- Admin: admin@myduka.com / password123
- Clerk: clerk@myduka.com / password123

## Getting started

1. Install dependencies
   npm install

2. Start the development server
   npm run dev

3. Open the app in your browser
   http://localhost:5173/

## Scripts

- npm run dev — start the Vite dev server
- npm run build — build for production
- npm run test — run the Vitest test suite
- npm run lint — run ESLint

## Testing

The project includes UI and API tests for core authentication flow.

Run:

npm run test

## Notes

This frontend is designed to work with a local demo store API in browser storage. If you connect it to a real backend later, replace the logic in src/lib/api.js with real network requests while keeping the same interface.
