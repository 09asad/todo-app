# DOCKER NOTES

## What is Docker?

Docker is a platform used to **build, package, and run applications inside containers**.

It solves the "works on my machine" problem by packaging the application along with its required environment and dependencies.

### Without Docker

My application depends on:

- Node.js version
- npm packages
- OS/environment
- configuration

Another machine may have different versions or configurations.

### With Docker

We package the application into a Docker image and run it as a container.

```text
Application + Dependencies + Runtime
              ↓
         Docker Image
              ↓
         Docker Container
```

## Docker Image vs Container

### Docker Image
An image is a blueprint/template used to create containers.

It contains things like:

- Application code
- Dependencies
- Runtime
- Required filesystem
- Configuration/instructions

Example:
```text
todo-server:latest
```
is an image.

### Docker Container
A container is a running instance of an image.
```text
    Image
    ↓
    Container
```
One image can be used to create multiple containers.

For example:
```text
todo-server image
       ↓
 ┌─────┼─────┐
 ↓     ↓     ↓
C1    C2    C3
```
Each container is an independent running instance.

## Docker Hub
Docker Hub is a public registry where Docker images can be stored and downloaded.
For example:
```text
docker pull mongo
```
downloads the official MongoDB image from Docker Hub.

## Docker Engine / Docker Desktop
On Windows, Docker Desktop runs the Docker engine/backend required to run containers.

Before using commands such as:
```text
docker run
docker build
docker ps
```
Docker Desktop should be running.

Docker commands can be executed from:

- Git Bash
- PowerShell
- Command Prompt
- WSL

## Pulling an Image
```text
docker pull mongo
```
This downloads the MongoDB image from Docker Hub.
However, docker pull is not always necessary.
If the image doesn't exist locally, Docker can automatically pull it when running:
```text
docker run mongo
```

## Running a Container
```text
docker run mongo
```
This:
1. Looks for the mongo image locally.
2. Downloads it from Docker Hub if necessary.
3. Creates a container.
4. Starts the container.
7. Port Mapping
Containers have their own network environment.
Suppose MongoDB listens on:
```tsx
27017
```
inside the container.
To access it from my host machine, I need to publish the port.
Syntax:
```tsx
docker run -p HOST_PORT:CONTAINER_PORT image
```
Example:
```tsx
docker run -p 27018:27017 mongo
```
This means:
```text
Host                    Container

localhost:27018  --->   27017
                         MongoDB
```

So my application on the host can connect to:
```tsx
localhost:27018
```
### Why different host ports?
I can run multiple MongoDB containers:
```tsx
docker run -p 27018:27017 mongo
docker run -p 27019:27017 mongo
docker run -p 27020:27017 mongo
```
All containers use 27017 internally, but each gets a different host port.
```tsx
Host                Container

27018  ---------->  27017
27019  ---------->  27017
27020  ---------->  27017
```

## EXPOSE
In a Dockerfile:
```tsx
EXPOSE 3000
```
This tells Docker:
My application is expected to listen on port 3000 inside the container.

Important:
EXPOSE does NOT publish the port to my host.
I still need:
```tsx
docker run -p 3000:3000 todo-server
```
So:
```text
EXPOSE
   ↓
Documentation / declaration

-p
   ↓
Actually publishes the port
```

## Dockerfile for server (Backend)
A Dockerfile contains instructions for building a Docker image.
My server Dockerfile:
```tsx
FROM node:22

WORKDIR /app

COPY . .

RUN npm install

RUN npx tsc -b

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### FROM
```tsx
FROM node:22
```
This specifies the base image.
It provides:
- Node.js
- npm
- Linux environment
Docker will pull node:22 if it is not already available locally.
The Node.js version installed on my host machine does not control the Node.js version inside the container.

#### Node Image Variants
Examples:
```text
FROM node:22

FROM node:22-alpine

FROM node:22-slim
```
node:22 -> Normal Node image.
Good choice for learning and compatibility.

node:22-alpine -> Uses Alpine Linux and is much smaller.
However, some native dependencies can have compatibility issues.

node:22-slim -> A smaller Debian-based image.

For now, node:22 is the easiest choice for learning.

### WORKDIR
```tsx
WORKDIR /app
```
This creates/uses /app inside the Docker image/container.
It is similar to:
```text
cd /app
```
inside the container.
It does NOT create:
```text
server/app
```
on my actual computer.


### COPY
```tsx
COPY . .
```
There are two dots:
```text
COPY source destination
     ↓      ↓
     .      .
```
The first . means:
Current Docker build context

The second . means:
Current directory inside the image

Since:
```text
WORKDIR /app
```
the destination becomes:
```text
/app
```
Therefore:
```text
COPY . .
```
means:
```text
Build Context
     ↓
   /app
```
Important:
Docker can only copy files that are inside the build context.

### Docker Build Context
If I run:
```tsx
docker build -t todo-server .
```
the final . means:
Use the current directory as the Docker build context.

Docker sends the files from that context to the Docker daemon, except files excluded by .dockerignore.

### RUN npm install
```tsx
RUN npm install
```
This installs the project's dependencies inside the Docker image.
It does not use my host machine's node_modules.
The dependencies are installed in the image's filesystem.

### RUN npx tsc -b
```tsx
RUN npx tsc -b
```
This compiles the TypeScript application during the Docker image build.
My local workflow was:
```tsx
tsc -b
node dist/index.js
```
The Dockerfile performs the compilation during the image build.

### CMD
```tsx
CMD ["node", "dist/index.js"]
```
This is the default command executed when the container starts.
In my case:
```text
Container starts
      ↓
node dist/index.js
      ↓
Server starts
```

### docker build
To build an image from the Dockerfile:
```tsx
docker build -t todo-server .
```
Meaning:
```text
docker build
     ↓
Build an image

-t todo-server
     ↓
Give the image the name "todo-server"

.
     ↓
Use the current directory as build context
```
After a successful build:
```text
todo-server:latest
```
is created.


### .dockerignore
.dockerignore controls which files are excluded from the Docker build context.
Example:
```text
node_modules
dist
.env
.git
```
Why?
node_modules
We don't need to copy host dependencies.
Docker will install them using:
```tsx
RUN npm install
```
dist
We don't need the existing compiled files.
Docker will generate them using:
```tsx
RUN npx tsc -b
```
.env
Environment variables/secrets should generally not be baked into the image.
.git
Git history is not required inside the Docker image.

### .gitignore vs .dockerignore
These are different.
.gitignore
Controls what Git tracks.
```text
.gitignore
   ↓
Git
```
.dockerignore
Controls what gets sent to Docker as build context.
```text
.dockerignore
   ↓
Docker build
```
A file can be ignored by one and not the other.

### Environment Variables in Docker
My .env file contains environment variables such as:
```text
PORT=3000
MONGO_URI=mongodb://...
```
The .env file is included in .dockerignore, so it is not copied into the image.
Instead, I can provide it when starting the container:
```tsx
docker run --env-file .env -p 3000:3000 todo-server
```
This means:
```text
.env on my computer
        ↓
Docker
        ↓
Environment variables inside container
        ↓
process.env
```
The application can access them using:
process.env.MONGO_URI

### Running My Docker Image
After building:
```tsx
docker run --env-file .env -p 3000:3000 todo-server
```
This:
1. Creates a container from todo-server.
2. Loads environment variables from .env.
3. Maps host port 3000 to container port 3000.
4. Starts node dist/index.js.

### Attached vs Detached Mode
By default:
```tsx
docker run todo-server
```
runs the container in the foreground.
The terminal remains attached to the container's output.
Detached mode:
```tsx
docker run -d todo-server
```
-d means:
```text
detached mode
```
The container runs in the background and my terminal is immediately available.