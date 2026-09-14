# Getting Started with GestProj Frontend

This guide will help you set up the development environment, run the application locally, and understand the basic architecture.

---

## 📋 Prerequisites

Make sure you have the following installed:

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm**: v10.x or higher (comes with Node.js)
- **Git**: For version control
- **Docker** (optional): For containerized deployment
- **Backend API**: Running on `http://localhost:8080`

### Verify Installation

```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be v10.0.0 or higher
git --version     # Any recent version
```

---

## 🚀 Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gestproj-frontend.git
cd gestproj-frontend
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages from `package.json`.

### 3. Start the Development Server

```bash
npm start
```

The application will automatically open in your browser at **http://localhost:4200**

> **Note**: Make sure the backend API is running on `http://localhost:8080`

---

## 🔧 Development Setup

### IDE Setup (Recommended: Visual Studio Code)

1. **Install Extensions**:
   - Angular Language Service
   - Prettier - Code formatter
   - TypeScript Vue Plugin (Volar)
   - ESLint (if configured)

2. **Configure Settings** (`.vscode/settings.json`):
   ```json
   {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.formatOnSave": true,
     "[typescript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     }
   }
   ```

3. **Debugging**:
   - Set breakpoints in your code
   - Press `F5` or go to Run > Start Debugging
   - Use Chrome DevTools for frontend debugging

### Environment Setup

The project uses environment files for configuration:

- **Development**: `src/environments/environment.ts`
- **Production**: `src/environments/environment.prod.ts`

Current configuration:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

---

## 🎯 Basic Commands

### Development

```bash
npm start              # Start dev server on port 4200
npm run watch         # Build in watch mode
npm run build         # Production build
```

### Testing & Quality

```bash
npm test              # Run unit tests
npm test -- --watch   # Watch mode for tests
npm test -- --coverage # Coverage report
```

### Code Formatting

```bash
npm run format        # Format code with Prettier
```

---

## 📚 Project Structure

```
src/
├── app/
│   ├── core/          # Services, guards, interceptors
│   ├── layout/        # App shell components
│   ├── pages/         # Feature pages/routes
│   └── shared/        # Reusable components
├── environments/      # Config by environment
├── styles.css         # Global styles
└── main.ts            # App entry point
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed structure.

---

## 🔐 Authentication

### Login Flow

1. Navigate to http://localhost:4200/login
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. You'll be redirected to the dashboard

### How Authentication Works

- Credentials are sent to `POST /api/auth/login`
- Backend returns JWT token
- Token is stored in browser's local storage
- Token automatically added to all API requests via interceptor

---

## 🌐 API Integration

### Configuration

Development requests target the backend at `http://localhost:8080/api`.

For testing API endpoints, use:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Postman**: Import backend API collection

### Example API Call

```typescript
// In a service
import { HttpClient } from '@angular/common/http';

export class ProjectService {
  constructor(private http: HttpClient) {}

  getProjects() {
    return this.http.get<Project[]>('/api/projects');
  }
}
```

The `/api/` prefix is configured in the environment file.

---

## 🧪 Testing

### Running Tests

```bash
npm test                    # Run all tests once
npm test -- --watch         # Re-run on file changes
npm test -- --coverage      # Generate coverage report
```

### Writing a Test

```typescript
import { TestBed } from '@angular/core/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyService]
    });
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

---

## 🐳 Docker & Production Build

### Production Build

```bash
npm run build
```

Output is in `dist/gestproj-frontend/`

### Docker Deployment

```bash
docker build -t gestproj-frontend .
docker run -p 8081:80 gestproj-frontend
```

Access at http://localhost:8081

### Full Stack (with Backend)

```bash
cd ../gestproj-backend
docker compose up --build
```

---

## 🐛 Troubleshooting

### Issue: Cannot connect to backend API

**Solution**: 
- Ensure backend is running: `http://localhost:8080`
- Check `src/environments/environment.ts` for correct API URL
- Check browser console for CORS errors

### Issue: Port 4200 already in use

**Solution**:
```bash
ng serve --port 4300
# or kill the process using port 4200
```

### Issue: Module not found errors

**Solution**:
```bash
npm install
# Clear node_modules if needed
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tests failing

**Solution**:
```bash
npm test -- --clearCache
npm test
```

---

## 📖 Further Learning

- [Angular Official Docs](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [RxJS Guide](https://rxjs.dev/guide/overview)
- [Project Architecture](ARCHITECTURE.md)
- [Contributing Guide](CONTRIBUTING.md)

---

## 🤝 Need Help?

- Check [issues](https://github.com/your-username/gestproj-frontend/issues) for common problems
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- Open a new [issue](https://github.com/your-username/gestproj-frontend/issues/new) if you need help

---

Happy coding! 🚀
