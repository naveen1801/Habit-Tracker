# HabitCanvas: Habit Tracker with Accountability

A full-stack habit-tracking web app built with the **MERN stack**. Users create daily habits, submit proof of completion, and have a **guardian** (a friend or mentor) approve it. That turns habit tracking into real accountability.

## Features

- **Authentication:** register and login with **JWT**, passwords hashed with **bcrypt**, **email OTP verification** (Nodemailer), and **Google sign-in**
- **Habits:** create, edit and delete habits with frequency, specific days, category, reminders and proof type
- **Proof submission:** upload a photo or text as proof that a habit was done (Multer file uploads)
- **Guardian approval:** assign a guardian by email; they approve or reject each submission
- **Streaks and analytics:** daily streaks, weekly progress, completion rates, a GitHub-style activity **heatmap** and **Chart.js** graphs
- **Social:** friends, friend requests, side-by-side comparison, a **leaderboard** and a **community feed** with likes
- **Wellness:** water-intake tracker and **Pomodoro** focus sessions
- **Habit coach:** a rule-based coach that reads your habit history and suggests the next small step, plus a weekly report

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, React Router, Tailwind CSS, Chart.js, react-calendar-heatmap |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| Auth and security | JWT, bcrypt, email OTP (Nodemailer), Google OAuth |
| File uploads | Multer |

## Project structure

```text
Habit-Tracker/
├─ habit app/               # Express + MongoDB backend
│  ├─ server.js             # REST API (auth, habits, guardian, friends, analytics…)
│  └─ models/               # Mongoose schemas: User, Habit, HabitLog, Friend, …
├─ habit-frontend-vite/     # React + Vite frontend
│  └─ src/
│     ├─ pages/             # Dashboard, MyHabits, Analytics, Friends, Leaderboard, …
│     ├─ components/        # HabitCard, HabitForm, HabitHeatmap, WeeklyProgress, …
│     └─ services/api.js    # API client
└─ package.json             # Root scripts: build the frontend, start the server
```

## Run locally

**Prerequisites:** Node.js 20+, and MongoDB (local or a free MongoDB Atlas cluster).

1. **Backend environment:** create `habit app/.env` (see `habit app/.env.example`):

   ```env
   MONGO_URI=mongodb://localhost:27017/habitcanvas
   JWT_SECRET=replace-with-a-long-random-string
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-gmail-app-password
   PORT=3000
   ```

2. **Start the backend:**

   ```bash
   cd "habit app"
   npm install
   npm start          # http://localhost:3000
   ```

3. **Start the frontend** (in a second terminal):

   ```bash
   cd habit-frontend-vite
   npm install
   npm run dev        # http://localhost:5173
   ```

In development the frontend calls `http://localhost:3000` automatically. To point it at another API, set `VITE_API_URL`.

### Single-server production build

From the repository root:

```bash
npm run build   # installs deps and builds the React app into habit-frontend-vite/dist
npm start       # Express serves both the API and the built frontend
```

## Main API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register`, `/login` | Create an account or log in (returns a JWT) |
| POST | `/send-otp`, `/verify-otp` | Email OTP verification |
| POST | `/auth/google` | Google sign-in |
| GET / POST | `/habits` | List or create habits |
| PUT / DELETE | `/habits/:habitId` | Update or delete a habit |
| POST | `/habits/:habitId/submit` | Submit proof (file upload) |
| GET | `/guardian/requests` | Submissions waiting for your approval |
| POST | `/guardian/approve/:logId`, `/guardian/reject/:logId` | Review a submission |
| GET | `/streak`, `/weekly-stats`, `/analytics` | Progress and stats |
| GET / POST | `/friends`, `/friends/request` | Friends |
| GET | `/leaderboard` | Leaderboard |
| GET / POST | `/community/feed`, `/community/post` | Community feed |
| POST | `/ai/coach` | Habit coach reply |

All routes except auth require an `Authorization: Bearer <token>` header.

## Author

**Naveen Agarwal**, B.E. Computer Science and Engineering, SSN College of Engineering
[GitHub](https://github.com/naveen1801) · [LinkedIn](https://linkedin.com/in/naveen-agarwal-262b1b29a)
