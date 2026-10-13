# Authentication and roles (frontend)

The frontend controls what each person *sees*. It cannot control what they are *allowed to do*:
**the backend must authenticate and authorise every request.** Route guards here are a courtesy, not security.

## How it works

| Piece | File |
| --- | --- |
| Session state, `login / register / logout / refreshUser` | `src/context/AuthProvider.jsx`, used through `useAuth()` (`src/hooks/useAuth.js`) |
| API calls for auth | `src/services/authService.js` |
| Axios instance, 401/403 handling, error text | `src/services/api.js` |
| Route guards | `src/routes/PublicRoute.jsx`, `ProtectedRoute.jsx`, `RoleProtectedRoute.jsx` |
| Roles, home page per role | `src/utils/roles.js` |
| Navigation per role | `src/config/navigation.js` |
| Dev-only fake backend | `src/services/mock/mockAuthAdapter.js` |

- The signed-in user is held **in memory only**. On every page load the app asks the server who you are (`GET /auth/me`),
  so nothing in `localStorage` / `sessionStorage` can be edited to change a role. While that check runs, protected pages
  show a loader instead of flashing.
- Passwords are never stored anywhere in the browser. They are sent once, over HTTPS, to the login endpoint.
- Public registration never sends a role. The server must always create these accounts as `FARMER`.
  `EXPERT`, `OFFICER` and `ADMIN` accounts must be created or approved by an administrator in the backend.
- Any `401` from a non-auth endpoint signs the user out and shows "Your session has ended" on the login page.
  A `403` sets `error.isForbidden` and the message "You do not have permission to do that."
- Unauthenticated visitors to a protected URL are sent to `/login` and returned to that URL after signing in
  (only if it belongs to their own role area).

## Session approach: HttpOnly cookie (recommended)

`api.js` uses `withCredentials: true`, so the browser sends the session cookie and JavaScript never sees it.
Backend requirements:

- `Set-Cookie: ...; HttpOnly; Secure; SameSite=Lax` (or `Strict`). "Remember me" = a persistent cookie; otherwise a session cookie.
- CORS: allow the frontend origin explicitly and `Access-Control-Allow-Credentials: true` (no `*`).
- Because cookies are sent automatically, protect state-changing requests against CSRF (`SameSite` plus a CSRF token or origin check).
- Logout must invalidate the session on the server and clear the cookie.

**If the backend uses bearer tokens instead:** a token in JavaScript-readable storage can be stolen by any XSS bug.
If you must, keep the access token in memory only, make it short-lived, and renew it from an HttpOnly refresh cookie.
Do not put a long-lived token in `localStorage`. This would require changing `api.js` (an `Authorization` header) and `authService.js`.

## Endpoints the backend still needs to provide

None exist yet (the `backend/` folder is empty). The real adapter in `authService.js` expects:

| Method and path | Request | Response |
| --- | --- | --- |
| `POST /auth/login` | `{ email, password, rememberMe }` | `{ user }` + session cookie. Generic error for bad credentials; `429` when rate limited |
| `POST /auth/register` | `{ name, email, phone, password }` | `{ user }` (role `FARMER`) + session cookie. Field errors as `{ message, errors: { email: "..." } }` with `4xx` |
| `POST /auth/logout` | none | `204`. Invalidates the session |
| `GET /auth/me` | none | `{ user }` or `401` |
| `POST /auth/forgot-password` | `{ email }` | `200` whether or not the email exists |

`user` looks like `{ id, name, email, phone, role }` with `role` one of `FARMER | EXPERT | OFFICER | ADMIN`.
The server must validate every field again (email format, 10-digit mobile, password rules, duplicates).
Still to agree with the backend owner: reset-password completion (`POST /auth/reset-password`), email verification, and admin endpoints for approvals.

## Development mock

When running `npm run dev` with `VITE_USE_MOCK` not set to `false`, auth is served by `mockAuthAdapter.js`:
four demo accounts (one per role), a 5-attempt lockout, and in-memory registration. It is loaded behind
`import.meta.env.DEV`, so **production builds do not contain it** (checked by searching the built files for the demo emails).
To use a real backend in development, set `VITE_USE_MOCK=false` in `.env`. Nothing else needs to change.
