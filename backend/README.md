# CropShield AI — Backend

Node.js + Express + PostgreSQL (Prisma). Auth uses an HttpOnly cookie, as the frontend expects (see `frontend/AUTH.md`).

## Setup (Git Bash on Windows)

```
cd backend
npm install
cp .env.example .env        # then fill in DATABASE_URL, JWT_SECRET, SEED_DEMO_PASSWORD
npx prisma migrate dev      # creates/updates the tables (safe: never resets data unless you confirm)
npm run seed                # demo Farmer / Expert / Officer / Admin accounts (development only)
npm run dev                 # http://localhost:5000/api/health
```

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## Endpoints implemented

| Method + path | Who | Notes |
|---|---|---|
| GET `/api/health` | anyone | server + database check |
| POST `/api/auth/register` | anyone | body `{name,email,phone,password}`, always creates a FARMER |
| POST `/api/auth/login` | anyone | body `{email,password,rememberMe}`, sets cookie |
| POST `/api/auth/logout` | anyone | clears cookie, 204 |
| GET `/api/auth/me` | logged in | `{user}` |
| POST `/api/auth/forgot-password` | anyone | always 200, sends no email yet |
| POST `/api/reports` | FARMER | create a report: multipart form with a photo (AI results added in Phase E) |
| GET `/api/reports` | logged in | `?search=&status=&crop=&sort=`. Farmers: own reports only. Staff: all |
| GET `/api/reports/crops` | logged in | distinct crops, for the My Reports filter |
| GET `/api/reports/:id` | logged in | `:id` looks like `rpt-0012`. Someone else's report returns 404 |
| PATCH `/api/reports/:id` | FARMER (owner) | only `notes` can be changed |
| GET `/api/reports/:id/detection` | logged in | AI result in the shape of the Detection Result screen; includes `isMock` |
| POST `/api/reports/:id/predict` | FARMER (owner) | re-run a Pending/Failed analysis (409 if already Completed) |

### Create report: request (multipart/form-data)

A photo cannot travel inside JSON, so the form is sent as `multipart/form-data`:

| Field | Value |
|---|---|
| `crop`, `growthStage` | required text (same lists as the frontend) |
| `variety`, `notes`, `symptomStart` | optional text (`symptomStart` like `2026-10-15`) |
| `symptoms` | JSON string, e.g. `["Brown or black spots"]` |
| `location` | JSON string, e.g. `{"lat":19.12,"lng":72.85}` |
| `image` | required file: JPG, PNG or WebP, max 5 MB (real file type is checked, not just the extension) |

```
curl -b cookies.txt -X POST http://localhost:5000/api/reports -F "crop=Tomato" -F "growthStage=Flowering" -F 'symptoms=["Brown or black spots"]' -F 'location={"lat":19.12,"lng":72.85}' -F "image=@leaf.jpg"
```
Response `201`: `{ "report": { "id": "rpt-0001", "imageUrl": "https://...", ... } }`

## Image storage

Photos are never stored in PostgreSQL, only the URL and an id.

- **Cloudinary**: used when `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are all set in `.env`.
- **Local fallback** (development only): without those keys, photos are saved in `backend/uploads/` and served at `/uploads/...`. The server prints which mode it is using on startup. The server refuses to start in production without Cloudinary keys.
- If the upload fails, no report is created. If the database save fails after the upload, the photo is deleted.
- Image URLs are public but unguessable (random names). Anyone with the link can view the photo.

## AI prediction

Every new report is analysed right after it is saved. See `docs/AI_CONTRACT.md` for the request/response contract.

- **Mock mode** (default, `AI_SERVICE_URL` empty): simulated from the ticked symptoms, never looks at the photo. Stored as `MOCK` and returned as `predictionSource: "mock"`, `isMock: true`. The server prints `AI prediction: MOCK MODE` on startup.
- **Real mode**: set `AI_SERVICE_URL` (e.g. `http://localhost:8000`). Responses are validated before they are stored.
- If the AI service is down, slow or invalid, the report is still saved with `predictionStatus: "Failed"` and can be retried.
- Test real mode without the real models: run `node scripts/mock-ai-service.mjs` in another terminal and set `AI_SERVICE_URL=http://localhost:8000`. Try `MOCK_AI_BEHAVIOR=error|bad|slow` to see the failure handling.

## Automated check

With the server running, in another terminal: `npm run smoke`. It registers throw-away `@smoke.test` users and checks login, report creation, image validation, ownership (one farmer cannot read another's report) and staff access.

### Differences from the original plan PDF (the frontend wins)

- Field names follow the frontend: `crop` (not `cropType`), `location: {lat, lng}` (not flat latitude/longitude), `symptoms` is an array.
- Report ids are `rpt-0001` style. Statuses are `Pending/Validated/Corrected` and `Active/Resolved`.
- Responses are wrapped: `{ report }`, `{ reports }`, `{ user }`; `frontend/src/services` unwraps them.
- `issue`, `issueType`, `pest`, `confidence`, `riskLevel` come from the stored AI result and are `null` while `predictionStatus` is `Pending` or `Failed`. The report also carries `predictionStatus` (`Pending/Completed/Failed`) and `predictionSource` (`mock` or `ai-service`).

## Errors

Always JSON: `{ "message": "...", "errors": { "field": "..." } }`. Status codes: 400 invalid input, 401 not signed in, 403 not allowed, 404 not found, 409 duplicate, 429 too many attempts.
