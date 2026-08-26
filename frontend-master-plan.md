# GestProj Frontend — Implementation Plan

**Last reviewed:** 2026-08-23

**Frontend:** Angular 21 (`gestproj-frontend`)
**Backend:** Spring Boot (`gestproj-backend`)

## Current implementation

| Area | Status | Notes |
| --- | --- | --- |
| Authentication | Complete | Registration, login, current-user loading, route guards, and bearer-token interceptor. |
| Projects | Complete | Dashboard, create/read/update/delete flows, statistics, and optional repository fields. |
| Tasks | Complete | Board, detail view, creation, editing, assignment, filters, pagination, priorities, due dates, and comments. |
| Collaboration | Complete | Member management, permissions, invitations, notifications, and activity history. |
| Repository activity | Complete | Gitea commits plus workflow runs, jobs, and job logs for linked projects. |
| Deployment visibility | Complete | Deployment history and optional workflow/Docker-health metadata. |
| Error feedback | Complete | Global toast handling for network, server, and rate-limit errors, with page-level action errors retained. |
| Automated tests | Started | Unit coverage exists for the application shell, authentication service/interceptor, and toast service. |

## Application contract

The development build uses `http://localhost:8080/api`; production uses `/api` so Nginx can proxy requests under the same origin. API calls use JWT bearer authentication, and protected pages are rendered within the authenticated layout.

Projects can contain optional `repoOwner` and `repoName` fields for Gitea integration. The backend exposes commit and workflow data for those links, as well as deployment records. Deployment observability fields are optional in responses, and the client must retain a useful history view if a server does not provide them.

## Backend-dependent roadmap

These items require an API contract before the frontend can be completed:

1. Refresh-token endpoint and retry strategy for expired access tokens.
2. Authenticated profile update, including validation rules and optional profile-image upload.
3. Project archive/unarchive behavior and an active/archived project filter.
4. Labels, attachments, notification preferences, due-date reminders, and task-level activity timelines.
5. Comment editing and edit-history support.

## Frontend priorities

1. Add tests for route guards, error interception, and critical project/task flows.
2. Decide whether project settings remain owner-only or receive an explicit project-edit permission.
3. Implement new user-facing features only after their backend contracts, authorization rules, and empty/error states are defined.
4. Re-check token storage and session renewal requirements before an internet-facing production release.

## Design direction

The workspace uses a responsive dark, repository-oriented interface. The project view prioritizes repository activity and workflows while preserving a full task board, collaboration panels, meaningful empty states, and readable form and notification feedback.
