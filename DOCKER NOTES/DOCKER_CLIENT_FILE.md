# Dockerfile for Client (Frontend)

A Dockerfile contains instructions for building a Docker image.

My client Dockerfile:

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## FROM node:22-alpine AS builder

```dockerfile
FROM node:22-alpine AS builder
```

This specifies the base image for the first build stage.

It provides:
- Node.js
- npm
- Alpine Linux environment

I use this stage to install dependencies and build my React application.

### What is `AS builder`?

`AS builder` gives a name to this build stage.

The name `builder` allows me to refer to this stage later in the Dockerfile.

For example:

```dockerfile
COPY --from=builder /app/dist /usr/share/nginx/html
```

Here, `--from=builder` refers to the stage named `builder`.

`AS builder` does not itself reduce the image size. It simply names the stage.

## WORKDIR

```dockerfile
WORKDIR /app
```

This creates or uses `/app` inside the container's build environment.

It is similar to:

```text
cd /app
```

It does NOT create a folder named `app` inside my actual client directory.

## COPY package*.json ./

```dockerfile
COPY package*.json ./
```

This copies files matching `package*.json` from the build context into `/app`.

For example:

```text
package.json
package-lock.json
```

The destination `./` means the current working directory inside the image, which is `/app`.

### Why copy package files separately?

Docker can cache this layer.

If my source code changes but `package.json` and `package-lock.json` remain unchanged, Docker can reuse the dependency-installation layer during the next build.

This makes rebuilding faster.

## RUN npm ci

```dockerfile
RUN npm ci
```

This installs the dependencies specified by `package-lock.json`.

`npm ci` is commonly used for reproducible installations, especially in CI pipelines.

Important:
- It requires a compatible `package-lock.json`.
- It installs the locked dependency versions.
- It normally fails if the lockfile and `package.json` are incompatible.
- It does not use my host machine's `node_modules`.

`npm ci` and `npm install` are both ways to install dependencies, but they behave differently.

## COPY . .

```dockerfile
COPY . .
```

This copies the remaining files from the build context into `/app`, except files excluded by `.dockerignore`.

Examples include:

```text
src/
public/
index.html
vite.config.ts
tsconfig.json
```


The first `.` means the Docker build context.

The second `.` means the current working directory inside the image, `/app`.

## RUN npm run build

```dockerfile
RUN npm run build
```

My `package.json` contains:

```json
"build": "tsc && vite build"
```

Therefore, this command:

1. Runs TypeScript's compiler and type checks.
2. Runs Vite's production build.
3. Generates optimized static files inside the `dist/` directory.

The build output looks approximately like this:

```text
/app/dist/
├── index.html
└── assets/
```

These are the files needed to serve the production frontend.

This command runs during the image build, not when the container starts.

---

# Second Stage: Nginx

## FROM nginx:alpine

```dockerfile
FROM nginx:alpine
```

This starts the second build stage using Nginx on Alpine Linux.

Nginx is a web server that can serve the compiled React application's static files to the browser.

Because this is a multi-stage build, the final image is based on `nginx:alpine`, not `node:22-alpine`.

The Node.js build environment and installed Node dependencies are not copied into the final image.

This helps keep the production image smaller.

## COPY --from=builder

```dockerfile
COPY --from=builder /app/dist /usr/share/nginx/html
```

This copies the production build output from the first stage into the Nginx web root in the second stage.

Breakdown:

```text
--from=builder
        ↓
Use the build stage named builder

/app/dist
        ↓
Source: compiled React files

/usr/share/nginx/html
        ↓
Destination: Nginx's default web root
```

Nginx serves the files from this directory when the browser requests the frontend.

## EXPOSE 80

```dockerfile
EXPOSE 80
```

This documents that the container's web server listens on port `80`.

Important: `EXPOSE` does not publish the port on my host machine.

To access the application, I used:

```bash
docker run -d -p 5173:80 --name todo-client todo-client:alpine
```

Here:

```text
Host port       Container port
   5173    →        80
```

I can open the application at:

```text
http://localhost:5173
```

## CMD

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

This is the default command executed when the container starts.

Breakdown:

- `nginx` starts the Nginx web server.
- `-g` passes a global Nginx configuration directive.
- `daemon off;` tells Nginx to remain in the foreground.

Why is `daemon off;` needed?

Nginx normally daemonizes, meaning it can run in the background. In a Docker container, the main process should remain in the foreground so Docker can track its lifecycle.

Unlike Nginx, Node.js normally stays in the foreground by default, so my backend command does not need `daemon off;`.

---

# Complete Build and Run Workflow

## 1. Build the image

From the `client` directory:

```bash
docker build -t todo-client:alpine .
```

- `docker build` builds the image.
- `-t todo-client:alpine` names the image and tag.
- `.` specifies the current directory as the build context.

## 2. Run the container

```bash
docker run -d -p 5173:80 --name todo-client todo-client:alpine
```

## 3. Open the frontend

```text
http://localhost:5173
```

## 4. View running containers

```bash
docker ps
```

## 5. View container logs

```bash
docker logs todo-client
```

## 6. Stop the container

```bash
docker stop todo-client
```

## 7. Remove the container

```bash
docker rm todo-client
```

## 8. Rebuild after frontend changes

When I change the React source code, CSS, or other frontend build inputs, the existing production image does not update automatically.

I need to build a new image and replace the running container:

```bash
docker rm -f todo-client
docker build -t todo-client:alpine .
docker run -d -p 5173:80 --name todo-client todo-client:alpine
```

For development, I can instead use Vite with a mounted volume to see code changes without rebuilding the production image each time.

---

# How the Frontend Dockerfile Works

```text
Node.js Alpine
      ↓
Install dependencies with npm ci
      ↓
Copy React source code
      ↓
Run npm run build
      ↓
Generate dist/ files
      ↓
Nginx Alpine
      ↓
Copy dist/ into Nginx web root
      ↓
Expose port 80
      ↓
Run Nginx in foreground
      ↓
Browser receives the frontend
```

**Important:** Nginx serves the frontend files, but it does not automatically run my Node.js backend. The frontend must still be able to reach the backend API separately.