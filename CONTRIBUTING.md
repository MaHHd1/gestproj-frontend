# Contributing to GestProj Frontend

Thank you for your interest in contributing to **GestProj Frontend**! We welcome all contributions that help improve the application, whether it's bug fixes, new features, or documentation improvements.

---

## 🚀 Getting Started

### 1. Fork & Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/your-username/gestproj-frontend.git
cd gestproj-frontend

# Add upstream remote
git remote add upstream https://github.com/original-owner/gestproj-frontend.git
```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm install

# Start the development server
npm start

# In another terminal, ensure backend is running on port 8080
# Open http://localhost:4200 in your browser
```

### 3. Create a Branch
```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch with descriptive name
git checkout -b feature/user-auth-improvements
# or
git checkout -b fix/null-pointer-exception
```

---

## 📝 Code Standards

### TypeScript & Angular

- **Use strict TypeScript**: No `any` types; use proper typing
- **Follow Angular style guide**: [Angular Style Guide](https://angular.io/guide/styleguide)
- **Component naming**: Use `PascalCase` for classes, `kebab-case` for files
- **Service naming**: `*.service.ts`, singletons in `core/`
- **Module structure**: Group related features in dedicated modules

### Formatting & Linting

```bash
# Format code (Prettier is configured)
npm run format   # or integrate with editor

# Check code quality
npm run lint     # if linter is configured
```

**Editor Setup** (Recommended):
- Install Prettier extension in VS Code
- Set "Format on Save" in your editor settings
- Follow `.prettierrc` configuration

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserProfileComponent` |
| Services | PascalCase | `ProjectService` |
| Files | kebab-case | `user-profile.component.ts` |
| Methods | camelCase | `getUserProjects()` |
| Constants | UPPER_SNAKE_CASE | `MAX_TASKS_PER_PAGE` |
| Interfaces | PascalCase with `I` prefix (optional) | `IUser` or `User` |

---

## ✅ Testing Requirements

All contributions must include tests. We use **Vitest** for unit testing.

### Writing Tests

```bash
# Run tests
npm test

# Watch mode (development)
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Test File Structure

- Create `*.spec.ts` files alongside source files
- Use descriptive `describe()` and `it()` blocks
- Aim for >80% code coverage

**Example:**
```typescript
describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('should retrieve user by ID', () => {
    const user = service.getUserById(1);
    expect(user).toBeDefined();
  });
});
```

---

## 🔄 Pull Request Process

### Before Creating a PR

1. **Ensure code quality**:
   ```bash
   npm test
   npm run build
   ```

2. **Update your branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

3. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add user profile page

   - Display user information and settings
   - Add profile edit functionality
   - Implement avatar upload

   Closes #42"
   ```

   **Commit Message Format**:
   - Type: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Scope (optional): component or service name
   - Subject: clear description (imperative mood, not capitalized)
   - Body (optional): detailed explanation of changes
   - Footer (optional): issue references (`Fixes #42`, `Closes #123`)

### Creating a PR

1. **Push your branch**:
   ```bash
   git push origin feature/user-auth-improvements
   ```

2. **Open PR on GitHub**:
   - Use the PR template (it will appear automatically)
   - Link related issues: `Fixes #42`
   - Describe changes clearly
   - Include screenshots for UI changes

3. **PR Template Checklist**:
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No breaking changes (or documented)
   - [ ] Follows code standards
   - [ ] Builds successfully (`npm run build`)

---

## 🐛 Bug Reports

Found a bug? Please create an issue with:

1. **Description**: What's the expected vs. actual behavior?
2. **Steps to Reproduce**:
   ```
   1. Navigate to...
   2. Click...
   3. See error...
   ```
3. **Environment**: Angular version, Node version, OS
4. **Screenshots/Logs**: Include if applicable
5. **Label**: Mark as `bug`

---

## 💡 Feature Requests

Have an idea? Share it via GitHub Issues:

1. **Description**: Explain the feature and why it's valuable
2. **Use Case**: How will it benefit users?
3. **Acceptance Criteria**: What makes this feature complete?
4. **Label**: Mark as `enhancement`

---

## 📚 Documentation

Documentation is critical! Update these when making changes:

- **Code comments**: Explain "why", not "what"
- **README.md**: Update if setup or usage changes
- **ARCHITECTURE.md**: Document design decisions and system architecture
- **Inline JSDoc**: Document complex functions and public APIs

```typescript
/**
 * Fetches project tasks with optional filtering
 * @param projectId - The project identifier
 * @param filters - Optional task filters (priority, status, assignee)
 * @returns Observable<Task[]> - Filtered tasks
 */
getProjectTasks(projectId: string, filters?: TaskFilter): Observable<Task[]> {
  // implementation
}
```

---

## 🚦 Review Process

1. **Code Review**: Maintainers will review your PR
2. **Feedback**: Respond to comments and make requested changes
3. **CI/CD**: Automated tests must pass
4. **Approval**: 2+ approvals required for merge
5. **Merge**: Squash & merge to main branch

---

## 📞 Communication

- **Issues**: For bugs, features, and discussions
- **Discussions**: For design questions and ideas
- **Discord/Slack**: [Community Link] for real-time chat
- **Email**: [Contact Email]

---

## 🎓 Learning Resources

- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [RxJS Guide](https://rxjs.dev/guide/overview)

---

## 📝 Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

---

## ✨ Thank You!

Your contributions make GestProj better for everyone. Thank you for taking the time to contribute! 🙌
