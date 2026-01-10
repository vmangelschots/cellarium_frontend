# Cellarium Frontend - TODO List

## High Priority

### 1. Add Error Boundary Component
**Priority:** High  
**Effort:** Small (~30 min)  
**Impact:** Prevents full app crashes

Create `src/components/ErrorBoundary.jsx`:
```javascript
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>Oops! Something went wrong</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message || 'Unknown error'}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

Then wrap in `App.jsx`:
```javascript
<ErrorBoundary>
  <BrowserRouter>
    {/* existing routes */}
  </BrowserRouter>
</ErrorBoundary>
```

---

### 2. Replace alert() with Material-UI Snackbar
**Priority:** High  
**Effort:** Medium (~1 hour)  
**Impact:** Better UX, consistent with design system

**Files to update:**
- `src/components/AddFlowModal.jsx` (4 alert calls)
- `src/pages/WineDetailPage.jsx` (potential alerts)
- Other components with error handling

**Create:** `src/components/ErrorSnackbar.jsx`
```javascript
import { Snackbar, Alert } from '@mui/material';

export default function ErrorSnackbar({ open, message, severity = 'error', onClose }) {
  return (
    <Snackbar 
      open={open} 
      autoHideDuration={6000} 
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
```

**Usage pattern:**
```javascript
const [error, setError] = useState(null);

// In catch blocks:
catch (e) {
  setError(e.message);
}

// In render:
<ErrorSnackbar 
  open={!!error} 
  message={error} 
  onClose={() => setError(null)} 
/>
```

**Consider:** Creating a context/hook for global error state if needed across components.

---

## Medium Priority

### 3. Refactor AddFlowModal with useReducer
**Priority:** Medium  
**Effort:** Large (~3-4 hours)  
**Impact:** Much easier to maintain and extend

**Current problem:** 10+ state variables make the component hard to follow

**Approach:**
- Create `src/reducers/addFlowReducer.js` with state machine
- Replace individual useState calls with single useReducer
- Define clear actions: `SET_QUERY`, `SELECT_WINE`, `GO_TO_STEP`, `UPDATE_DRAFT`, `RESET`

**Benefits:**
- Easier to add new wizard steps
- Clearer data flow
- Easier to test state transitions
- Can extract business logic from component

**Example structure:**
```javascript
const initialState = {
  step: 'identify',
  query: '',
  results: [],
  loading: false,
  selectedWine: null,
  isNewWine: false,
  drafts: {
    newWine: { /* fields */ },
    bottle: { /* fields */ },
    memory: { /* fields */ }
  }
};

function flowReducer(state, action) {
  switch (action.type) {
    case 'SELECT_WINE':
      return { ...state, selectedWine: action.payload, step: 'intent' };
    // ... other actions
  }
}
```

---

### 4. Split WineDetailPage into Smaller Components
**Priority:** Medium  
**Effort:** Medium (~2 hours)  
**Impact:** Better maintainability, reusability, testability

**Current file:** `src/pages/WineDetailPage.jsx` (350+ lines)

**Suggested components:**
1. `src/components/WineHeader.jsx` - Wine title, image, back button, edit controls
2. `src/components/WineStats.jsx` - Stats display (in stock, consumed, etc.)
3. `src/components/BottlesList.jsx` - Table/list of bottles with filtering
4. `src/components/AddBottleForm.jsx` - Form for adding new bottles

**WineDetailPage becomes:**
```javascript
export default function WineDetailPage() {
  const { id } = useParams();
  const [wine, setWine] = useState(null);
  const [bottles, setBottles] = useState([]);
  
  // Data fetching logic
  
  return (
    <Container>
      <WineHeader wine={wine} onEdit={handleEdit} />
      <WineStats bottles={bottles} />
      <BottlesList bottles={bottles} onConsume={handleConsume} onUndo={handleUndo} />
      <AddBottleForm wineId={id} onAdd={fetchBottles} />
    </Container>
  );
}
```

---

## Low Priority / Nice to Have

### 5. Add Loading Skeletons
**Priority:** Low  
**Effort:** Small (~1 hour)  
**Impact:** Polish, better perceived performance

**Files to update:**
- `src/pages/WinesPage.jsx`
- `src/pages/WineDetailPage.jsx`
- `src/pages/StoresPage.jsx`

**Create:** `src/components/skeletons/WineCardSkeleton.jsx`
```javascript
import { Card, CardContent, Stack, Skeleton } from '@mui/material';

export default function WineCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" height={100} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}
```

**Usage:**
```javascript
{loading ? (
  <Stack spacing={2}>
    {[1, 2, 3, 4].map(i => <WineCardSkeleton key={i} />)}
  </Stack>
) : (
  <WineList wines={wines} />
)}
```

---

### 6. Improve API Response Validation
**Priority:** Low  
**Effort:** Medium  
**Impact:** Catch API contract changes early

**Options:**
1. Add basic runtime checks in `src/api/http.js`
2. Use a validation library like Zod
3. Consider TypeScript migration (big effort, big payoff)

**Example with basic validation:**
```javascript
export function validateWine(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid wine data');
  if (!data.id || !data.name) throw new Error('Wine missing required fields');
  return data;
}

// In wineApi.js:
export async function getWine(id) {
  const data = await http(`/api/wines/${id}/`);
  return validateWine(data);
}
```

---

### 7. Consider TypeScript Migration
**Priority:** Low  
**Effort:** Very Large (ongoing effort)  
**Impact:** Long-term type safety, better DX

**Rationale:**
- Catch bugs at compile time
- Better IDE autocomplete
- Self-documenting API contracts
- Easier refactoring

**Incremental approach:**
1. Rename `.jsx` to `.tsx` file by file
2. Start with API layer (`src/api/*`)
3. Add types for components gradually
4. Use `// @ts-check` in JS files as intermediate step

---

## Completed ✅

- ✅ Extract `todayISODate()` helper to `src/utils/date.js`
- ✅ Make FAB button context-aware (opens AddFlowModal at correct step based on route)

---

## Notes

- All high-priority items are **quick wins** that improve stability
- Medium-priority items are **refactorings** that will make future development easier
- Low-priority items are **polish** and nice-to-haves

**Recommended order:**
1. Error Boundary (prevents crashes)
2. Replace alert() (UX improvement)
3. AddFlowModal refactor (technical debt)
4. Split WineDetailPage (technical debt)
5. Everything else as time permits
