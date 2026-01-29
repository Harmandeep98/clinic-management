# 🏥 Clinic Management System

A multi-tenant clinic management backend API built with TypeScript, Fastify, and PostgreSQL. This project serves as a learning exercise for mastering **SDE3-level software engineering concepts**.

---

## 📚 Learning Goals & SDE3 Concepts Covered

| Concept                   | Implementation                                         | Status               |
| ------------------------- | ------------------------------------------------------ | -------------------- |
| **Clean Architecture**    | Layered design (Routes → Services → Repositories)      | ✅ Implemented       |
| **Database Transactions** | `withTransaction()` helper with proper commit/rollback | ✅ Excellent         |
| **Idempotency**           | Redis-based duplicate request prevention               | ✅ Advanced concept! |
| **Error Handling**        | Centralized with `AppError`, Postgres error mapping    | ✅ Well done         |
| **Input Validation**      | Zod schemas for type-safe validation                   | ✅ Implemented       |
| **Database Migrations**   | Dbmate for version-controlled schema changes           | ✅ Implemented       |
| **API Documentation**     | OpenAPI/Swagger integration                            | ✅ Implemented       |
| **Atomic Counters**       | `clinic_counters` for sequential visit refs            | ✅ In progress       |

---

## ✅ What You're Doing RIGHT (SDE3 Patterns)

### 1. **Layered Architecture** - Excellent separation of concerns

```
backend/src/
├── http/           # HTTP layer (routes, middlewares, schemas)
├── applications/   # Business logic services
├── repositories/   # Data access layer
├── infrastructure/ # Cross-cutting concerns (db, redis, errors)
└── shared/         # Reusable utilities
```

> [!TIP]
> This is exactly how production systems at scale are organized. Each layer has a single responsibility.

### 2. **Transaction Management** - Production-grade pattern

Your `withTransaction()` function properly handles:

- Connection acquisition from pool
- BEGIN/COMMIT/ROLLBACK lifecycle
- Connection release in `finally` block (prevents connection leaks!)

### 3. **Idempotency Middleware** - Advanced distributed systems concept

Most junior/mid engineers don't think about this! You've implemented:

- Idempotency key validation (UUIDv7)
- Processing state tracking to prevent concurrent duplicates
- Result caching for safe retries

### 4. **Atomic Counter Pattern** - Race condition prevention

Your `ClinicCounterRepository.incrementVisitSeq()` uses `INSERT ... ON CONFLICT DO UPDATE` which is **exactly right** for generating sequential IDs without race conditions.

### 5. **Centralized Error Handling**

- Custom `AppError` class with status codes
- PostgreSQL error mapping
- Zod validation error handling

---

## ⚠️ Issues to Fix

### 1. **Migration 005 has a typo** (Critical - won't run!)

**File:** `db/migrations/005_clinic_counter_table.sql`

```sql
-- Current (BROKEN):
clinic_id UUID PRIMAYR KEY REFERENCES clinics(id)
--             ^^^^^^^  typo!

-- Should be:
clinic_id UUID PRIMARY KEY REFERENCES clinics(id)
```

### 2. **Missing `migrate:down` in migrations**

Your migrations need rollback statements:

```sql
-- migrate:up
CREATE TABLE clinic_counters (...);

-- migrate:down
DROP TABLE IF EXISTS clinic_counters;
```

### 3. **Idempotency middleware has a typo**

**File:** `backend/src/http/middlewares/idempotency.middleware.ts` (line 31)

```typescript
// Current:
reply.status(parsed.response.satusCode); // typo: satusCode
// Should be:
reply.status(parsed.response.statusCode);
```

### 4. **visit_ref not being used from generated value**

**File:** `backend/src/applications/visits/visit.service.ts`

```typescript
// You generate visitRef but don't use it:
const visitRef = `${shortCode}-${seq}`; // Generated ✅

await this.visitRepo.create(client, {
  // ...
  visit_ref: input.visit_ref, // ❌ Uses input instead of generated visitRef!
});
```

**Fix:** Use the generated `visitRef` instead of `input.visit_ref`.

### 5. **Error handler missing return statement**

**File:** `backend/src/infrastructure/errors/error-handler.ts`

```typescript
if (error instanceof AppError) {
  // ... handling logic
  reply.status(error.statusCode).send({...});
  // ❌ Missing return! Falls through to pgError handling
}
```

Add `return;` after sending the AppError response.

### 6. **ClinicReadRepository uses wrong Error type**

```typescript
throw new Error("Clinic not found"); // ❌ Generic Error
// Should be:
throw new AppError("Clinic not found", 404); // ✅ Uses your AppError
```

---

## 🚀 Next Steps (Recommended Learning Path)

### Phase 1: Fix Current Issues

1. [ ] Fix typo in migration 005 (`PRIMARY` not `PRIMAYR`)
2. [ ] Fix `visit_ref` assignment in `VisitService.startVisit()`
3. [ ] Add `return` statement in error handler for `AppError` case
4. [ ] Use `AppError` consistently across all repositories

### Phase 2: Complete Visits Feature

1. [ ] Add unit tests for `VisitService`
2. [ ] Add integration tests for visit routes
3. [ ] Implement visit listing endpoint

### Phase 3: Build Next Feature (Appointments)

1. [ ] `AppointmentRepository` with CRUD operations
2. [ ] `AppointmentService` with business logic
3. [ ] `POST /appointments` - Schedule appointment
4. [ ] `PATCH /appointments/:id/cancel` - Cancel appointment
5. [ ] Link appointments to visits (visits start from appointments)

### Phase 4: Add More SDE3 Concepts

1. [ ] **Pagination** - Cursor-based for lists
2. [ ] **Rate Limiting** - Protect APIs from abuse
3. [ ] **Health Checks** - `/health` endpoint with DB connectivity check
4. [ ] **Logging** - Structured logging with request IDs
5. [ ] **Authentication** - JWT/session-based auth
6. [ ] **Authorization** - Role-based access control (RBAC)

---

## 🧪 Testing (SDE3 Essential)

**Currently:** No tests found in the codebase.

> [!IMPORTANT]
> SDE3 engineers write tests. Period. This is non-negotiable at senior levels.

### Recommended Testing Strategy:

1. **Unit Tests** - For services and pure functions
2. **Integration Tests** - For repository + database interactions
3. **API Tests** - For HTTP endpoints end-to-end

```bash
# Recommended: Add vitest or jest
npm install -D vitest
```

---

## 🛠️ Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Runtime    | Node.js + TypeScript    |
| Framework  | Fastify                 |
| Database   | PostgreSQL              |
| Cache      | Redis (for idempotency) |
| Validation | Zod                     |
| Migrations | Dbmate                  |
| Docs       | OpenAPI/Swagger         |

---

## 📁 Project Structure

```
clinic-management/
├── backend/
│   ├── src/
│   │   ├── applications/     # Business logic (services)
│   │   │   └── visits/
│   │   │       └── visit.service.ts
│   │   ├── http/             # HTTP layer
│   │   │   ├── hooks/
│   │   │   ├── middlewares/
│   │   │   │   └── idempotency.middleware.ts
│   │   │   └── visits/
│   │   │       ├── visit.routes.ts
│   │   │       └── visit.schemas.ts
│   │   ├── infrastructure/   # Cross-cutting concerns
│   │   │   ├── db/
│   │   │   │   ├── pool.ts
│   │   │   │   ├── query.ts
│   │   │   │   └── transaction.ts
│   │   │   ├── redis/
│   │   │   └── errors/
│   │   │       └── error-handler.ts
│   │   ├── repositories/     # Data access
│   │   │   ├── clinics/
│   │   │   │   ├── clinic-counter.repository.ts
│   │   │   │   └── clinic-read.repository.ts
│   │   │   └── visits/
│   │   │       ├── visit.repository.ts
│   │   │       └── visit.types.ts
│   │   ├── shared/           # Shared utilities
│   │   │   └── errors/
│   │   │       └── app-errors.ts
│   │   ├── index.ts
│   │   └── server.ts
│   ├── openapi/
│   │   └── clinic-api.openapi.yaml
│   └── package.json
└── db/
    ├── migrations/
    │   ├── 001_init_schema.sql
    │   ├── 002_constraints.sql
    │   ├── 003_indexes.sql
    │   ├── 004_clinic_short_code.sql
    │   └── 005_clinic_counter_table.sql
    └── schema.sql
```

---

## 🏃 Running the Project

```bash
# Install dependencies
cd backend
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

---

## 📊 Database Schema (Key Tables)

| Table             | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `clinics`         | Multi-tenant clinic organizations        |
| `users`           | System users (can have multiple roles)   |
| `patients`        | Patient records per clinic               |
| `doctors`         | Doctor profiles linked to clinics        |
| `appointments`    | Scheduled patient-doctor meetings        |
| `visits`          | Actual clinic visits (from appointments) |
| `prescriptions`   | Doctor prescriptions per visit           |
| `lab_reports`     | Uploaded lab reports                     |
| `billing_usage`   | Usage tracking for billing               |
| `clinic_counters` | Atomic sequence generators per clinic    |

---

## 💡 SDE3 Wisdom

> "The difference between a mid-level and senior engineer isn't the code they write—it's the code they prevent from being written, the edge cases they anticipate, and the maintenance burden they consider."

**Key Principles You're Learning:**

1. **Prevent Race Conditions** - Using database constraints and atomic operations
2. **Idempotency** - Making APIs safe to retry
3. **Fail Fast, Fail Loud** - Proper error handling and validation
4. **Separation of Concerns** - Each layer has one job
5. **Database as Source of Truth** - Constraints and transactions for data integrity
