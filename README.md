# Gym Management Web App (Next.js + Firebase)

Production-ready MVP gym management app with Firebase Authentication + Firestore.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Firebase Web SDK (Auth + Firestore)
- Static export deployable to Firebase Hosting

## Features
- Public landing page
- Email/password registration + login
- Role-based access (`member` / `admin`)
- Home dashboard
- Data entry module (CRUD)
- Member profile (height, weight, goal, optional age/gender/activity)
- Trainer information (list/search for members, CRUD for admin)
- Exercise information with optional image URL (list/search for members, CRUD for admin)
- Diet plan generator (dynamic calories/macros using profile + activity) + save to Firestore
- Workout plan generator (adaptive split + exercise selection from DB) + save to Firestore
- Admin users list (with role visibility)
- Optional sample trainer and exercise seeding buttons in admin

## Routes
Public:
- `/` (landing)
- `/login`
- `/register`

Protected:
- `/dashboard` (home page)
- `/data-entry` (CRUD)
- `/profile`
- `/trainers`
- `/exercises`
- `/plans/diet`
- `/plans/workout`

Admin-only:
- `/admin/trainers`
- `/admin/exercises`
- `/admin/users`

## Firebase Setup
1. Create Firebase project in console.
2. Enable Authentication:
- Go to `Authentication` -> `Sign-in method`
- Enable `Email/Password`
3. Create Firestore database:
- Go to `Firestore Database` -> `Create database`
- Start in production mode (recommended)
4. Create Web App in Firebase project settings and copy Firebase config values.
5. Configure env vars:
- Copy `.env.example` to `.env.local`
- Fill keys:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`

## Run Locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Admin Role Promotion (manual)
By default, every registered user gets `role: "member"`.
To promote a user:
1. Open Firestore -> `users` collection.
2. Find the document with that user's UID.
3. Change field `role` to `"admin"`.

## Firestore Security Rules
Rules file is at `firestore.rules` and enforces:
- `users`: user can read/write own doc, admin can read/write all
- `trainers`: authenticated read, admin write
- `exercises`: authenticated read, admin write
- `plans`: user read/write only own plans (`uid == auth.uid`), admin read all
- `entries`: user CRUD only own entries, admin read all

Deploy rules:
```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

## Deploy to Firebase Hosting (free tier compatible for static export)
This app uses static output through `output: "export"`.

1. Build static output:
```bash
npm run build
```
This generates the `out/` directory.

2. Initialize Firebase Hosting (first time):
```bash
firebase init hosting
```
Use these options:
- Public directory: `out`
- Single-page rewrite: `No`
- Overwrite `index.html`: `No`

3. Deploy hosting:
```bash
firebase deploy --only hosting
```

## Project Structure
- `src/app/*` pages/routes
- `src/components/AuthProvider.tsx` auth/session context
- `src/components/ProtectedRoute.tsx` auth and admin guards
- `src/lib/firebase.ts` Firebase initialization
- `src/lib/planGenerators.ts` client-side diet/workout generators
- `firestore.rules` Firestore access control
- `firebase.json` Hosting + Firestore rules config

## Notes
- No Cloud Functions used.
- No Firebase Storage used.
- Backend is fully hosted via Firebase Auth + Firestore.
