# GestProj Frontend Architecture

This document describes the architecture, design decisions, and high-level organization of the GestProj Frontend Angular application.

---

## 🏗️ System Overview

**GestProj Frontend** is a Single Page Application (SPA) built with Angular 21 that serves as the client interface for collaborative project management. It communicates with the **GestProj Backend** (Spring Boot) via RESTful APIs and implements JWT-based authentication.

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
│              (GestProj Angular Frontend)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/HTTPS
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
    ┌─────────────┐            ┌──────────────────┐
    │   Nginx     │            │  Backend API     │
    │  (Routing   │───────────▶│  (Spring Boot)   │
    │   Proxy)    │            │  Port: 8080      │
    └─────────────┘            └──────────────────┘
         Port: 8081                    │
                                       ▼
                               ┌──────────────────┐
                               │  PostgreSQL      │
                               │  Database        │
                               └──────────────────┘
```

---

## 📁 Directory Structure

```
gestproj-frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services, guards, interceptors
│   │   │   ├── services/            # API services (User, Project, Task, etc.)
│   │   │   ├── models/              # Data models and interfaces
│   │   │   ├── guards/              # Route guards (auth, etc.)
│   │   │   └── interceptors/        # HTTP interceptors (JWT, error handling)
│   │   │
│   │   ├── layout/                  # Authenticated application shell
│   │   │   ├── header/              # Top navigation bar
│   │   │   ├── sidebar/             # Side navigation menu
│   │   │   ├── footer/              # Footer component
│   │   │   └── layout.component.ts  # Main layout wrapper
│   │   │
│   │   ├── pages/                   # Feature pages/routes
│   │   │   ├── auth/                # Login, registration, password reset
│   │   │   ├── dashboard/           # Main dashboard with project overview
│   │   │   ├── projects/            # Project list, creation, settings
│   │   │   ├── tasks/               # Task board, task details, filters
│   │   │   ├── teams/               # Team management, invitations
│   │   │   ├── notifications/       # Notification center
│   │   │   ├── profile/             # User profile and settings
│   │   │   └── deployment/          # Deployment history and logs
│   │   │
│   │   ├── shared/                  # Shared UI components and utilities
│   │   │   ├── components/          # Reusable components (modals, etc.)
│   │   │   ├── pipes/               # Custom Angular pipes
│   │   │   ├── directives/          # Custom directives
│   │   │   └── utils/               # Utility functions
│   │   │
│   │   ├── app.component.ts         # Root component
│   │   └── app.routes.ts            # Route definitions
│   │
│   ├── environments/                # Environment configurations
│   │   ├── environment.ts           # Development environment
│   │   └── environment.prod.ts      # Production environment
│   │
│   ├── styles.css                   # Global styles
│   ├── main.ts                      # Application entry point
│   └── index.html                   # HTML template
│
├── public/                          # Static assets
├── dist/                            # Build output
├── Dockerfile                       # Docker image definition
├── nginx.conf                       # Nginx configuration
├── package.json                     # Dependencies and scripts
├── angular.json                     # Angular CLI configuration
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.js               # Tailwind CSS configuration
└── README.md                        # Project documentation
```

---

## 🔐 Authentication & Security

### JWT-Based Authentication

1. **Login Flow**:
   ```
   1. User submits credentials
   2. Backend validates and returns JWT token
   3. Frontend stores JWT in browser local storage
   4. All subsequent requests include JWT in Authorization header
   ```

2. **Token Interceptor** (`core/interceptors/`):
   - Automatically adds `Authorization: Bearer <token>` to all requests
   - Handles token refresh logic if applicable
   - Redirects to login on 401/403 responses

3. **Route Guards** (`core/guards/`):
   - `AuthGuard`: Protects authenticated routes
   - Redirects unauthenticated users to login page
   - Prevents access to admin-only routes

### Security Best Practices

- **HTTPS Only**: Use HTTPS in production
- **CORS**: Configured on backend; frontend respects same-origin for cookies
- **XSS Protection**: Angular sanitizes HTML by default
- **CSRF Protection**: Backend handles token validation
- **Local Storage**: JWT stored securely (no sensitive data in tokens)

---

## 🔄 Data Flow & State Management

### Service-Based Architecture

GestProj Frontend uses **Angular Services** as the primary state management pattern. No external state library (Redux, NgRx) is currently used.

```
┌──────────────────────────────────┐
│   Angular Component              │
│  (subscription to Observable)    │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│   Angular Service                │
│  (API calls, RxJS Observables)   │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│   HTTP Interceptor               │
│  (JWT token, error handling)     │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│   Backend REST API               │
│  (Spring Boot, Port 8080)        │
└──────────────────────────────────┘
```

### Service Examples

**ProjectService** (in `core/services/`):
```typescript
export class ProjectService {
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>('/api/projects');
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>('/api/projects', project);
  }
}
```

**Component Usage**:
```typescript
export class ProjectListComponent {
  projects$ = this.projectService.projects$;

  constructor(private projectService: ProjectService) {
    this.projectService.getProjects().subscribe();
  }
}
```

---

## 🎨 UI Components & Styling

### Tailwind CSS

- **Configuration**: `tailwind.config.js` (extends Tailwind with custom colors)
- **Global Styles**: `src/styles.css` (applies to entire application)
- **Component Styles**: Inline in component files or separate `.css` files

### Reusable Components

Located in `src/app/shared/components/`:
- **Toast Notifications**: Success, error, warning messages
- **Modals**: Confirmation dialogs, forms
- **Loading Spinners**: Async operation feedback
- **Buttons & Forms**: Consistent UI patterns

### Responsive Design

- Mobile-first approach
- Tailwind breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Sidebar collapses on mobile; main content becomes full-width

---

## 🧩 Key Features & Modules

### 1. Authentication Module (`pages/auth/`)
- **Login Page**: Email + password authentication
- **Registration Page**: New user account creation
- **Password Reset**: Forgot password workflow
- **Route Guards**: Protect authenticated pages

### 2. Dashboard Module (`pages/dashboard/`)
- **Overview**: Project statistics, upcoming tasks
- **Quick Actions**: Create project, create task shortcuts
- **Activity Feed**: Recent project and task changes

### 3. Projects Module (`pages/projects/`)
- **Project List**: Browse all accessible projects
- **Project Details**: Settings, members, permissions
- **Create/Edit**: Form validation and submission
- **Permissions**: Role-based access control (Owner, Admin, Member, Viewer)

### 4. Tasks Module (`pages/tasks/`)
- **Kanban Board**: Task columns by status
- **Task Filters**: Priority, assignee, due date filters
- **Task Details**: Comments, history, assignments
- **Bulk Actions**: Move, assign, delete tasks

### 5. Notifications Module (`pages/notifications/`)
- **Notification Center**: Centralized notifications
- **Email Notifications**: Backend-triggered email digests
- **Real-Time Updates**: WebSocket or polling (if implemented)

### 6. Deployment Module (`pages/deployment/`)
- **Deployment History**: View past deployments
- **Workflow Status**: Gitea workflow runs and logs
- **Health Metrics**: Docker container health from API

---

## 🔌 API Integration

### Environment Configuration

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: '/api' // Relative URL; Nginx proxies to backend
};
```

### API Endpoints (Examples)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/users/{id}` | Get user profile |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/{id}/tasks` | Get project tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |

Complete API documentation available at backend **Swagger UI**: `http://localhost:8080/swagger-ui.html`

---

## 🧪 Testing Strategy

### Testing Pyramid

```
        ▲
       ╱ ╲          E2E Tests (Cypress)
      ╱   ╲
     ╱─────╲        Integration Tests (Vitest)
    ╱       ╲
   ╱─────────╲      Unit Tests (Vitest)
  ╱___________╲
```

### Unit Tests

- **Framework**: Vitest
- **Location**: `*.spec.ts` files alongside source
- **Coverage Target**: >80%

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

### Example Test

```typescript
describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectService]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch projects', () => {
    const mockProjects = [
      { id: 1, name: 'Project A' },
      { id: 2, name: 'Project B' }
    ];

    service.getProjects().subscribe(projects => {
      expect(projects.length).toBe(2);
      expect(projects[0].name).toBe('Project A');
    });

    const req = httpMock.expectOne('/api/projects');
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects);
  });

  afterEach(() => httpMock.verify());
});
```

---

## 📦 Dependencies

### Core Framework
- **@angular/core**: Angular framework
- **@angular/router**: Client-side routing
- **@angular/forms**: Reactive forms

### Styling
- **tailwindcss**: Utility-first CSS framework
- **postcss**: CSS processing

### HTTP & State
- **rxjs**: Reactive programming library
- No Redux/NgRx; using RxJS Observables + Services

### Testing
- **vitest**: Modern unit testing framework
- **jsdom**: DOM environment for tests

See `package.json` for complete dependency list.

---

## 🚀 Build & Deployment

### Development Build

```bash
npm start
# Runs on http://localhost:4200
# Auto-reloads on file changes
```

### Production Build

```bash
npm run build
# Output in dist/gestproj-frontend/
# Optimized, minified, tree-shaken
```

### Docker Deployment

```dockerfile
# Multi-stage build
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:latest
COPY --from=build /app/dist/gestproj-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Run with Docker Compose**:
```bash
cd ../gestproj-backend
docker compose up --build
```

Frontend available at: `http://localhost:8081`

---

## 🔄 Development Workflow

### 1. Feature Development
```bash
git checkout -b feature/my-feature
npm start
# Make changes, test locally
```

### 2. Testing
```bash
npm test
npm run build   # Ensure no build errors
```

### 3. Commit & Push
```bash
git add .
git commit -m "feat: describe your feature"
git push origin feature/my-feature
```

### 4. Pull Request
- Create PR on GitHub
- Request reviews
- Address feedback
- Merge when approved

---

## 📊 Performance Considerations

1. **Lazy Loading**: Feature modules loaded on demand
2. **OnPush Change Detection**: Used in high-frequency components
3. **Unsubscription**: Components unsubscribe from Observables in `ngOnDestroy`
4. **Tree Shaking**: Production builds remove unused code
5. **Code Splitting**: Large bundles split by route

---

## 🐛 Debugging

### Browser DevTools
- **Angular DevTools**: Browser extension for component inspection
- **Network Tab**: Monitor API requests and responses
- **Console**: View errors and logs

### Visual Studio Code
- Debug Angular app: Install Debugger for Chrome
- Set breakpoints in `.ts` files
- Run with `npm start`, then attach debugger

---

## 🚦 CI/CD Pipeline

See [GitHub Actions Workflows](.github/workflows/) for:
- **Build**: Compile and test on every push
- **Test**: Run unit tests with coverage
- **Lint**: Code quality checks
- **Deploy**: Automatic deployment to production

---

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [RxJS Documentation](https://rxjs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev)
- [Backend API Docs](../gestproj-backend/README.md)

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code standards
- Testing requirements
- Pull request process
- Commit message conventions

---

**Last Updated**: September 2024
