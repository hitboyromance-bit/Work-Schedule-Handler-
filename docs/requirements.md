# Work Schedule Handler — MVP Requirements

## Scope
This document defines the minimum product and technical requirements for MVP implementation.

## User Roles
- **Manager**: can create, edit, cancel, and view schedules.
- **Worker**: can view only their own schedules.

## Functional Requirements

### FR-1 Authentication
- Users must be able to log in with `employeeId` and password.
- Successful login returns an access token.
- Invalid credentials return an authentication error without disclosing which field failed.


### FR-1b Identity Provisioning
- System must support one-time manager bootstrap when no active manager exists.
- Managers must be able to create worker/manager user accounts with role assignment.

### FR-2 Role-Based Authorization
- Manager-only endpoints must reject workers with `403 Forbidden`.
- Worker endpoints must ignore/override client-supplied employee IDs and use the authenticated identity.

### FR-3 Schedule Retrieval (Worker)
- A worker can retrieve their own schedules.
- Optional date filters `from` and `to` should be supported.

### FR-4 Schedule Management (Manager)
- A manager can create schedules for workers.
- A manager can update schedule details.
- A manager can cancel schedules (soft delete).

### FR-5 Validation & Errors
- API must validate request payloads and query parameters.
- Errors should use a consistent JSON structure.

## Non-Functional Requirements

### NFR-1 Security
- Secrets must be read from environment variables.
- Passwords must be hashed at rest.
- All protected endpoints require token authentication.

### NFR-2 Reliability
- Health endpoint must be available for service monitoring.
- Database connection errors must fail fast on startup.

### NFR-3 Maintainability
- Code organization should separate routes, controllers, services, and middleware.
- Unit and integration tests should cover critical auth and schedule paths.

## Acceptance Criteria (MVP)
- Manager can create a schedule and worker can view it via `/schedules/me`.
- Worker cannot view another worker's schedules.
- Worker cannot create/update/delete schedules.
- Manager can cancel a schedule and cancelled status is reflected in results.
- Auth-protected endpoints reject missing/invalid tokens.
