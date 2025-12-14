# Quick Start - Using `jac serve app.jac`

This app uses a single `app.jac` file that contains both backend walkers and frontend client code.

## Running the App

You have two options:

### Option 1: Single Command (Recommended)
```bash
npm run serve:all
```

This runs both servers in one terminal using `concurrently`.

### Option 2: Two Separate Terminals

**Terminal 1: Backend Server**
```bash
jac serve app.jac
```

This will:
- Start the backend API server on port 8000
- Register all backend walkers (create_user, get_dashboard, etc.)
- Make walkers available at `/walker/{walker_name}`

**Terminal 2: Frontend Server**
```bash
npm run dev
```

This will:
- Start the Vite dev server on port 5173
- Serve the frontend React UI
- Proxy API calls to the backend on port 8000

## Access the App

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:8000/walker/{walker_name}

## Why Two Servers?

The `app.jac` file contains:
- **Backend walkers** (server-side) - served by `jac serve app.jac` on port 8000
- **Frontend client code** (`cl` blocks) - needs to be bundled and served by Vite on port 5173

The frontend code imports React components from `src/` which need to be processed by Vite's bundler. That's why you need both:
- `jac serve app.jac` for the backend API
- `npm run dev` for the frontend UI

The Vite server automatically proxies API calls to the backend on port 8000.

## Verify Walkers are Registered

After starting the server, you can check available walkers:
```bash
curl http://localhost:8000/walkers
```

You should see walkers like:
- create_user
- get_dashboard
- get_next_lesson
- generate_quiz
- etc.

## Troubleshooting

If you get 404 errors for walkers:
1. Make sure you're running `jac serve app.jac` from the project root
2. Check that the server output shows "Available endpoints" with walker endpoints
3. Verify the walkers are defined in `app.jac` (they start at line 59)

## Environment Variables

If using AI features, set:
```bash
export GEMINI_API_KEY=your-key-here
```

Or create `backend/.env`:
```
GEMINI_API_KEY=your-key-here
```

## Project Structure

```
JASECI_APP_FINAL/
├── app.jac              # All-in-one: backend walkers + frontend code
├── src/                  # React components and API code (imported by app.jac)
│   ├── components/      # React components
│   ├── api.js           # API client
│   └── styles.css       # Styles
└── backend/             # Backend utilities (optional, not needed for jac serve)
    └── main.jac         # Duplicate backend code (not used when using app.jac)
```

**Note**: The `backend/main.jac` file is a duplicate and not needed when using `jac serve app.jac`. All backend walkers are in `app.jac`.

