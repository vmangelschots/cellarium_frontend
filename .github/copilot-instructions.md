# Cellarium Frontend - AI Coding Agent Instructions

## Project Overview

**Cellarium** is a React + Vite wine collection management app with authentication. Users catalog wines, track bottles, and manage stores. The frontend connects to a Django REST API backend.

**Stack**: React 19, Vite, Material-UI 7, React Router 7, Emotion for styling

## Architecture

### Core Data Flow
1. **Pages** (WinesPage, WineDetailPage, StoresPage, LoginPage) fetch data via API layer
2. **API Layer** (`src/api/`) handles HTTP requests, auth tokens, and error handling
3. **AppShell** layout manages navigation (Wines/Stores tabs) and the add-flow modal
4. **Components** are UI building blocks (AddFlowModal, WineGlassRating, AuthListener)
5. **AddFlowModal** is a complex wizard (identify wine → choose intent → collect data) that orchestrates wine creation and bottle tracking in a single flow

### Key Files & Responsibilities
- **[src/api/http.js](src/api/http.js)** - Fetch wrapper with auto-refresh logic (401 → refresh token → retry)
- **[src/api/auth.js](src/api/auth.js)** - Token storage (localStorage), login, token refresh, auth events
- **[src/api/wineApi.js](src/api/wineApi.js)** - Wine/bottle CRUD operations
- **[src/api/storeApi.js](src/api/storeApi.js)** - Store list and creation
- **[src/pages/WinesPage.jsx](src/pages/WinesPage.jsx)** - Main wine list with search and stats
- **[src/layout/AppShell.jsx](src/layout/AppShell.jsx)** - Top bar, tabs, floating add button
- **[src/components/AddFlowModal.jsx](src/components/AddFlowModal.jsx)** - Multi-step wizard for adding wines/bottles with search-first UX
- **[src/theme.js](src/theme.js)** - Dark theme (burgundy primary, dark backgrounds)

### Authentication Flow
- Tokens stored in localStorage (keys: `cellarium_access`, `cellarium_refresh`)
- **AuthListener** component watches for `auth:required` events and redirects to `/login`
- `http()` attaches `Authorization: Bearer <token>` header to all requests
- 401 responses trigger silent token refresh (via refresh endpoint) and automatic retry
- On refresh failure, tokens are cleared and auth event fires

## Development Workflow

### Build & Run
```bash
cd cellarium
npm run dev      # Start Vite dev server (HMR enabled)
npm run build    # Production build
npm run lint     # ESLint check (no fix by default)
npm run preview  # Preview production build locally
```

### Environment Setup
- Create `.env.local` in `cellarium/` directory for `VITE_API_BASE_URL` (defaults to `http://localhost:8000`)
- Example: `VITE_API_BASE_URL=http://api.local:8000`

### Common Tasks
- **Adding a page**: Create file in `src/pages/`, add route in [App.jsx](src/App.jsx)
- **Adding a component**: Create in `src/components/`, follow existing naming (PascalCase)
- **Adding an API endpoint**: Create function in `src/api/wineApi.js` (or new api file), use `http()` helper
- **Styling**: Use Material-UI components + Emotion (`@emotion/styled`), avoid inline CSS

## Code Patterns & Conventions

### React Patterns
- **Functional components** only (no class components)
- **Hooks** for state management: `useState`, `useEffect`, `useMemo`, `useCallback`
- **React Router v7**: `useNavigate()`, `useLocation()`, `<Link>` for nav
- No global state management (Context not used); data flows from API calls in pages

### API Patterns
- Import `{ http, asList }` from `src/api/http.js` (asList normalizes payload objects to arrays)
- Conditionally build request bodies to omit null/undefined fields:
  ```javascript
  const body = {};
  if (name != null) body.name = name;  // Only add if provided
  ```
- Always use `params` object for query strings, not URL string interpolation:
  ```javascript
  // Good: http(`/api/bottles/`, { params: { wine: id } })
  // Avoid: http(`/api/bottles/?wine=${id}`)
  ```
- Wrap async operations with try/catch in components; API errors have `.status` and `.data` properties

### Material-UI Conventions
- Use `sx` prop for styling (Emotion integration): `sx={{ color: 'red', mt: 2 }}`
- Responsive props: `sx={{ fontSize: { xs: '12px', sm: '14px' } }}`
- Use Material-UI components: Box, Button, Card, TextField, Stack, Typography
- Icons from `@mui/icons-material` (SearchIcon, ChevronRightIcon, etc.)

### Component Data Fetching
- Fetch data in `useEffect` on page/component mount
- Set loading state during fetch, handle errors gracefully
- Use `useMemo` for expensive filtering/transformations:
  ```javascript
  const filtered = useMemo(() => {
    return wines.filter(w => w.name.includes(searchQuery));
  }, [wines, searchQuery]);
  ```

### Common Helpers
- **Date formatting**: Use `todayISODate()` helper for YYYY-MM-DD format (no timezone surprises):
  ```javascript
  function todayISODate() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  ```
- **Images**: Reference public images via `/images/filename.png` (served from `public/images/`)

## Testing & Linting

**ESLint rules** (flat config format):
- Enforces React Hooks rules (react-hooks plugin)
- Allows unused vars if they start with uppercase (for destructured but unused imports)
- Uses `defineConfig` and `globalIgnores` from eslint 9.x
- No test files in project currently

## Integration Points

### Backend API (Django REST)
- **Base URL** from env var `VITE_API_BASE_URL` (default: `http://localhost:8000`)
- **Auth**: POST `/api/auth/token/` (returns `{ access, refresh }`)
- **Token refresh**: POST `/api/auth/token/refresh/` (returns `{ access }`)
- **Wines**: GET/POST `/api/wines/` (list/create wines)
- **Bottles**: GET/POST `/api/bottles/` (list/add bottles by `wine` param)
- **Stores**: GET/POST `/api/stores/` (list/create stores for tracking purchase locations)
- Response format: objects or paginated `{ results: [...], count, ... }` (asList handles both)

### External Dependencies
- **React Router**: Client-side routing, `useNavigate`, route protection via AuthListener
- **Material-UI**: Full component library with theming
- **Vite**: Fast dev server, ESM-only, no CommonJS
- **react-icons**: Fallback icon library (rarely used, MUI icons preferred)

## Debugging Tips

- **Token issues**: Check localStorage keys (`cellarium_access`, `cellarium_refresh`) in DevTools
- **API errors**: Look at network tab in DevTools; check backend logs for 401/403/5xx
- **Auth redirect loops**: Verify AuthListener doesn't redirect while already on /login
- **HMR issues**: Restart dev server if components don't hot-reload after changes
