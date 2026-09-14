# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2024-09-14

### Added
- Initial Angular 21 frontend project setup
- Authentication module with login and registration
- JWT-based authentication with bearer tokens
- Project dashboard with overview and statistics
- Project management features (create, edit, delete, view)
- Task board with Kanban view
- Task management (create, assign, filter, update)
- Team collaboration features (invitations, permissions, member management)
- Notification system
- User profile and settings page
- Deployment history viewer with Gitea integration
- Tailwind CSS styling framework
- Vitest unit testing framework
- Docker containerization with Nginx
- GitHub Actions CI/CD pipeline
- Comprehensive documentation

### Features
- ✅ User authentication and session management
- ✅ JWT token storage and refresh
- ✅ Protected routes with AuthGuard
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Real-time notifications (WebSocket-ready)
- ✅ Role-based access control (Owner, Admin, Member, Viewer)
- ✅ Project and task filtering
- ✅ Comments and activity tracking
- ✅ Docker deployment support

### Infrastructure
- ✅ Angular 21 with standalone components
- ✅ Tailwind CSS 4.3 for styling
- ✅ Vitest 4.0 for unit testing
- ✅ Prettier for code formatting
- ✅ Docker & Nginx for production deployment
- ✅ GitHub Actions for CI/CD

---

## [Unreleased]

### Planned Features
- [ ] Real-time WebSocket notifications
- [ ] Advanced search and filtering
- [ ] Export reports (CSV, PDF)
- [ ] Gantt chart view for tasks
- [ ] Time tracking and estimation
- [ ] Custom workflows and automation
- [ ] Team calendar integration
- [ ] File attachments in tasks and comments

### Improvements
- [ ] Performance optimization and bundle size reduction
- [ ] E2E testing with Cypress
- [ ] Enhanced error handling and user feedback
- [ ] Accessibility improvements (WCAG compliance)
- [ ] Dark mode support
- [ ] Multi-language support (i18n)

---

## Versioning

### Version Format
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Process
1. Update version in `package.json`
2. Update this CHANGELOG.md
3. Create git tag: `git tag -a v0.1.0 -m "Release version 0.1.0"`
4. Push to main and create GitHub release

---

## How to Report Changes

When contributing, please include your changes in the CHANGELOG under the "Unreleased" section in one of these categories:

- **Added** - new features
- **Changed** - changes in existing functionality
- **Deprecated** - soon-to-be removed features
- **Removed** - now removed features
- **Fixed** - any bug fixes
- **Security** - in case of vulnerabilities

---

**For the latest development status, see the [master plan](frontend-master-plan.md).**
