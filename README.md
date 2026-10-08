# Todo App
A full-stack Todo application built with React, TypeScript, Express, MongoDB, JWT, Recoil, Tailwind CSS, and Zod.
Tech Stack
```text
- Frontend: React, TypeScript, Vite, React Router, Recoil, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT with HttpOnly cookies
- Validation: Zod
- Shared Package: @09asad/common
```
### Project Structure
```text
todo-app/
├── client/      # React frontend
├── server/      # Express backend
└── common/      # Shared Zod schemas
```

### Features
```text
- User Signup & Login
- JWT authentication using HttpOnly cookies
- Protected Todo routes
- Create Todos
- View Todos
- Mark Todos as completed
- Logout
- Zod input validation
- Shared validation package using @09asad/common
- Responsive UI with Tailwind CSS
```

### Authentication
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
```text
credentials: "include"
```
### API Routes
Auth
```text
POST /auth/signup
POST /auth/login
POST /auth/logout
GET  /auth/me
```
Todos
```text
GET   /todo/todos
POST  /todo/todos
PATCH /todo/todos/:todoId/done
```
Zod Validation
The common folder contains shared Zod schemas and is published as:
```text
@09asad/common
```
Example:
```tsx
import { signupInput } from "@09asad/common";

const result = signupInput.safeParse(req.body);
```
Zod validates the input structure, while MongoDB is responsible for checking whether the user/credentials actually exist.
### Running Locally
Client
```text
cd client
npm install
npm run dev
```
Server
```text
cd server
npm install
npx tsc
node dist/index.js
```
Environment Variables
```text
Create .env inside server:
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```
Key Concepts
- React + TypeScript frontend
- Express REST API
- MongoDB with Mongoose
- JWT authentication
- HttpOnly cookies
- Express middleware
- Zod validation
- Shared npm package
- Recoil state management
- Tailwind CSS UI