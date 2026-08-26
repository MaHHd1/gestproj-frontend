# GestProj Frontend

GestProj is a collaborative project-management application. This repository is its Angular 21 client; the Spring Boot API lives in the sibling [`../gestproj-backend`](../gestproj-backend) repository.

## Features

- Account registration, login, protected routes, and persisted JWT sessions.
- Project dashboard, project creation and settings, and progress statistics.
- Task board and task details with assignment, filters, priorities, due dates, and comments.
- Project membership and permissions, invitations, notifications, and activity logs.
- Optional Gitea repository views for commits and workflow runs, jobs, and logs.
- Deployment history with workflow and Docker-health metadata when supplied by the API.

## Run locally

Prerequisites: Node.js compatible with Angular 21 and the backend running on port `8080`.

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200). Development requests target `http://localhost:8080/api`, configured in `src/environments/environment.ts`.

## Build and test

```bash
npm run build
npm test
```

## API and authentication

The client sends authenticated API calls through a bearer-token interceptor and protects application routes with route guards. It stores the current JWT in browser local storage. The production environment uses the relative `/api` URL so an Nginx container can serve the SPA and proxy API requests under one origin.

The backend Swagger UI at `http://localhost:8080/swagger-ui.html` is the authoritative endpoint reference.

## Docker deployment

The frontend Dockerfile builds the Angular application and serves it with Nginx. Run the full stack from the backend repository:

```bash
cd ../gestproj-backend
docker compose up --build
```

The frontend is published at `http://localhost:8081`; its Nginx configuration serves client-side routes and proxies `/api/`. The checked-in proxy upstream is `backend-funnel`, whereas the sibling Compose file calls the service `backend`; align those names in the deployment network before using the containerized frontend API.

## Project structure

```text
src/app/
  core/       API services, models, guards, and interceptors
  layout/     authenticated application shell
  pages/      auth, dashboard, project, task, invitation, profile, and notification screens
  shared/     reusable UI such as toast notifications
```

See [`frontend-master-plan.md`](frontend-master-plan.md) for the implementation status and backend-dependent roadmap.
