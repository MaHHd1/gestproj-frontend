# GestProj Frontend

<div align="center">

[![GitHub Actions Build](https://github.com/your-username/gestproj-frontend/actions/workflows/build.yml/badge.svg)](https://github.com/your-username/gestproj-frontend/actions/workflows/build.yml)
[![GitHub Actions Test](https://github.com/your-username/gestproj-frontend/actions/workflows/test.yml/badge.svg)](https://github.com/your-username/gestproj-frontend/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-20.19%2B-brightgreen)](https://nodejs.org/)
[![Angular Version](https://img.shields.io/badge/Angular-21-red?logo=angular)](https://angular.io/)

</div>

---

**GestProj** is a collaborative project-management application designed for teams to streamline task management, project tracking, and team collaboration. This repository contains the **Angular 21 frontend client**; the Spring Boot API lives in the sibling [`gestproj-backend`](../gestproj-backend) repository.

### 🚀 Quick Links

- **[Frontend](https://github.com/your-username/gestproj-frontend)** | **[Backend](https://github.com/your-username/gestproj-backend)** | **[Full Stack Setup](#docker-deployment)**

---

## ✨ Features

✅ **Authentication** - Account registration, login, protected routes, and persisted JWT sessions  
✅ **Project Management** - Dashboard, project creation, settings, and progress statistics  
✅ **Task Management** - Board view with assignment, filters, priorities, due dates, and inline comments  
✅ **Team Collaboration** - Membership, permissions, invitations, notifications, and activity logs  
✅ **Deployment Integration** - Gitea repository views, workflow runs, jobs, and logs  
✅ **Deployment Tracking** - History with workflow and Docker-health metadata  

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Angular 21+ |
| **Language** | TypeScript 5.9+ |
| **Styling** | Tailwind CSS 4.3+ |
| **Package Manager** | npm 10.8.2+ |
| **Testing** | Vitest 4.0+ |
| **Code Quality** | Prettier 3.8+ |
| **Containerization** | Docker & Nginx |

---

## 📦 Run Locally

### Prerequisites

- **Node.js** 20.19+ (Angular 21 requirement)
- **npm** 10.x or higher (or compatible package manager)
- **Backend API** running on port `8080`

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:4200
# API requests target http://localhost:8080/api (configured in src/environments/environment.ts)
```

---

## 🧪 Build & Test

```bash
# Build for production
npm run build

# Run unit tests
npm test

# Watch mode for development
npm run watch
```

Test coverage reports are generated in the `coverage/` directory.

---

## 🔐 API & Authentication

- **Security**: JWT bearer tokens via interceptor; route guards protect authenticated pages  
- **Storage**: JWT stored in browser local storage for session persistence  
- **Production**: Uses relative `/api` URLs so Nginx can serve SPA and proxy API requests  
- **API Docs**: Backend Swagger UI available at `http://localhost:8080/swagger-ui.html`

---

## 🐳 Docker Deployment

### Full Stack Deployment

Run the entire application stack from the backend repository:

```bash
cd ../gestproj-backend
docker compose up --build
```

- **Frontend**: http://localhost:8081 (served by Nginx)
- **Backend API**: Proxied at `/api/` through Nginx
- **Swagger UI**: http://localhost:8080/swagger-ui.html

**Note**: Ensure the Nginx upstream matches your compose service names (default: `backend`).

---

## 📂 Project Structure

```
src/app/
├── core/          # Services, models, guards, interceptors
├── layout/        # Authenticated application shell
├── pages/         # Feature pages (auth, dashboard, projects, tasks, etc.)
└── shared/        # Reusable UI components & utilities

src/environments/  # Environment-specific config
src/styles.css    # Global styles
```

Detailed implementation roadmap: See [`frontend-master-plan.md`](frontend-master-plan.md)

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Code standards and conventions
- Development workflow
- Testing requirements
- Pull request process

---

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes and version history.

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for details.

---

## 👥 Authors & Contact

- **Project**: [gestproj-frontend](https://github.com/your-username/gestproj-frontend)
- **Full Stack**: [GestProj Organization](https://github.com/your-username)

For issues, questions, or suggestions, please open an [issue](https://github.com/your-username/gestproj-frontend/issues) on GitHub.
