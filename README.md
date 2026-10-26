# StaffSync

StaffSync is a modern, containerized full-stack application designed for efficient organizational management. It features a robust Role-Based Access Control (RBAC) system that separates administrative oversight from individual employee task management.

## 🚀 Core Features

StaffSync operates with two primary user roles, each with strictly enforced permissions:

### 👑 Administrator Role
Administrators have full CRUD (Create, Read, Update, Delete) access across the entire system.
* **User Management:** Create new users, edit details, delete users, and promote standard employees to Administrator status.
* **Department Management:** Create, edit, and delete organizational departments.
* **Global Task Management:** Oversee, assign, edit, and delete tasks for any user in the system.

### 👤 Employee Role
Employees have a focused, restricted workspace.
* **Personal Task Management:** When logged in, employees can only view, create, edit, and delete their *own* tasks. They are completely sandboxed from other users' tasks and organizational settings.

## 🛠️ Tech Stack

This project is built using a modern, scalable, and fully containerized architecture:

* **Frontend:** Vue.js 3 (Composition API), Vite, Axios, Pinia State Management
* **Backend:** Grails 7 Framework, Spring Security REST (JWT Authentication), Java 21
* **Database:** PostgreSQL 15
* **Orchestration & Serving:** Docker, Docker Compose, Nginx

## ⚙️ How to Run the Application

The entire application (Database, Backend API, and Frontend web server) is orchestrated via Docker Compose. You do not need Java, Node.js, or PostgreSQL installed on your host machine—only Docker.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) or Docker Engine (Linux) installed and running.

### Quick Start

1. Clone the repository and navigate to the root directory containing the `docker-compose.yml` file.
2. Open your terminal and run the following command to build and launch the application:

   ```bash
   docker-compose up -d --build
   ```

3. **Wait a few moments:** The database will initialize, the Vue frontend will bundle, and the Grails Java backend will compile and boot up (this usually takes 15-30 seconds on the first run).

### Accessing the Application

Once the containers are successfully running, you can access the application via your browser:

* **Frontend UI (Vue/Nginx):** [http://localhost](http://localhost)
* **Backend API (Grails):** [http://localhost:8080](http://localhost:8080)

*Note: If port 80 is in use on your Windows machine (e.g., by IIS or Skype), you may need to map the frontend to a different port in the `docker-compose.yml` file (e.g., `"8081:80"`).*

## 🔐 Default Credentials

The database is automatically seeded with an initial Administrator account on startup. Use these credentials to log in and begin managing the system:

* **Username:** `admin`
* **Password:** `password123`

## 🛑 Stopping the Application

To safely stop the application without losing your database data (which is saved in a persistent Docker volume):

```bash
docker-compose stop
```

To completely tear down the containers and networks:

```bash
docker-compose down
```
*(Add the `-v` flag if you wish to wipe the database volume entirely).*