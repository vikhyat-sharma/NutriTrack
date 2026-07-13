# Changelog

## Unreleased

### Added
- Full auth flow: register, login, Google OAuth, password reset/confirm endpoints with DTOs and validation
- JWT auth guard applied to all protected routes (users, nutrition, meals, dashboard, assistant)
- Global HTTP exception filter for consistent error response shape
- `ConfigModule` integration — all secrets loaded from environment variables
- `UpdateProfileDto` with validation; `PATCH /users/me/profile` upserts profile
- Meals CRUD: `POST /meals`, `GET /meals?date=`, `PATCH /meals/:id`, `DELETE /meals/:id` with full DB persistence
- Dashboard endpoints: daily, weekly, monthly summaries and weight trend — all DB-backed with real macro aggregation
- Prisma schema updated: `Profile.updatedAt`, `FoodItem.mealItems` relation, `User.foodItems` relation
- Web app: full routing with React Router, TanStack Query, Zustand auth store, axios client with interceptors
- Web pages: AuthPage, ProfileSetupPage, DashboardPage, MealsPage, ProgressPage, AssistantPage
- Web components: `MacroBar` progress bar, `ProtectedRoute` guard
- Mobile app: React Navigation (stack + bottom tabs), TanStack Query, Zustand auth store
- Mobile screens: AuthScreen, DashboardScreen, MealsScreen, ProfileScreen, AssistantScreen
- `VITE_API_URL` env var support for web; `EXPO_PUBLIC_API_URL` for mobile
- Root workspace scripts for DB migrations, Prisma generate, and Prisma Studio

## 0.1.0
- Initial monorepo scaffold for NestJS server and domain package.
- Added Prisma schema for users, profiles, meals, and food tracking entities.
- Added a production-ready MacroWise architecture overview and implementation roadmap.
- Introduced a shared domain package for nutrition calculations and typed domain models.
- Added backend module scaffolding for nutrition, meals, dashboard, and assistant features.
- Added repository documentation with setup and contribution guidance.
