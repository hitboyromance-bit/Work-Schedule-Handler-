# Work Schedule Handler — Target Architecture Blueprint

## 0) Current Repository Status (as of April 1, 2026)
- Repository currently contains top-level scaffolding and documentation.
- `src/server.js` and `src/public/index.html` exist but are not yet implemented.
- This document describes the **target architecture**, not the current runtime behavior.

---

## 1) Product Goal
Build a role-based schedule management system where:
- **Managers** can create, update, and delete work schedules.
- **Workers** can view only their own schedules.
- Authentication is based on employee identity, and authorization is enforced on every protected endpoint.

---

## 2) Proposed Repository Structure

```text
Work-Schedule-Handler-/
  docs/
    requirements.md
    architecture.md
  src/
    server.js
    app.js
    config/
      env.js
      db.js
    models/
      User.js
      Schedule.js
    middleware/
      auth.js
      requireRole.js
      errorHandler.js
      notFound.js
    routes/
      auth.routes.js
      schedules.routes.js
      users.routes.js
    controllers/
      auth.controller.js
      schedules.controller.js
      users.controller.js
    services/
      token.service.js
      schedule.service.js
    validators/
      auth.validator.js
      schedules.validator.js
    public/
      index.html
    utils/
      ApiError.js
      asyncHandler.js
  tests/
    unit/
    integration/
```

Design notes:
- Keep business logic in `services/` so controllers stay small.
- Keep database concerns in `models/` and optional repo/service boundaries.
- Centralize auth and role checks in middleware.

---

## 3) Core Domain Model

### `User`
- `employeeId` (string, unique, indexed)
- `name` (string)
- `role` (`manager` | `worker`)
- `department` (string, optional)
- `isActive` (boolean, default `true`)
- `createdAt`, `updatedAt`

### `Schedule`
- `employeeId` (string, indexed) or `user` (ObjectId ref `User`)
- `date` (ISO date, indexed)
- `startTime` (string `HH:mm` or Date)
- `endTime` (string `HH:mm` or Date)
- `location` (string, optional)
- `notes` (string, optional)
- `status` (`scheduled` | `cancelled`)
- `createdBy` (manager user id)
- `createdAt`, `updatedAt`

Recommended indexes:
- `User.employeeId` unique
- `Schedule.employeeId + date`
- Optional uniqueness on `employeeId + date + startTime`

---

## 4) AuthN/AuthZ Strategy

### Authentication
- Short-term MVP: employee ID + shared secret/PIN.
- Better: employee ID + password hash.
- Token strategy: JWT (access token) in Authorization header (`Bearer <token>`).

### Authorization
- `requireAuth` middleware validates token and populates `req.user`.
- `requireRole('manager')` for management-only endpoints.
- Worker endpoints always scope by `req.user.employeeId`.

Security baseline:
- Validate all input.
- Never trust client-supplied employeeId for worker read endpoints.
- Return generic auth failures (avoid account enumeration).

---

## 5) API Contract (v1)

Base path: `/api/v1`

### Auth
- `POST /auth/login`
  - Body: `{ "employeeId": "E123", "password": "..." }`
  - 200: `{ "accessToken": "...", "user": { ... } }`

- `POST /auth/logout` (optional for stateless JWT; useful if token revocation is added)

### Users
- `GET /users/me` (authenticated)
  - Returns profile for current user.

### Schedules
- `GET /schedules/me` (worker/manager)
  - Query: `from`, `to`
  - Returns schedules scoped to authenticated user.

- `GET /schedules` (manager)
  - Query: `employeeId`, `from`, `to`, `department`
  - Returns filtered schedules.

- `POST /schedules` (manager)
  - Creates schedule.

- `PATCH /schedules/:id` (manager)
  - Partial updates.

- `DELETE /schedules/:id` (manager)
  - Soft delete preferred (set `status=cancelled`).

Error format (suggested):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": []
  }
}
```

---

## 6) Application Layering

Request flow:
1. Route receives request.
2. Validator checks params/body/query.
3. Controller delegates to service.
4. Service performs business logic + model operations.
5. Controller maps service result to HTTP response.
6. Global error handler normalizes errors.

This separation makes testing simpler and avoids route/controller bloat.

---

## 7) Configuration

Use `.env` for:
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `NODE_ENV`

`src/config/env.js` should fail fast if required variables are missing.

---

## 8) Testing Strategy

### Unit
- Service logic (authorization checks, overlap rules, validation helpers).
- Middleware behavior with mocked req/res/next.

### Integration
- API tests with test database.
- Critical paths:
  - login success/failure
  - worker can only view own schedules
  - manager CRUD lifecycle
  - validation errors and status codes

Suggested tooling:
- Test runner: Jest or Vitest
- HTTP assertions: Supertest

---

## 9) Delivery Milestones

### Milestone 1 — Foundation
- Express app bootstrap
- DB connection
- Error handling
- Health check endpoint

### Milestone 2 — Identity
- User model
- Auth endpoint
- JWT middleware
- `/users/me`

### Milestone 3 — Worker Experience
- `GET /schedules/me`
- date filtering and pagination

### Milestone 4 — Manager Tools
- Manager CRUD endpoints
- Role guard middleware

### Milestone 5 — Quality & Ops
- Automated tests
- Lint/format scripts
- Seed script for local demo users/schedules

---

## 10) Newcomer Learning Path
1. Read `docs/requirements.md` and this file.
2. Implement app bootstrap + health endpoint.
3. Add `User` and `Schedule` schemas.
4. Add auth middleware + `/auth/login` and `/users/me`.
5. Add `/schedules/me`, then manager CRUD.
6. Backfill tests for each completed endpoint.

This order minimizes rework and gives a usable vertical slice early.

---

## 11) Immediate Implementation Checklist
- [ ] Create `src/app.js` and wire middleware/error handlers.
- [ ] Implement `src/server.js` startup flow (`env` -> `db` -> `listen`).
- [ ] Add `User` and `Schedule` mongoose models with indexes.
- [ ] Implement `POST /api/v1/auth/login`.
- [ ] Implement `GET /api/v1/users/me`.
- [ ] Implement `GET /api/v1/schedules/me`.
- [ ] Implement manager-only schedule CRUD routes.
- [ ] Add integration tests for auth + authorization boundaries.

## 12) Open Decisions
- Use `employeeId` string directly on schedules vs ObjectId `user` references.
- Choose testing framework (`Jest` vs `Vitest`).
- Decide token revocation strategy (none, denylist, short-lived access + refresh).

