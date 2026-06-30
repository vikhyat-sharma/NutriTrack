# MacroWise

MacroWise is a production-ready nutrition tracking SaaS platform for calorie-aware users. The repository currently contains the backend foundation and shared domain logic for a mobile-first experience that will span React Native, Expo, and a responsive web client.

## 1. Product overview

MacroWise helps users:
- create a profile and calculate daily nutrition targets
- track meals by breakfast, lunch, dinner, and snacks
- monitor progress against calories and macros
- receive actionable guidance from an AI nutrition assistant
- stay on track with reminders for meals and water

## 2. System architecture

### High-level architecture

- Client apps
  - React Native + Expo for iOS and Android
  - React + TypeScript for responsive web
  - Shared UI primitives and domain logic in a monorepo package
- API layer
  - NestJS backend with feature-based modules
  - REST endpoints for auth, profile, nutrition, meals, dashboard, and assistant
- Data layer
  - PostgreSQL for transactional data
  - Prisma ORM for schema management
  - Redis or queue integration for reminders and async jobs (recommended)
- Integrations
  - Google OAuth for social login
  - External food database API (recommended)
  - Push notifications and email delivery service

### Architectural principles

- Clean Architecture with domain logic separated from transport concerns
- Feature-based module organization for frontend and backend
- Repository pattern for persistence operations
- API-first design so mobile and web share the same contract
- Strong TypeScript typing and explicit error handling

## 3. Database schema

The current Prisma schema already includes core entities for users, profiles, meals, food items, OAuth accounts, and session tokens.

### Core entities

- User
- Profile
- FoodItem
- FoodNutrition
- Meal
- MealItem
- OAuthAccount
- SessionToken

### Recommended additions

- NotificationPreference
- ReminderSchedule
- WeightEntry
- DailySummary
- AssistantConversation

## 4. Folder structure

```text
apps/
  mobile/            # Expo React Native app
  web/               # React web app
  server/            # NestJS API
    src/
      auth/
      users/
      nutrition/
      meals/
      dashboard/
      assistant/
      prisma/
      common/
packages/
  domain/            # Shared calculations and types
```

## 5. API endpoints

### Authentication
- POST /auth/register
- POST /auth/login
- POST /auth/google
- POST /auth/password-reset
- POST /auth/password-reset/confirm

### Profile
- GET /users/me
- PATCH /users/me/profile

### Nutrition
- POST /nutrition/targets
- POST /nutrition/meal-summary

### Meals
- POST /meals
- GET /meals?date=YYYY-MM-DD
- PATCH /meals/:id
- DELETE /meals/:id

### Dashboard
- GET /dashboard/daily-summary
- GET /dashboard/weekly-summary
- GET /dashboard/monthly-summary
- GET /dashboard/weight-trend

### Assistant
- POST /assistant/meal-suggestions
- POST /assistant/macro-adjustments
- POST /assistant/explain-nutrition

## 6. UI screens

- Welcome / onboarding
- Authentication screen
- Profile setup screen
- Dashboard screen
- Food search and meal logging screen
- Macro progress screen
- Progress charts screen
- AI assistant screen
- Settings and reminders screen

## 7. Navigation flow

```text
Welcome -> Auth -> Profile Setup -> Dashboard -> Meal Logging -> Progress -> Assistant -> Settings
```

## 8. State management design

### Web and mobile
- Zustand for app-level state such as auth/session and UI preferences
- TanStack Query for server state, caching, and background refetching
- React Hook Form for form state and validation
- Shared hooks for profile, nutrition calculations, and reminder state

## 9. Step-by-step implementation plan

1. Harden the backend foundation with DTOs, validation, auth guards, and error handling.
2. Add profile management and nutrition calculation endpoints.
3. Add meal logging and dashboard aggregation endpoints.
4. Create the web and mobile clients using shared UI components and domain packages.
5. Integrate Google OAuth and notification services.
6. Add analytics, tests, and CI/CD pipelines.

## 10. Production deployment strategy

### Recommended stack
- Frontend: Vercel for web, Expo EAS for mobile
- Backend: Render, Railway, Fly.io, or AWS ECS
- Database: Neon, Supabase, or AWS RDS
- Storage: S3-compatible object storage for uploads and meal photos
- Monitoring: Sentry, OpenTelemetry, and uptime checks

### Deployment checklist
- Set strong environment variables for JWT secrets and OAuth credentials
- Enable database migrations in CI/CD
- Configure rate limiting and CORS
- Add health checks, backups, and alerting
- Use containerization for repeatable deployments

## 11. Code examples

### Nutrition calculation example

```ts
const targets = calculateNutritionTargets({
  age: 29,
  gender: 'MALE',
  heightCm: 182,
  weightKg: 82,
  activityLevel: 'ACTIVE',
  fitnessGoal: 'LOSE',
});
```

### Meal summary example

```ts
const summary = summarizeMealEntries([
  { name: 'Greek yogurt', quantity: 1, calories: 180, proteinG: 20, carbsG: 10, fatG: 5, fiberG: 0 },
  { name: 'Banana', quantity: 1, calories: 105, proteinG: 1, carbsG: 27, fatG: 0, fiberG: 3 },
]);
```

## 12. Current repository review and recommendations

### What is already strong
- Monorepo structure is clear and scalable.
- NestJS and Prisma are a solid backend foundation.
- Shared domain calculations already exist in the package layer.

### Recommended improvements
- Introduce DTOs and validation pipes for every endpoint.
- Add auth guards and role-aware access control.
- Centralize error handling with a global exception filter.
- Add repository abstractions or service interfaces for persistence.
- Add environment-based configuration with a validated schema.
- Add automated tests for nutrition calculations and API endpoints.
- Introduce a CI pipeline and linting rules.

## 13. Setup instructions

```bash
corepack enable
corepack pnpm install
cp apps/server/.env.example apps/server/.env
corepack pnpm --filter @macrowise/server dev
```

## 14. Contribution guidelines

- Create a feature branch for every change.
- Keep commits focused and descriptive.
- Add tests for business logic and API behavior.
- Document public APIs and shared domain types.
- Prefer small, typed, reviewable changes.

## 15. Changelog

See [changelog.md](changelog.md) for release history and pending milestones.
