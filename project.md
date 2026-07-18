# Airbnb Clone – Full Stack Assignment — CLAUDE.md

> This file is read by Claude Code at the start of every session.
> Keep it updated. Every correction → a CLAUDE.md update.

## Tech Stack
 ## Frontend - Next.js 16 - TypeScript - Tailwind CSS - React Hook Form - Zod - Axios  ## Backend - Python - FastAPI - SQLAlchemy - SQLite - Pydantic - Uvicorn  ## Deployment - Vercel (Full Application: Frontend and Backend)

## Architecture
This project is a full-stack Airbnb Clone built using a monorepo architecture.

The frontend is developed with Next.js App Router, TypeScript, and Tailwind CSS using reusable, feature-based components.

The backend is developed using FastAPI with SQLAlchemy ORM and SQLite for persistent storage.

The frontend communicates with the backend through REST APIs.

The application follows the following architecture:

Frontend (Next.js)
↓
Service Layer (Axios)
↓
FastAPI Routes
↓
Business Logic
↓
SQLAlchemy ORM
↓
SQLite Database

Business logic should remain inside the backend.

Seed the database with realistic sample users, listings, bookings and reviews.

---



## File Structure
```
frontend/
├── app/
├── components/
├── hooks/
├── services/
├── lib/
├── types/
├── public/

backend/
├── app/
│   ├── routers/
│   ├── services/
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── main.py
│   └── seed.py

README.md

---


```

## Commands
```bash
## Frontend

npm install

npm run dev

npm run build

npm run lint

## Backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload

## Seed Database

python app/seed.py

```

## Conventions
- Use TypeScript strict mode.
- Use functional React components only.
- Prefer Server Components unless client-side state is required.
- Keep components reusable.
- Follow feature-based folder structure.
- Keep files under approximately 300 lines where practical.
- Keep business logic outside UI components.
- Use Tailwind CSS only for styling.
- Store API requests inside services.
- Validate forms using React Hook Form and Zod.
- Use SQLAlchemy ORM only.
- Follow REST API naming conventions.
- Use async/await.
- Use proper TypeScript interfaces.
- Write modular and maintainable code.
- Add comments only when necessary.


## Do NOT

- Do NOT use Prisma.
- Do NOT use MongoDB.
- Do NOT use Firebase.
- Do NOT use Supabase.
- Do NOT use NextAuth.
- Do NOT use any external database.
- Do NOT hardcode business logic inside React components.
- Do NOT duplicate code.
- Do NOT ignore TypeScript errors.
- Do NOT skip validation.
- Do NOT generate huge files when reusable components can be created.
- Do NOT use local state for persistent application data.
- Do NOT use fake APIs.
- Do NOT change folder structure without reason.


## Known Mistakes to Watch For
- Do not generate the entire project in one response.
- Build one feature at a time.
- Test every feature before moving forward.
- Always reuse existing components.
- Keep naming conventions consistent.
- Update TypeScript interfaces whenever backend models change.
- Validate booking dates.
- Prevent overlapping bookings.
- Ensure SQLite stores all persistent data.
- Preserve existing functionality while implementing new features.
- Build an Airbnb-like experience instead of a generic CRUD application.


## Testing
After implementing every feature:

- Run frontend locally.
- Run backend locally.
- Verify REST APIs through Swagger UI.
- Test every CRUD operation.
- Verify booking validation.
- Verify overlapping bookings are blocked.
- Test responsive layouts.
- Fix all TypeScript errors.
- Fix lint errors.
- Ensure database persistence.
- Test API integration before moving to the next feature.


## Notes & References
Build an Airbnb Clone that closely resembles Airbnb in both UI and user experience.

### Required Features

- Home Page
- Search Bar
- Filters
- Property Categories
- Listing Details
- Photo Gallery
- Availability Calendar
- Booking Flow
- Booking Summary
- Mock Checkout
- My Trips
- Wishlist/Favourites
- Host Dashboard
- Create Listing
- Edit Listing
- Delete Listing
- Host Booking Management
- Reviews
- Toast Notifications
- Pagination or Infinite Scroll
- Responsive Design

### Placeholder Features

- Payment Gateway
- Messaging
- Live Maps
- Identity Verification

### Database

Design a normalized SQLite database with:

- Users
- Listings
- Bookings
- Reviews
- Wishlist

Seed the database with:

- 20+ Listings
- 5 Hosts
- 10 Users
- 15 Bookings
- 25 Reviews

### Development Workflow

Always build incrementally in the following order:

1. Backend Setup
2. Database Models
3. API Development
4. Seed Data
5. Frontend Setup
6. Home Page
7. Listing Details
8. Booking Flow
9. My Trips
10. Wishlist
11. Host Dashboard
12. Create/Edit/Delete Listings
13. Responsive Design
14. Deployment

