# AIMO – Advanced Intelligent Management for Online Booking
## Complete System Rebuild Plan

### Overview
Rebuild and improve the existing reservation system in `C:\Users\pc\Desktop\ING_4\aimo-for-booking` by analyzing and refactoring code from `C:\Users\pc\Desktop\reservation\{BackEnd,FrontEnd}`. The result will be a professional, production-ready platform with 3 distinct role-based interfaces (Client, Worker, Owner), an integrated AI chatbot, and a modern, animated UI.

---

## Analysis Summary

### Source Backend (`C:\Users\pc\Desktop\reservation\BackEnd`)
#### ✅ Strengths to Reuse:
- Custom `User` model with role-based system (guest/client/owner/worker)
- `Booking` model with conflict detection via `is_available()` and `book_dates()`  
- `Apartment` availability range management (`AvailableDate` model + split/merge logic)
- Full chatbot engine with **Google Gemini AI** (`bot_engine.py` - 695 lines)
- Email verification flow
- JWT authentication via `djangorestframework-simplejwt`

#### ❌ Issues to Fix:
- Django 3.2 (will upgrade to 4.2 LTS)
- Old-style settings (not split dev/prod)
- `BookingViewSet` has no past-date validation
- `bot_engine.py` imports models with wrong field names (`id_owner`, `id_user` vs `owner`, `user_id`)
- Deletion bug: `delete()` not checking `apartment` relationship properly
- `IsAdminUser` mislabeled (actually IsOwnerUser)
- Workers app has almost no logic
- No analytics/stats endpoints for Owner dashboard

### Source Frontend (`C:\Users\pc\Desktop\reservation\FrontEnd`)
#### ✅ Strengths to Reuse:
- Full routing with React Router v7
- Context-based auth + property contexts
- Component patterns (booking multi-step form, sidebar, cards)
- Chatbot UI structure with suggest buttons
- TailwindCSS v4 + Vite setup

#### ❌ Issues to Fix:
- No consistent design system or theming
- Components have inline styles mixed with Tailwind
- No loading states or proper error UI
- Framer Motion not installed
- No worker-specific interface (just a basic `reportproblem` page)
- Client interface lacks search/filter/chatbot integration
- Owner dashboard lacks real analytics charts

### Current AIMO Workspace (`C:\Users\pc\Desktop\ING_4\aimo-for-booking`)
Already has a good scaffold:
- `reservation_backend/` with `apps/` structure and split settings
- `reservation_frontend/` with Redux + feature-based structure
- `docker-compose.yml`

---

## User Review Required

> [!IMPORTANT]
> **Google Gemini API Key**: The chatbot uses `google-generativeai` with `GOOGLE_API_KEY`. Do you have a valid key to add to `.env`? If not, I'll implement a mock/fallback response mode so the chatbot UI still works without an API key.

> [!IMPORTANT]
> **Database**: The project uses PostgreSQL via Docker. Do you want to continue with PostgreSQL, or use SQLite for local development first? The plan uses PostgreSQL as specified.

> [!WARNING]
> **Breaking Change**: The existing `reservation_backend` scaffold will be significantly expanded. Existing SQLite DB (`db.sqlite3`) will be replaced. Migrations will be regenerated.

> [!NOTE]
> **Framer Motion**: Will be added as a new dependency for animations. `npm install framer-motion` will be required.

---

## Proposed Changes

### Phase 1: Backend Refactoring

---

#### [MODIFY] `reservation_backend/config/settings/base.py`
- Add JWT settings with `ACCESS_TOKEN_LIFETIME`, `REFRESH_TOKEN_LIFETIME`
- Add CORS with React dev server origin
- Add `django_filters`, `drf_spectacular` spectaular settings
- Add `GOOGLE_API_KEY` env var

#### [MODIFY] `reservation_backend/config/settings/development.py`
- Configure PostgreSQL from `.env`
- Enable debug toolbar
- Add email backend as console

#### [MODIFY] `reservation_backend/config/urls.py`
- Register all app routers
- Add JWT token endpoints (`/api/auth/token/`, `/api/auth/token/refresh/`)
- Add `api/chatbot/` endpoint
- Add Swagger docs at `/api/docs/`

---

### Phase 2: App - `apps/users`

#### [MODIFY] `apps/users/models.py`
- Port the full `User` model from source (custom `AbstractBaseUser`)
- Roles: `guest | client | owner | worker | admin`
- Add: `email_verified`, `verification_code`, `photo`, `status`

#### [NEW] `apps/users/permissions.py`
- `IsOwnerRole` — only Owner can access
- `IsWorkerOrOwner` — workers and owners
- `IsOwnerWorkerOrClient` — all authenticated except unapproved guests
- `IsSelfOrOwner` — user can only edit themselves, or owner can edit anyone

#### [MODIFY] `apps/users/views.py`
- `UserViewSet` with:
  - `create` — registration with email verification flow
  - `me` — get current user
  - `workers` — list workers (owner only)
  - `clients` — list clients (owner/worker)
  - `verify_email`, `resend_verification`

#### [MODIFY] `apps/users/serializers.py`
- `UserSerializer` with read-only fields, role filtering
- `UserCreateSerializer` with password hashing
- `UserPublicSerializer` (for other users to see limited info)

---

### Phase 3: App - `apps/properties`

#### [NEW] `apps/properties/` (entire app - ported & improved)
All models from source `properties/models.py` with improvements:

**models.py**:
- `Property`: keeps all fields, adds `slug` field, improves `owner` FK  
- `Apartment`: keeps all fields, improves `adult` field (use Integer)
- `AvailableDate`: exact port with merged interval logic  
- `Review` (renamed from `Guest`): proper `unique_together(user, property)` constraint

**views.py** — New endpoints:
- `GET /api/properties/` — public listing with filters (type, location, rating, price)
- `GET /api/properties/{id}/` — property detail with apartments
- `GET /api/properties/{id}/availability/` — check availability calendar
- `POST /api/properties/{id}/review/` — submit review (clients who booked)
- Owner-only: CRUD on properties and apartments
- `GET /api/properties/stats/` — analytics for owner dashboard

---

### Phase 4: App - `apps/bookings`

#### [MODIFY] `apps/bookings/models.py` (port + fixes)
Keeping the strong source model with these improvements:
- Add validation in `clean()` method:
  - **Prevent past bookings**: `date_in >= today`
  - **Prevent conflicts**: call `apartment.is_available()` before save
  - Raise `ValidationError` with descriptive messages
- Fix `delete()` method: ensure `status == 'confirmed'` check is correct
- Add `updated_at = DateTimeField(auto_now=True)`

#### [MODIFY] `apps/bookings/views.py` (port + improvements)
- `BookingViewSet`:
  - `confirm` action — owner/worker only
  - `cancel` action — client can cancel their own pending bookings
  - `get_queryset` — proper role-based filtering  
  - `perform_create` — validate availability, reject past dates
- `MyBookingViewSet`:
  - Client's personal booking history
  - With status badge and property info

#### [NEW] `apps/bookings/validators.py`
- Centralized validation functions:
  - `validate_booking_dates(date_in, num_nights)` — no past dates, min 1 night
  - `validate_no_conflict(apartment, date_in, num_nights, exclude_id=None)`

---

### Phase 5: App - `apps/chatbot` (Port + Improve)

#### [MODIFY] `apps/chatbot/models.py`
- Keep `ChatbotConversation` model
- Add `session_id = UUIDField` for grouping conversations

#### [NEW] `apps/chatbot/bot_engine.py` (refactored from source)
Major improvements:
- Fix all field name references to match new models (`owner` not `id_owner`)
- Add fallback mode when `GOOGLE_API_KEY` is missing
- Add `suggest_services()` method for client chatbot
- Add `get_booking_suggestions()` for recommending available apartments
- Improve `process_command()` to handle booking queries with natural language
- Better error handling with specific exception types

#### [MODIFY] `apps/chatbot/views.py`
- `/api/chatbot/` — Main chat endpoint  
- `/api/chatbot/history/` — Conversation history
- `/api/chatbot/tips/` — Quick tips
- `/api/chatbot/suggest/` — Service/apartment suggestions

---

### Phase 6: App - `apps/workers`

#### [MODIFY] `apps/workers/models.py`
- `WorkerSchedule`: day/time availability slots
- `WorkerAssignment`: link worker to property/service

#### [NEW] `apps/workers/views.py`
- `GET /api/workers/schedule/` — worker's availability
- `GET /api/workers/assignments/` — assigned properties/tasks
- `GET /api/workers/bookings/` — bookings at assigned properties

---

### Phase 7: Analytics Endpoints (for Owner Dashboard)

#### [NEW] `apps/bookings/analytics.py`
- `GET /api/analytics/overview/` — total bookings, revenue, occupancy
- `GET /api/analytics/monthly/` — per-month chart data
- `GET /api/analytics/by-property/` — breakdown per property
- `GET /api/analytics/recent-bookings/` — last 10 bookings

---

### Phase 8: Frontend Rebuild

The existing `reservation_frontend` will be rebuilt with proper feature structure.

#### [MODIFY] `reservation_frontend/package.json`
Add:
- `framer-motion` — animations
- `recharts` — analytics charts (lightweight alternative to google charts)
- `react-calendar` — date picker for availability
- `react-hot-toast` — toast notifications
- Remove: `puppeteer` (server-side), `pdfmake` (duplicate), `@react-pdf/renderer` (server-side)

#### [MODIFY] `reservation_frontend/src/index.css`
Full design system:
- CSS custom properties (HSL color palette)
- Dark/light mode tokens
- Typography scale
- Animation keyframes
- Glass morphism utilities

---

### Phase 9: Frontend Feature Modules

#### Auth Features
**[MODIFY]** `src/features/auth/`:
- `LoginForm.jsx` — polished login with validation, animated transitions
- `RegisterForm.jsx` — multi-step registration (role selection → info → verification)
- `VerifyEmail.jsx` — OTP code input component
- `authSlice.js` — Redux state for auth (port + improve)

#### Client Interface (`src/pages/client/`)
**[NEW]** Full client portal:
- `ClientHome.jsx` — hero section, featured services, chatbot button
- `ServiceBrowser.jsx` — filterable grid of properties/apartments with search
- `ServiceDetail.jsx` — property detail with availability calendar, photos
- `BookingFlow.jsx` — multi-step booking: date selection → guest info → confirmation
- `MyReservations.jsx` — list with status badges, cancel button
- `ClientChatbot.jsx` — floating AI assistant integrated in client pages

#### Worker Interface (`src/pages/worker/`)
**[NEW]** Worker dashboard:
- `WorkerDashboard.jsx` — today's check-ins/check-outs, overview stats
- `WorkerCalendar.jsx` — visual booking calendar for assigned properties
- `AssignedProperties.jsx` — list of properties they manage
- `BookingQueue.jsx` — pending bookings to confirm

#### Owner Interface (`src/pages/owner/`)
**[MODIFY]** Enhanced owner dashboard:
- `OwnerDashboard.jsx` — stats cards + recharts analytics (revenue, occupancy, trends)
- `PropertyManager.jsx` — CRUD for properties + apartments
- `BookingManager.jsx` — full booking list, confirm/refuse actions, filter by property
- `WorkerManager.jsx` — manage workers, assign to properties
- `RevenueReport.jsx` — monthly revenue charts
- `OwnerChatbot.jsx` — AI assistant for management queries

---

### Phase 10: Shared Components

#### [NEW/MODIFY] `src/components/`
- `common/Button.jsx` — variants: primary, secondary, danger, ghost + loading state
- `common/Input.jsx` — with validation, error states, animated label
- `common/Modal.jsx` — backdrop + slide-in animation
- `common/Card.jsx` — glass morphism card with hover animation
- `common/Badge.jsx` — status badges (pending/confirmed/refused)
- `common/Loader.jsx` — skeleton loaders + spinner
- `common/EmptyState.jsx` — illustrated empty states per context
- `common/Toast.jsx` — integrated with react-hot-toast
- `layout/Sidebar.jsx` — role-aware navigation, collapsible
- `layout/Navbar.jsx` — top bar with user profile, notifications
- `layout/Layout.jsx` — different layouts per role

---

### Phase 11: Docker & Configuration

#### [MODIFY] `docker-compose.yml`
- Add Redis service (for caching chatbot sessions)
- Fix backend command to use gunicorn in production
- Add health checks

#### [MODIFY] `.env` and `.env.example`
- All backend + frontend environment variables documented

---

## Open Questions

> [!IMPORTANT]
> 1. **Google Gemini API Key**: Do you have one? Should I implement fallback mock responses?
> 2. **Email**: Should email verification be enabled? (Requires SMTP config)
> 3. **Language**: The chatbot detected the user's language. Should AI responses be multilingual (Arabic/French/English)?

---

## Verification Plan

### Backend Verification
```bash
cd reservation_backend
python manage.py migrate
python manage.py test
python manage.py runserver
```
- Test JWT login endpoint: `POST /api/auth/token/`
- Test booking creation with conflict: verify 400 response
- Test booking with past date: verify 400 response
- Test chatbot endpoint: `POST /api/chatbot/`
- Verify Swagger docs at `http://localhost:8000/api/docs/`

### Frontend Verification
```bash
cd reservation_frontend
npm run dev
```
- Login as each role (owner, worker, client)
- Verify each interface loads its correct dashboard
- Test booking flow end-to-end
- Verify chatbot floating widget opens
- Check mobile responsiveness

### Docker Verification
```bash
docker-compose up
```
- Verify all services start
- Check DB connectivity
- Test API from frontend container

---

## Execution Phases (High-Level)

| Phase | Scope | Est. Files |
|-------|-------|-----------|
| 1 | Backend settings, URLs, core config | 5 |
| 2 | Users app (model, views, perms, serializers) | 6 |
| 3 | Properties app (full port + improvements) | 6 |
| 4 | Bookings app (port + validation fixes) | 6 |
| 5 | Chatbot app (port + AI improvements) | 5 |
| 6 | Workers app | 4 |
| 7 | Analytics endpoints | 2 |
| 8 | Frontend design system + CSS | 3 |
| 9 | Auth features (login, register) | 5 |
| 10 | Client interface (3 pages) | 6 |
| 11 | Worker interface (3 pages) | 4 |
| 12 | Owner interface (4 pages) | 6 |
| 13 | Shared components (12 components) | 12 |
| 14 | Redux slices + API services | 8 |
| 15 | Docker + env config | 3 |

**Total: ~81 files to create/modify**
