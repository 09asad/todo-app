# Todo App

A full-stack Todo application built with React, TypeScript, Express, MongoDB, JWT, Recoil, Tailwind CSS, and Zod.

## Tech Stack

```text
- Frontend: React, TypeScript, Vite, React Router, Recoil, Tailwind CSS
- Backend: Node.js, Express, MongoDB Atlas, Mongoose
- Authentication: JWT with HttpOnly cookies
- Validation: Zod
- Shared Package: @09asad/common
- Containerization: Docker
```

## Project Structure

```text
todo-app/
├── client/      # React frontend
├── server/      # Express backend
└── common/      # Shared Zod schemas
```

## Features

- User Signup & Login
- JWT authentication using HttpOnly cookies
- Protected Todo routes
- Create Todos
- View Todos
- Mark Todos as completed
- Logout
- Zod input validation
- Shared validation package using `@09asad/common`
- Responsive UI with Tailwind CSS
- Dockerized frontend and backend using separate Docker images and containers

## Authentication

JWT is stored in an HttpOnly cookie by the backend.

```text
Login
  ↓
JWT generated
  ↓
HttpOnly Cookie
  ↓
authenticateJwt middleware
  ↓
Protected Todo routes
```

Frontend requests include the cookie using:

```typescript
credentials: "include"
```

## API Routes

### Auth

```text
POST /auth/signup
POST /auth/login
POST /auth/logout
GET  /auth/me
```

### Todos

```text
GET   /todo/todos
POST  /todo/todos
PATCH /todo/todos/:todoId/done
```

## Zod Validation

The `common` folder contains shared Zod schemas published as:

```text
@09asad/common
```

Example:

```typescript
import { signupInput } from "@09asad/common";

const result = signupInput.safeParse(req.body);
```

Zod validates input structure, while authentication logic and database queries handle credential verification and user lookup.

## Running Locally

### Client

```bash
cd client
npm install
npm run dev
```

### Server

```bash
cd server
npm install
npx tsc
node dist/index.js
```

## Environment Variables

Create `.env` inside the `server` directory:

```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
```

Keep environment variables and secrets out of version control.

## Dockerization

The frontend and backend are containerized separately using Docker.

**Docker Images**

```text
todo-client:alpine
todo-server:alpine
```

**Running Containers**

```text
Frontend Container → Port 5173 (host) → Port 80 (container)
Backend Container  → Port 3000 (host) → Port 3000 (container)
```

**Docker Network**

A custom bridge network named `todo-network` was created to enable container-to-container communication using container names.

```text
todo-network
├── Frontend: wizardly_hamilton
└── Backend:  sharp_cray
```

Both containers can communicate through this network. For example, a process inside the frontend container can reach the backend using `http://sharp_cray:3000`.

Browser-based API requests use the backend's published host port, such as `http://localhost:3000`.

**Database:** MongoDB Atlas is used as the cloud database, so a local MongoDB container and its persistent Docker volume are not required for this setup.

## Key Concepts

- React + TypeScript frontend
- Express REST API
- MongoDB Atlas with Mongoose
- JWT authentication and HttpOnly cookies
- Express middleware
- Zod validation
- Shared npm package
- Recoil state management
- Tailwind CSS UI
- Docker images and containers
- Docker networking
