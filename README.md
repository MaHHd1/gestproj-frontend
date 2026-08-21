# GestProj Frontend

Angular 21 frontend for the GestProj collaborative project-management application.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200`. The development API base URL is `http://localhost:8080`.

## Build and test

```bash
npm run build
npm test
```

## Deployment monitoring

The project page supports optional Gitea repository details and deployment history. Linked projects can display recent commits and deployments through:

- `GET /projects/{projectId}/commits`
- `GET /projects/{projectId}/deployments`

Deployment records include the status, commit, trigger, and timestamps. Where supplied by the server, they also include workflow metadata, deployment target, Docker health status, and diagnostic details. Project settings use `repoOwner`, `repoName`, `deploymentHost`, and `deploymentContainer` to describe the repository and server target.

## Production server configuration

The production environment points to `http://100.83.8.6:8081`. The backend CORS configuration must allow the frontend origin `http://100.83.8.6:4200` (and any additional production origin).

The Gitea Actions deployment workflow builds the Docker image, replaces the `frontend` container on `infra_infra_net`, verifies the HTTP service on port 80, and records the outcome in the backend deployment history.
Aa
