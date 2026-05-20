- [x] Explore current dashboard dependencies and backend endpoints for quotes/signals.

- [x] Rebuild `frontend/src/pages/Dashboard.jsx` state management (partial).

- [x] Integrate websocket updates for signals using `frontend/src/services/websocket.js` (with safe fallback if backend WS isn’t present).

- [x] Remove fake ticker drift; fetch real quotes for multiple symbols.

- [ ] Normalize incoming WS signals to match `RecentSignalsTable` expectations. (not strictly needed if WS not available; currently limited to safe fallback)

- [ ] Improve loading/skeleton UX for chart/table (optional if time).
- [ ] Run frontend build/dev to verify dashboard renders and updates.

