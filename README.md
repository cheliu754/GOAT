# GOAT

Backend and frontend live under `src/`. Key backend notes for replacing the frontend mocks:

## Backend (Express + MongoDB)
- Env vars: `MONGO_URL` (Mongo connection string) and `FIREBASE_ADMIN_KEY_BASE64` (base64 JSON service account for Firebase Admin).
- Run locally: `cd src/backend && npm install && npm run dev`.
- Dev seed: when `NODE_ENV !== "production"` the first college query seeds `src/backend/dict/seed-colleges.json` into Mongo so the search/browse UI has data.

### API quick reference
- `GET /api/colleges?q=&letter=&limit=` – list/browse; returns `{ success, data, total }` with `name`, `location`, `acceptanceRate`, `tuition`, plus raw fields.
- `GET /api/colleges/search?q=` – search alias (limit 25 by default).
- `GET /api/colleges/suggestions?q=` – lightweight objects for the search bar.
- `POST /api/colleges`, `PUT /api/colleges/:id`, `DELETE /api/colleges/:id`, `GET /api/colleges/:id` – admin CRUD.
- Auth-required (Firebase ID token in `Authorization: Bearer <token>`):
  - `POST /api/users/sync`, `GET/PUT/DELETE /api/users/:firebaseUid?`.
  - `GET /api/saved` (list), `GET /api/saved/:id`, `POST /api/saved`, `PUT /api/saved/:id`, `DELETE /api/saved/:id`, `GET /api/saved/check/:name`.
  - Saved payload supports `name/INSTNM`, `deadline`, `location (CITY/STABBR)`, `website`, `notes`, `applicationStatus`, `essayStatus`, `recommendationStatus`, and `extras` (array).
