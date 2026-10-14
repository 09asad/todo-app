# Docker Bind Mount

## 1. What is a Bind Mount?

A bind mount connects a specific file or directory on the host machine to a file or directory inside a Docker container.

This allows the container to access files directly from the host machine.

For example, if we modify our source code on our laptop, the changes become visible inside the container without rebuilding the Docker image.

**Example:**

```text
Host Machine                         Docker Container
-----------                          ----------------
todo-app/client/       <---------->  /app/
    src/App.tsx                       src/App.tsx
```

Both locations access the same underlying files.

---

## 2. Why Do We Use Bind Mounts?

Bind mounts are especially useful during local development.

Without bind mounts, we might need to rebuild our Docker image whenever we modify source code.

With bind mounts:

- Changes to host files become visible inside the container.
- We can test code changes without rebuilding the image.
- Development tools such as Vite can detect file changes and refresh the application automatically.
- We can share configuration files or other required files with a container.

**Important:** A bind mount shares files; it does not automatically restart or reload the application. Automatic reload depends on the development server or application configuration.

---

## 3. Bind Mount vs. Docker Volume

| Feature | Bind Mount | Docker Volume |
|---|---|---|
| Storage location | Specific host file or directory | Docker-managed storage |
| Location chosen by | User | Docker manages the storage location |
| Common use | Local development and sharing files | Persistent application or database data |
| Example | `./client:/app` | `mongo_data:/data/db` |

### Bind mount example

```bash
docker run -v ./client:/app node:22-alpine
```

Here, the local `client` directory is mounted inside the container at `/app`.

### Volume example

```yaml
services:
  mongodb:
    image: mongo
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

Here, Docker manages the storage for `mongo_data`, which is useful for persistent MongoDB data.

---

## 4. Using a Bind Mount with `docker run`

Example:

```bash
docker run -d \
  --name my-node-app \
  -p 3000:3000 \
  -v "$(pwd):/app" \
  -w /app \
  node:22-alpine \
  node index.js
```

### Understanding the command

- `-d`: Runs the container in detached mode.
- `--name my-node-app`: Assigns a name to the container.
- `-p 3000:3000`: Maps host port 3000 to container port 3000.
- `-v "$(pwd):/app"`: Mounts the current host directory into `/app` inside the container.
- `-w /app`: Sets `/app` as the container's working directory.
- `node index.js`: Starts the Node.js application.

This example assumes the current directory contains `index.js` and the application dependencies are available inside the mounted directory.

### Bind Mount Syntax

```bash
-v HOST_PATH:CONTAINER_PATH
```

Example:

```bash
-v ./client:/app
```

- `./client`: Directory on the host machine, relative to the current working directory.
- `/app`: Mount destination inside the container.

On Windows, Docker Desktop handles sharing host directories with Linux containers.

---

## 5. Using Bind Mounts in Docker Compose

Bind mounts can be configured inside a Compose YAML file using the `volumes` property.

We created a separate `compose.dev.yaml` file in the root directory of our Todo App for development.

Project structure:

```text
todo-app/
├── client/
│   ├── src/
│   └── package.json
├── server/
│   ├── src/
│   ├── package.json
│   └── .env
├── compose.yaml
└── compose.dev.yaml
```

- `compose.yaml`: Runs our published Docker Hub images.
- `compose.dev.yaml`: Defines our local development setup using bind mounts.

### Example: Frontend Development

```yaml
services:
  todo-client:
    image: node:22-alpine
    working_dir: /app
    volumes:
      - ./client:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    command: sh -c "npm install && npm run dev -- --host 0.0.0.0"
```

### Explanation

**`./client:/app`**

Mounts the local frontend directory into the container.

Changes to files on the host become visible inside the container.

**`/app/node_modules`**

Creates an anonymous Docker-managed volume at `/app/node_modules`. This prevents the bind mount from hiding dependencies installed inside the container at that location.

**`working_dir: /app`**

Sets the working directory inside the container.

**`command`**

Installs dependencies and starts the Vite development server.

This example assumes the frontend has a working Vite `dev` script in `package.json`.

---

## 6. Using Bind Mounts for the Todo Backend

Example development service:

```yaml
services:
  todo-server:
    image: node:22-alpine
    working_dir: /app
    volumes:
      - ./server:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    env_file:
      - ./server/.env
    command: sh -c "npm install && npm run dev"
```

### Explanation

- `./server:/app`: Shares the local backend directory with the container.
- `/app/node_modules`: Keeps the container's dependencies separate from the host's dependencies.
- `env_file`: Supplies the backend's environment variables.
- `npm run dev`: Starts the backend's development script.

This is an example configuration. It assumes `server/package.json` has a suitable `dev` script that can run the backend, including its TypeScript setup if required.

The backend must listen on `0.0.0.0` inside the container to accept connections through the published port.

---

## 7. How to Run the Development Setup

Run these commands from the root directory of the Todo App.

### Start the development containers

```bash
docker compose -f compose.dev.yaml up
```

Compose creates and starts the configured services.

### Run in detached mode

```bash
docker compose -f compose.dev.yaml up -d
```

The containers run in the background.

### View logs

```bash
docker compose -f compose.dev.yaml logs -f
```

Streams logs from the development services.

### Stop the services

```bash
docker compose -f compose.dev.yaml down
```

Stops and removes the development containers and the Compose project's default network.

Named and anonymous volumes are not normally removed by this command.

---

## 8. Bind Mount vs. CI/CD

Bind mounts and CI/CD solve different problems.

### Bind Mount: Local Development

```text
Modify source code on your PC
          ↓
Bind mount shares the files
          ↓
Local container accesses the changes
          ↓
Development server may reload automatically
```

This is useful when experimenting with new features and testing code locally.

### CI/CD: Image Publishing and Deployment

```text
Modify source code
          ↓
Push code to GitHub
          ↓
CI/CD builds a new Docker image
          ↓
Push image to Docker Hub
          ↓
Deployment process updates the server
```

Bind mounts do not automatically update Docker Hub images or synchronize your local files with a remote server.

Production deployments generally use versioned Docker images rather than bind-mounting the application's source code.

---

## 9. Important Notes

1. A bind mount connects a host path to a path inside a container.
2. Changes to mounted files are visible at the container mount location.
3. Rebuilding the Docker image is often unnecessary for source-code changes during development.
4. The application may need a development server or restart to apply changes.
5. Bind mounts do not automatically update a Docker image stored on Docker Hub.
6. Bind mounts can be configured using `docker run -v` or in Compose using `volumes`.
7. A bind mount can hide files already present at the container's mount destination.
8. The `./client:/app` and `./server:/app` examples assume the corresponding folders exist in the project root.
9. Be careful when mounting host directories because the container can modify host files if it has write access.
10. Bind mounts are particularly useful for local development, while Docker volumes are commonly used for persistent database data.

---

## 10. Quick Revision

| Term | Meaning |
|---|---|
| Bind mount | Shares a host file or directory with a container |
| Host path | File or directory on your PC |
| Container path | Destination inside the container |
| `-v` | Mount option for `docker run` |
| `volumes` | Compose property used to configure mounts |
| Hot reload | Development tool automatically applies detected changes |
| CI/CD | Automates building, publishing, testing, and/or deploying application changes |

**Remember:** Bind mount = share local files with a container. Docker volume = Docker-managed storage. CI/CD = automate the delivery and deployment workflow.