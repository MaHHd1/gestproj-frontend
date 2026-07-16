# Frontend Master Plan

**Last audited:** 2026-07-12  
**Frontend:** gestproj-frontend (Angular 21)  
**Backend checked:** gestproj-backend (local workspace)

## Current health

- Build: passing (npm run build, 2026-07-12)
- Routing: protected application shell with lazy-loaded pages
- API configuration: environment-based (environment.apiUrl)
- Error feedback: global toast notifications for network, server, and rate-limit failures
- Working tree: contains pre-existing uncommitted frontend work; preserve/review before committing

## Verified implementation status

| Area | Status | Evidence / notes |
|---|---|---|
| Register, login, current user | Complete | /auth/register, /auth/login, and /auth/me are implemented and used |
| JWT request authentication | Complete | Bearer-token interceptor and route guards |
| Projects | Complete | Listing, creation, details, statistics, update, and delete |
| Tasks | Complete | List, filters, pagination, creation, editing, assignment, and detail view |
| Task comments | Complete | List, create, and delete |
| Project task board | Complete | GitHub-style To do, In progress, and Done columns with assignee names |
| Project members | Complete | List and permission/role/status updates |
| Invitations | Complete | Create, candidate user search, accept/reject token page |
| Notifications | Complete | List, mark one read, mark all read, unread badge |
| Invitation review | Complete | Invitation notifications open the accept/reject screen before the project is accessible |
| Activity logs | Complete | Project activity list |
| Permission-driven UI | Mostly complete | Member permissions gate task creation, edit/delete, invitations, and member administration; project settings remain owner-only |
| Global error feedback | Complete | Toasts for offline/server/429 failures; pages retain local action errors |
| Rate-limit UX | Complete | HTTP 429 produces a clear retry-later toast |
| Angular starter screen cleanup | Complete | Root template now renders only the app outlet and toast container |
| Profile details | Complete | Name, email, username, image, and account status; database IDs are not displayed |
| Automated frontend tests | Started | 8 passing unit tests cover the app shell, auth service, auth interceptor, and toast service |

## Backend-dependent items

These cannot be finished in the frontend until matching backend endpoints exist. The local backend was inspected on 2026-07-12.

| Feature | Frontend state | Backend state | Required backend contract |
|---|---|---|---|
| Refresh tokens | Client-side types/service scaffold exists, but is unused | Blocked: no POST /auth/refresh; login/register response has no verified refresh token | Refresh endpoint and refresh-token response contract |
| Editable profile | Read-only profile screen; request DTO exists but no service/UI submission | Blocked: no user profile update mapping | Authenticated PUT/PATCH profile endpoint and validation rules |
| Profile image upload | Not started | Blocked: no upload endpoint found | Multipart upload endpoint/storage contract |
| Project archiving | Not started | No archive endpoint found | Archive/unarchive endpoint and archived-list behavior |
| Labels/tags | Not started | No label/tag endpoints found | CRUD/assignment API |
| Due-date reminders | Not started | No reminder endpoints found | Reminder schedule/preferences API |
| Notification preferences | Not started | No preferences endpoints found | Preference read/update API |
| Task timeline | Not started | No task-level timeline endpoint found | Task activity endpoint |
| Attachments | Not started | No attachment endpoints found | Upload/list/download/delete API |
| Comment edit history | Not started | No edit/history endpoints found | Comment update/history API |

## Next work, in order

1. Add the backend refresh-token endpoint, then connect it to the existing AuthService.refreshSession() through a 401 retry interceptor. Add tests for simultaneous expired requests.
2. Add the backend profile update endpoint, then replace the read-only profile card with validated name, username, password, and image-URL editing.
3. Decide and implement the project archive API and an Archived/Active project filter in the dashboard.
4. Review whether project settings should remain owner-only or receive an explicit project-edit permission.
5. Expand automated tests to route guards, the global error interceptor, and critical project/task flows.
6. Add deployment documentation and CI once the API contract is stable.

## Technical notes

- API base URL currently defaults to http://localhost:8080 in both environment files. Set the production URL before deployment.
- Local backend CORS permits http://localhost:4200 and http://127.0.0.1:4200. Keep the deployed frontend origin in the backend CORS allowlist.
- User and task-assignment database IDs are kept internal to API calls; task assignment uses member names in the UI.
- Tokens are stored in localStorage. This is the current architecture; review security requirements before production.
- The global HTTP interceptor intentionally handles only cross-cutting errors. Feature pages continue to display specific validation and action errors.
- Dockerfile exists, but Docker deployment has not yet been verified in this audit.
