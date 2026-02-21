# MyPills React Client App

This is a React SPA integrated with the MyPills ASP.NET Core application.

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm

### Installation

Navigate to the ClientApp folder and install dependencies:

```bash
cd ClientApp
npm install
```

### Development

To run the React app in development mode:

```bash
npm run dev
```

The app will run on http://localhost:5173 and proxy API requests to the ASP.NET Core backend.

### Build

To build the React app for production:

```bash
npm run build
```

The built files will be output to the `dist` folder.

## Structure

- `/src/main.jsx` - Entry point
- `/src/App.jsx` - Main app component with routing
- `/src/pages/` - Page components
  - `Home.jsx` - Public home page
  - `Test.jsx` - Protected test page
- `/src/components/` - Reusable components
  - `Layout.jsx` - App layout with navigation
  - `ProtectedRoute.jsx` - Route protection wrapper
- `/src/contexts/` - React contexts
  - `AuthContext.jsx` - Authentication state management

## Authentication

The app uses cookie-based authentication provided by ASP.NET Core Identity:

- Authentication status is checked via `/api/auth/status`
- Login redirects to `/Identity/Account/Login`
- Protected routes automatically redirect unauthenticated users to login
- Session is maintained via HTTP cookies

## Accessing the App

When running with the ASP.NET Core app, access the React SPA at:

```
https://localhost:7130/app
```

## Routes

- `/app` - Home page (public)
- `/app/test` - Test page (requires authentication)


