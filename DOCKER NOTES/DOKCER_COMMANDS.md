# Docker Commands Cheat Sheet

## Docker Version / Information
```text
# Check Docker version
docker --version

# Docker system information
docker info

# Docker help
docker --help
```

## Docker Images
```tsx
# List local images
docker images

# Pull an image from Docker Hub
docker pull <image>

# Pull a specific tag/version
docker pull <image>:<tag>

# Build an image from Dockerfile
docker build -t <image-name> .

# Build with a specific tag
docker build -t <image-name>:<tag> .

# Remove an image
docker rmi <image>

# Force remove an image
docker rmi -f <image>
```

#### Examples: 
```text
docker pull mongo

docker build -t todo-server .

docker build -t todo-server:v1 .
```

## Run Containers
```tsx
# Create and start a container
docker run <image>

# Run in background
docker run -d <image>

# Give container a name
docker run --name <container-name> <image>

# Map host port → container port
docker run -p HOST_PORT:CONTAINER_PORT <image>

# Pass environment variable
docker run -e KEY=value <image>

# Load environment variables from .env
docker run --env-file .env <image>e>
```
#### Example 
```tsx
    docker run -d \
    --name todo-server \
    --env-file .env \
    -p 3000:3000 \
    todo-server
```

## Containers
```tsx
# Show running containers
docker ps

# Show all containers (including stopped)
docker ps -a

# Start an existing stopped container
docker start <container>

# Stop a running container
docker stop <container>

# Restart a container
docker restart <container>

# Remove a container
docker rm <container>

# Force remove a running container
docker rm -f <container>
```

#### Important Difference
```text
docker run
→ Creates NEW container + starts it

docker start
→ Starts an EXISTING stopped container

docker stop
→ Stops container

docker rm
→ Deletes container
```


## Logs & Debugging
These are extremely important when deploying/debugging applications.
```tsx
# View logs
docker logs <container>

# Follow logs in real time
docker logs -f <container>

# Inspect container
docker inspect <container>

# See processes running inside container
docker top <container>

# See resource usage
docker stats
```
#### Example: 
```text
docker logs -f todo-server
```

## docker exec
Run a command inside an already running container.
```tsx
# Execute a command
docker exec <container> <command>

# Open shell inside container
docker exec -it <container> sh

# Open bash shell
docker exec -it <container> bash
```
#### Example:
```tsx
docker exec -it todo-server sh
```
Once inside: 
```text
ls
pwd
cat package.json
```

## Port Mapping
```tsx
docker run -p HOST_PORT:CONTAINER_PORT <image>
```
Examples:
```tsx
docker run -p 3000:3000 todo-server

docker run -p 27018:27017 mongo
```
Meaning:
```text
HOST                 CONTAINER

localhost:3000  →    3000
localhost:27018 →    27017
```


## Environment Variables
```tsx
# Single variable
docker run -e PORT=3000 <image>

# Multiple variables
docker run \
  -e PORT=3000 \
  -e NODE_ENV=production \
  <image>

# .env file
docker run --env-file .env <image>
```
Never bake secrets into your Docker image.
Use:
```text
--env-file
```
or deployment-platform environment variables.

## Docker Hub
```tsx
# Login
docker login

# Tag image for Docker Hub
docker tag todo-server username/todo-server:latest

# Push image
docker push username/todo-server:latest

# Pull image
docker pull username/todo-server:latest
```
Typical workflow:
```text
Dockerfile
    ↓
docker build
    ↓
Image
    ↓
docker tag
    ↓
Docker Hub
    ↓
docker push
```
Someone else can then:
```tsx
docker pull username/todo-server:latest
docker run username/todo-server:latest
```

## Docker Networks
Very important when running multiple containers such as:

Docker Networks
Very important when running multiple containers such as:
```text
Backend
   ↕
MongoDB
```
Create a network:
```text
docker network create todo-network
```
Run MongoDB:
```tsx
docker run -d \
  --name mongo \
  --network todo-network \
  mongo
```
Run backend:
```tsx
docker run -d \
  --name todo-server \
  --network todo-network \
  -p 3000:3000 \
  todo-server
```
List networks:
```text
docker network ls
```
Inspect network:
```text
docker network inspect todo-network
```
Containers on the same network can communicate using container names.
```text
For example:

MONGO_URI=mongodb://mongo:27017/todo

instead of:

MONGO_URI=mongodb://localhost:27017/todo
```

## Docker Volumes
Important for persistent data, especially databases.
```tsx
# List volumes
docker volume ls

# Create volume
docker volume create mongo-data

# Use volume
docker run -d \
  --name mongo \
  -v mongo-data:/data/db \
  mongo

# Inspect volume
docker volume inspect mongo-data

# Remove volume
docker volume rm mongo-data
```
Without a volume, container data can be lost when the container is removed.

## Docker Compose
Very important when your application has multiple services.
Example:
```text
Todo App
├── Backend
└── MongoDB
```
Instead of running multiple docker run commands manually, use Docker Compose.
```text
# Start services
docker compose up

# Start in background
docker compose up -d

# Build and start
docker compose up --build

# Stop and remove services
docker compose down

# View running services
docker compose ps

# View logs
docker compose logs

# Follow logs
docker compose logs -f
```

## Cleanup
Useful when Docker starts consuming lots of disk space.
```text
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused networks
docker network prune

# Remove unused volumes
docker volume prune

# General cleanup
docker system prune
```
Be careful with aggressive cleanup commands because they can remove resources you still need.


## Dockerfile — Commands You Need to Know
These are the Dockerfile instructions you'll use most:
```tsx
FROM node:22

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "dist/index.js"]
```
Important instructions:
```text
FROM
WORKDIR
COPY
RUN
EXPOSE
CMD
ENV
```
Most important meanings
```text
FROM
→ Base image

WORKDIR
→ Working directory inside container

COPY
→ Copy files into image

RUN
→ Execute command while BUILDING image

EXPOSE
→ Document container port

CMD
→ Default command when container STARTS

ENV
→ Set environment variable
```

# Common Official Images & Ports

These are default application ports inside the containers:
```text
Image	Port	Use
mongo	27017	MongoDB
postgres	5432	PostgreSQL
mysql	3306	MySQL
redis	6379	Redis
nginx	80	HTTP
nginx	443	HTTPS
rabbitmq	5672	RabbitMQ
rabbitmq	15672	RabbitMQ Management UI
elasticsearch	9200	Elasticsearch API
kafka	9092	Kafka
```

Remember:
These are application defaults, not Docker-reserved ports.
