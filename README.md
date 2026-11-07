# AIO - One world. Every connection.

**AIO** is an all-in-one social platform designed to bring people, conversations, communities, and content together in one connected experience.

Instead of switching between multiple social applications, AIO aims to provide a unified space to discover content, share updates, connect with people, communicate, and participate in communities.

> One world. Every connection.

## About the Project

AIO is an independently developed social platform with a focus on a clean interface, connected experiences, and a flexible foundation for future growth.

The project is actively evolving, with its web experience and backend being developed together in a monorepo.

## Features

The platform is being developed around these experiences:

- **Stream** --- Browse and interact with shared posts.
- **Discover** --- Explore content and find new connections.
- **Clips** --- A dedicated space for short-form content.
- **Flow** --- An additional content and social experience.
- **Messages** --- Communicate with other users.
- **Spaces** --- Participate in communities and shared spaces.
- **Profiles** --- View user profiles and social connections.
- **Notifications** --- Stay informed about platform activity.
- **Saved** --- Keep bookmarked content accessible.
- **Settings** --- Manage account and application preferences.
- **Theme support** --- Switch between light and dark appearances.

*Features and functionality are subject to ongoing development.*

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, CSS |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, bcrypt |
| Real-time communication | Socket.IO |
| Validation | Zod |
| Icons | Lucide React |
| Monorepo tooling | Turborepo, npm workspaces |

## Project Structure

```text
AIO/
--------- apps/
---   --------- web/                  # Next.js frontend
---       --------- app/
---       --------- components/
---       --------- lib/
---
--------- backend/                  # Express backend
---   --------- src/
---       --------- config/
---       --------- controllers/
---       --------- middleware/
---       --------- models/
---       --------- routes/
---       --------- socket/
---       --------- utils/
---
--------- packages/                 # Shared project packages
--------- scripts/                  # Project scripts
--------- package.json
--------- turbo.json
--------- README.md
```

## Getting Started

### Prerequisites

Install the following before running AIO:

- Node.js (compatible with the project dependencies)
- npm
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/saisanthosharyan/AIO.git
cd AIO
```

### 2. Install frontend and workspace dependencies

Run this command from the repository root:

```bash
npm install
```

### 3. Configure the backend

Create a file named `.env` inside the `backend` directory.

```env
MONGODB_URI=mongodb://127.0.0.1:27017/aio
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
CLIENT_URL=http://localhost:3000
```

Replace the MongoDB connection string with your own database connection string if you use MongoDB Atlas.

**Important:** Use a strong, private JWT secret. Never commit environment files, database credentials, or API secrets.

Install backend dependencies:

```bash
cd backend
npm install
```

### 4. Configure the frontend

Create a file named `.env.local` inside `apps/web`.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 5. Run the backend

Open a terminal:

```bash
cd backend
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### 6. Run the frontend

Open a second terminal at the repository root:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

Open the application in your browser:

**http://localhost:3000**

## Available Commands

### Root commands

Run these from the repository root:

| Command | Description |
|---|---|
| `npm run dev` | Start workspace development servers |
| `npm run build` | Build workspace applications |
| `npm run lint` | Run workspace lint tasks |
| `npm run typecheck` | Run workspace TypeScript checks |
| `npm run test` | Run configured workspace tests |

### Backend commands

Run these from the `backend` directory:

| Command | Description |
|---|---|
| `npm run dev` | Start backend in development mode |
| `npm run build` | Compile backend TypeScript |
| `npm run start` | Start compiled backend |
| `npm run typecheck` | Check backend TypeScript types |

## Development Notes

- The frontend and backend run as separate applications.
- The backend uses MongoDB for data persistence.
- Socket.IO provides the foundation for real-time communication.
- Environment files are excluded from Git.
- The project is under active development, and architecture and features may evolve.

## Vision

AIO aims to make digital social experiences feel more connected.

A place where content, communication, communities, and connections come together --- without making users feel like they are moving between disconnected applications.

**AIO --- One world. Every connection.**

---

### Developer

Designed and developed by **K Sri Sai Santhosh Aryan**.

- [GitHub](https://github.com/saisanthosharyan)
- [LinkedIn](https://linkedin.com/in/sri-sai-santhosh-aryan-k-316767280)
