## Docker Networks

Docker networks allow containers to communicate with each other and with external systems.

For example, my Todo app has:

- Frontend container
- Backend container
- MongoDB Atlas (cloud database)

### Why Do We Need Docker Networks?

Suppose the frontend and backend run in separate containers.

A Docker network allows them to communicate directly when the request originates from inside a container.

```text
Frontend Container
        |
        | Docker Network
        |
        v
Backend Container
```

Without a shared network, containers on separate isolated networks generally cannot communicate directly.

### Default Docker Networks

When Docker is installed, it provides three built-in networks:

```bash
docker network ls
```

Common output:

```text
bridge
host
none
```

**bridge**

- The default network for containers started without a network specified.
- Containers on the default bridge can communicate using IP addresses.
- Automatic container-name DNS resolution is not provided by the default bridge.

**host**

- Uses the host's network environment instead of providing normal network isolation.
- Behaviour depends on the operating system and Docker configuration.

**none**

- Disables normal container networking, apart from the loopback interface.

### Creating a Custom Network

A user-defined bridge network is generally recommended for communication between containers.

```bash
docker network create todo-network
```

This creates a custom network named `todo-network`.

### Connecting Containers to a Network

```bash
docker network connect todo-network sharp_cray

docker network connect todo-network wizardly_hamilton
```

Here:

- `sharp_cray` is my backend container.
- `wizardly_hamilton` is my frontend container.
- Both containers are now connected to `todo-network`.

A container can be connected to multiple networks simultaneously.

In my case, both containers remain connected to the default `bridge` network as well as `todo-network`.

### Inspecting Networks

List all networks:

```bash
docker network ls
```

Inspect a particular network:

```bash
docker network inspect todo-network
```

This displays information such as:

- Connected containers
- Container IP addresses
- Network subnet
- Gateway
- Network driver

### Disconnecting a Container

```bash
docker network disconnect todo-network sharp_cray
```

This disconnects the backend container from `todo-network`.

It does not delete the container.

### Removing a Network

```bash
docker network rm todo-network
```

The network must have no connected containers before it can be removed.

### Container-to-Container Communication

On a user-defined bridge network, containers can communicate using their container names or network aliases.

For example, from inside the frontend container:

```text
http://sharp_cray:3000
```

Here:

- `sharp_cray` identifies the backend container.
- `3000` is the backend's internal listening port.

Docker's internal DNS resolves the container name to its IP address on the shared network.

This avoids depending on manually specified container IP addresses.

### Port Mapping vs Docker Network

Port mapping publishes a container port to the host.

Example:

```bash
docker run -d --name backend -p 3000:3000 todo-server
```

Now the backend is accessible from the host at:

```text
http://localhost:3000
```

Docker networking and port mapping serve different purposes.

- **Port mapping:** Allows the host or external clients to reach a container through a published port.
- **Docker network:** Allows containers to communicate with each other.

### My Todo App: Actual Network Setup

My containers:

```text
Frontend: wizardly_hamilton
Backend:  sharp_cray
```

I created and connected the custom network:

```bash
docker network create todo-network

docker network connect todo-network sharp_cray

docker network connect todo-network wizardly_hamilton
```

I verified the network using:

```bash
docker network inspect todo-network
```

The output showed both containers connected to the same network.

I tested container-to-container communication from the frontend container:

```bash
docker exec -it wizardly_hamilton sh

wget -qO- http://sharp_cray:3000/todo/todos
```

The response was:

```text
HTTP/1.1 401 Unauthorized
```

This confirmed that the request reached the backend. The `401` occurred because the endpoint uses JWT authentication and the test request did not include valid authentication credentials.

My backend defines these routes:

```typescript
app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);
```

The GET endpoint is:

```text
/todo/todos
```

The complete URL from a container on the custom network is:

```text
http://sharp_cray:3000/todo/todos
```

### Important: Browser Requests vs Container Requests

My frontend application is served on:

```text
http://localhost:5173
```

My backend is published on:

```text
http://localhost:3000
```

If frontend JavaScript runs in the browser and calls:

```typescript
fetch("http://localhost:3000/...");
```

the browser accesses the backend through the host's published port.

This request does not need to use the custom Docker network.

However, if a process inside the frontend container sends a request to the backend, it can use:

```text
http://sharp_cray:3000
```

This uses Docker's internal network and DNS.

**Important:** The hostname `sharp_cray` is for container-to-container communication. It is not normally resolvable by the user's browser.

### When Do I Need a Custom Network?

A custom network is useful when:

- A backend container communicates with a MongoDB container.
- One application container communicates with another container.
- Containers need to communicate using service or container names.
- I want to isolate application services on a dedicated network.

My current Todo app uses MongoDB Atlas, which is hosted in the cloud. Therefore, I do not need a Docker network between my backend and MongoDB Atlas.

The backend connects to Atlas over the network available to the container, typically through the internet.

---

## Docker Volumes

Docker volumes provide persistent storage that exists independently of a container's writable layer.

They are useful when data must survive container deletion and recreation.

### Why Do We Need Volumes?

Suppose I run MongoDB inside a Docker container and store five users in the database.

Without a volume, the data stored only in the container's writable layer is lost when that container is deleted.

With a volume, MongoDB's database files can remain available after the container is deleted.

```text
MongoDB Container
        |
        v
Docker Volume
        |
        v
Persistent Database Files
```

The volume survives container deletion unless the volume itself is deleted.

### Creating a Named Volume

```bash
docker volume create mongo-data
```

This creates a named volume called `mongo-data`.

### Using a Volume with MongoDB

```bash
docker run -d \
  --name mongo1 \
  -v mongo-data:/data/db \
  mongo
```

Understanding the command:

- `mongo-data` is the Docker volume name.
- `/data/db` is the database directory inside the MongoDB container.
- `-v` mounts the volume at the specified container path.

MongoDB stores its database files in the mounted directory.

### Reusing the Same Volume

Suppose I save five users in MongoDB today.

Tomorrow, I delete the container:

```bash
docker rm -f mongo1
```

Then I create a new container using the same volume:

```bash
docker run -d \
  --name mongo2 \
  -v mongo-data:/data/db \
  mongo
```

The new container can access the existing database files through `mongo-data`.

```text
Day 1:

mongo1
  |
  v
mongo-data
  |
  └── 5 users


Day 2:

mongo1 deleted

mongo-data
  |
  └── 5 users still stored

mongo2
  |
  v
Same mongo-data volume
  |
  └── Existing data available
```

Important conditions:

- The same volume must be attached.
- It must be mounted at the correct database directory.
- The MongoDB version and database files must be compatible.
- The volume must not have been deleted or corrupted.

A new container does not automatically receive the old container's volume unless I attach it.

### Named Volumes vs Anonymous Volumes

**Named volume**

I specify a meaningful name:

```bash
docker volume create mongo-data
```

Use it:

```bash
docker run -d \
  --name mongo \
  -v mongo-data:/data/db \
  mongo
```

Named volumes are easier to identify and reuse.

**Anonymous volume**

Docker assigns a volume a generated name rather than a meaningful name chosen by me.

For example:

```bash
docker run -d mongo
```

The official MongoDB image declares `/data/db` as a volume, so Docker can create an anonymous volume automatically.

Therefore, volumes can appear in `docker volume ls` even if I never ran `docker volume create`.

### Bind Mounts

A bind mount maps a specific path on my host machine to a path inside the container.

Example:

```bash
docker run -d \
  --name my-app \
  -v "$(pwd)/src:/app/src" \
  node:22
```

Here:

- `$(pwd)/src` is the host directory.
- `/app/src` is the directory inside the container.

Bind mounts are useful during development when I want changes made on my computer to be visible inside the container.

### Named Volume vs Bind Mount

| Feature | Named Volume | Bind Mount |
|---|---|---|
| Storage location | Managed by Docker | Specific host path |
| Typical use | Persistent database data | Development files |
| Host path selected manually | No | Yes |
| Survives container deletion | Yes, unless deleted | Host files remain |

### Volume Commands

List volumes:

```bash
docker volume ls
```

Inspect a volume:

```bash
docker volume inspect mongo-data
```

Remove a volume:

```bash
docker volume rm mongo-data
```

Remove unused volumes:

```bash
docker volume prune
```

Inspect a container's mounts:

```bash
docker inspect -f '{{json .Mounts}}' mongo
```

Important: `docker volume rm` can delete persistent data. `docker volume prune` can also remove unused volumes containing data I still need.

### Do Frontend and Backend Containers Need Volumes?

Usually, no.

**Frontend container**

If the React build files are included in the Docker image, I do not need a volume merely to preserve those files. I can recreate the container from the image.

A bind mount may be useful during development to make code changes visible inside the container.

**Backend container**

If the application code and dependencies are included in the image, I usually do not need a volume.

A volume or other persistent storage is useful if the backend saves files that must survive container recreation, such as user uploads.

**MongoDB container**

A volume is recommended when MongoDB runs inside Docker and I want its database files to persist.

### My Todo App: MongoDB Atlas

My current Todo app uses MongoDB Atlas rather than a MongoDB container.

The architecture is:

```text
Frontend Container
        |
        v
Backend Container
        |
        | Internet
        v
MongoDB Atlas
```

My backend connects using:

```typescript
mongoose.connect(mongoUri);
```

The connection string is stored in the `MONGO_URI` environment variable.

Because the database is stored in Atlas, I do not need a Docker volume for the database.

Atlas manages the database storage independently of my backend container.

### Final Concepts to Remember

**Docker Network**

- Enables communication between containers.
- User-defined bridge networks support container-name DNS resolution.
- Port mapping publishes container ports to the host.
- My Todo app's custom network is `todo-network`.

**Docker Volume**

- Provides storage independent of a container's writable layer.
- Useful for persistent database data.
- Must be reused by a new container to access the previous data.
- My current Todo app uses MongoDB Atlas, so a local MongoDB volume is not required.

**Golden rule:**

Network = Communication

Volume = Persistent Storage

Image = Application Template

Container = Running Instance of an Image