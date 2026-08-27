# Freelance Marketplace

A full-stack **Freelance Marketplace** platform that connects clients with skilled freelancers. Clients can post projects, review applications, and hire talent — while freelancers can browse opportunities, apply, and manage their work — all within a clean, role-based interface.

---

## 📁 Project Structure

```
freelance-marketplace/
├── Backend/     # Django REST Framework API
└── Frontend/    # React + Vite SPA
```

---

## 🛠️ Tech Stack

### Backend

| Technology                  | Purpose                               |
| --------------------------- | ------------------------------------- |
| **Python 3.12**             | Core language                         |
| **Django 6.x**              | Web framework                         |
| **Django REST Framework**   | REST API layer                        |
| **Simple JWT**              | JWT-based authentication              |
| **PostgreSQL 17**           | Primary relational database           |
| **Redis 7**                 | Caching & Celery message broker       |
| **Celery**                  | Asynchronous task queue               |
| **drf-spectacular**         | Auto-generated OpenAPI / Swagger docs |
| **Gunicorn**                | WSGI production server                |
| **Nginx**                   | Reverse proxy & static file serving   |
| **Docker & Docker Compose** | Containerisation                      |

### Frontend

| Technology          | Purpose                 |
| ------------------- | ----------------------- |
| **React 19**        | UI library              |
| **Vite 8**          | Build tool & dev server |
| **Redux Toolkit**   | Global state management |
| **React Router v7** | Client-side routing     |
| **Axios**           | HTTP client             |
| **Tailwind CSS v4** | Utility-first styling   |
| **Lucide React**    | Icon library            |
| **React Hot Toast** | Toast notifications     |

---

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** >= 18 & **npm**
- **Python** 3.12
- **PostgreSQL** 17 (for local backend setup)
- **Redis** (for local backend setup)
- **Docker** & **Docker Compose** (for Docker backend setup)

---

## 🖥️ Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd Frontend

# 2. Install dependencies
npm install

# 3. Copy the example environment file and configure it
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL to your backend URL
# e.g. VITE_API_BASE_URL=http://localhost:8000

# 4. Start the development server
npm run dev
```

The frontend will be available at **http://localhost:5173**

Other available scripts:

```bash
npm run build    # Build for production
npm run preview  # Preview the production build locally
npm run lint     # Run the linter (oxlint)
```

---

## 🔧 Backend Setup

### Option 1 — Local (without Docker)

#### 1. Navigate to the backend directory

```bash
cd Backend
```

#### 2. Create and activate a virtual environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

#### 3. Install dependencies

```bash
pip install -r requirements/development.txt
```

#### 4. Configure environment variables

Copy `.env.development` and update the values to match your local setup (DB credentials, Redis URL, and email settings).

#### 5. Apply database migrations

```bash
python manage.py migrate
```

#### 6. Create a superuser (optional)

```bash
python manage.py createsuperuser
```

#### 7. Collect static files

```bash
python manage.py collectstatic --noinput
```

#### 8. Start the Django development server

```bash
python manage.py runserver
```

#### 9. Start the Celery worker (open a separate terminal)

```bash
celery -A config worker -l info
```

The API will be available at **http://localhost:8000**

- Admin panel: http://localhost:8000/admin/
- API docs (Swagger): http://localhost:8000/api/schema/swagger-ui/

---

### Option 2 — Docker

> Requires Docker & Docker Compose installed and running.

#### 1. Navigate to the backend directory

```bash
cd Backend
```

#### 2. Review Docker environment variables

The `.env.docker` file is used by the `web` and `celery` containers. Review and update it with your preferred settings before building.

#### 3. Build and start all services

```bash
docker compose up --build
```

This spins up the following containers:

| Container                      | Service             | Port |
| ------------------------------ | ------------------- | ---- |
| `freelance-marketplace-api`    | Django / Gunicorn   | 8000 |
| `freelance-marketplace-db`     | PostgreSQL 17       | 5433 |
| `freelance-marketplace-redis`  | Redis 7             | 6379 |
| `freelance-marketplace-celery` | Celery Worker       | —    |
| `nginx`                        | Nginx reverse proxy | 80   |

#### 4. Run migrations inside the container

```bash
docker compose exec web python manage.py migrate
```

#### 5. Create a superuser (optional)

```bash
docker compose exec web python manage.py createsuperuser
```

#### 6. Stop all services

```bash
docker compose down
```

#### 7. Stop and remove all volumes ⚠️ (deletes all database data)

```bash
docker compose down -v
```

The API will be available at **http://localhost:8000** (or **http://localhost** via Nginx on port 80)

---

## 🌐 Environment Variables

### Backend — `.env.development`

| Variable               | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `DEBUG`                | Enable debug mode (`True` / `False`)             |
| `SECRET_KEY`           | Django secret key                                |
| `DATABASE_NAME`        | PostgreSQL database name                         |
| `DATABASE_USER`        | PostgreSQL username                              |
| `DATABASE_PASSWORD`    | PostgreSQL password                              |
| `DATABASE_HOST`        | Database host                                    |
| `DATABASE_PORT`        | Database port                                    |
| `CELERY_BROKER_URL`    | Redis URL for Celery broker                      |
| `REDIS_URL`            | Redis URL for caching                            |
| `EMAIL_HOST`           | SMTP email host                                  |
| `EMAIL_HOST_USER`      | SMTP email address                               |
| `EMAIL_HOST_PASSWORD`  | SMTP email password / app password               |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins |

### Frontend — `.env`

| Variable            | Description                 |
| ------------------- | --------------------------- |
| `VITE_API_BASE_URL` | Base URL of the backend API |

---
