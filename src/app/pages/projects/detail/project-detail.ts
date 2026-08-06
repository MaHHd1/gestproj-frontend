import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { TaskFilters, TaskService } from '../../../core/services/task.service';
import { MemberService } from '../../../core/services/member.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { ActivityLogService } from '../../../core/services/activity-log.service';
import { DeploymentService } from '../../../core/services/deployment.service';
import { CommitService } from '../../../core/services/commit.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ProjectResponse, ProjectStatisticsResponse } from '../../../core/models/project.model';
import { TaskPriority, TaskResponse, TaskStatus } from '../../../core/models/task.model';
import {
  ProjectMemberResponse,
  ProjectMemberRole,
  ProjectMemberStatus,
  ProjectMemberUpdateRequest
} from '../../../core/models/member.model';
import { ProjectInvitationResponse } from '../../../core/models/invitation.model';
import { ActivityLogResponse } from '../../../core/models/activity-log.model';
import { DeploymentResponse } from '../../../core/models/deployment.model';
import { CommitResponse } from '../../../core/models/commit.model';
import { UserResponse } from '../../../core/models/user.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  template: `
    <div class="p-8">
      @if (loading()) {
        <div class="text-slate-500">Loading project...</div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {{ error() }}
        </div>
      } @else if (project()) {
        <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-bold text-white">{{ project()!.name }}</h1>
            <p class="text-slate-400 text-sm mt-1">{{ project()!.description || 'No description' }}</p>
            @if (linkedRepository()) {
              <p class="mt-2 inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800">
                <span aria-hidden="true">⌘</span>&nbsp;Linked repository: {{ linkedRepository() }}
              </p>
            }
          </div>
          <a routerLink="/dashboard" class="text-sm font-medium text-slate-700 hover:text-slate-950 hover:underline">Back to projects</a>
        </div>

        <div class="mb-6 flex items-center gap-1 overflow-x-auto border-b border-slate-700">
          <button (click)="activeSection.set('deployments')"
            [class]="activeSection() === 'deployments' ? 'border-b-2 border-white px-4 py-3 text-sm font-semibold text-white' : 'px-4 py-3 text-sm text-slate-400 hover:text-white'">
            Repository
          </button>
          <button (click)="activeSection.set('board')"
            [class]="activeSection() === 'board' ? 'border-b-2 border-white px-4 py-3 text-sm font-semibold text-white' : 'px-4 py-3 text-sm text-slate-400 hover:text-white'">
            Full board
          </button>
          <button (click)="activeSection.set('details')"
            [class]="activeSection() === 'details' ? 'border-b-2 border-white px-4 py-3 text-sm font-semibold text-white' : 'px-4 py-3 text-sm text-slate-400 hover:text-white'">
            Details & members
          </button>
        </div>

        @if (actionError()) {
          <div class="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm">
            {{ actionError() }}
          </div>
        }

        @if (activeSection() === 'board' && statistics()) {
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <div class="rounded-lg border border-slate-700 bg-[#161b22] p-3">
              <p class="text-xs text-slate-400">Total</p>
              <p class="text-lg font-semibold text-white">{{ statistics()!.totalTasks }}</p>
            </div>
            <div class="rounded-lg border border-slate-700 bg-[#161b22] p-3">
              <p class="text-xs text-slate-400">Completed</p>
              <p class="text-lg font-semibold text-white">{{ statistics()!.completedTasks }}</p>
            </div>
            <div class="rounded-lg border border-slate-700 bg-[#161b22] p-3">
              <p class="text-xs text-slate-400">In progress</p>
              <p class="text-lg font-semibold text-white">{{ statistics()!.inProgressTasks }}</p>
            </div>
            <div class="rounded-lg border border-slate-700 bg-[#161b22] p-3">
              <p class="text-xs text-slate-400">Late</p>
              <p class="text-lg font-semibold text-white">{{ statistics()!.lateTasks }}</p>
            </div>
          </div>
        }

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          @if (activeSection() === 'board') {
          <section class="xl:col-span-3 space-y-6">
            @if (false) {
            <div class="rounded-xl border border-slate-300 bg-[#f6f8fa] p-4 shadow-sm">
              <h2 class="font-semibold text-slate-800 mb-4">Create task</h2>
              @if (canCreateTask()) {
                <form [formGroup]="taskForm" (ngSubmit)="createTask()" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    formControlName="title"
                    type="text"
                    placeholder="Task title"
                    class="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <input formControlName="dueDate" type="date" class="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                  <select formControlName="status" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option value="A_FAIRE">To do</option>
                    <option value="EN_COURS">In progress</option>
                    <option value="TERMINE">Done</option>
                  </select>
                  <select formControlName="priority" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option value="BASSE">Low</option>
                    <option value="MOYENNE">Medium</option>
                    <option value="HAUTE">High</option>
                  </select>
                  <select formControlName="assignedTo" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option value="">Unassigned</option>
                    @for (member of members(); track member.id) {
                      <option [value]="member.userId">{{ member.username }}</option>
                    }
                  </select>
                  <input
                    formControlName="description"
                    type="text"
                    placeholder="Description"
                    class="px-3 py-2 border border-slate-200 rounded-lg text-sm md:col-span-2"
                  />
                  <button
                    type="submit"
                    [disabled]="savingTask()"
                    class="md:col-span-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    Create task
                  </button>
                </form>
              } @else {
                <p class="text-sm text-slate-500">You do not have permission to create tasks in this project.</p>
              }
            </div>
            }

            <div class="rounded-xl border border-slate-700 bg-[#161b22] p-4 shadow-sm">

              <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                @for (column of boardColumns; track column.status) {
                  <section
                    [class]="'rounded-lg border border-slate-700 bg-[#0d1117] p-3 transition-colors ' + (dragOverStatus() === column.status ? ' ring-2 ring-slate-400 ring-offset-2 ring-offset-[#161b22]' : '')"
                    (dragover)="onDragOver($event, column.status)"
                    (dragleave)="onDragLeave($event, column.status)"
                    (drop)="onDrop($event, column.status)"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <span class="h-2 w-2 rounded-full bg-white"></span>{{ column.label }}
                      </h3>
                      <div class="flex items-center gap-2">
                        <span class="rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{{ tasksForStatus(column.status).length }}</span>
                        @if (canCreateTask()) {
                          <a [routerLink]="['/projects', projectId(), 'tasks', 'new']" [queryParams]="{ status: column.status }" class="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-base font-medium text-white hover:bg-slate-700" [attr.aria-label]="'Create task in ' + column.label">+</a>
                        }
                      </div>
                    </div>
                    <div class="min-h-20 space-y-3">
                      @for (task of tasksForStatus(column.status); track task.id) {
                        <div
                          [attr.draggable]="canMoveTasks() ? 'true' : null"
                          (dragstart)="onDragStart($event, task)"
                          (dragend)="onDragEnd()"
                          [class.opacity-60]="movingTaskId() === task.id"
                          [class.cursor-grab]="canMoveTasks()"
                          [class.border-red-400]="task.late"
                          [class.bg-red-950]="task.late"
                          class="group overflow-hidden rounded-md border border-slate-700 bg-[#161b22] shadow-sm transition duration-150 hover:border-slate-400 hover:shadow-md active:cursor-grabbing"
                        >
                          <a [routerLink]="['/tasks', task.id]" class="block p-3.5">
                            <div class="flex items-start justify-between gap-3">
                              <p class="line-clamp-2 text-sm font-semibold leading-5 text-white group-hover:underline">{{ task.title }}</p>
                              <span [class]="priorityBadgeClass(task.priority)">{{ task.priority }}</span>
                            </div>
                            <div class="mt-4 flex items-center justify-between gap-3">
                              <div class="flex min-w-0 items-center gap-2">
                                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold uppercase tracking-wide text-white" [attr.aria-label]="task.assignedToUsername ? 'Assigned to ' + task.assignedToUsername : 'Unassigned'">
                                  {{ userInitials(task.assignedToUsername) }}
                                </span>
                                <span class="truncate text-xs font-medium text-slate-300">{{ task.assignedToUsername || 'Unassigned' }}</span>
                              </div>
                              @if (task.dueDate) {
                                <span [class]="task.late ? 'flex shrink-0 items-center gap-1 text-xs font-semibold text-red-200' : 'flex shrink-0 items-center gap-1 text-xs font-medium text-slate-300'">
                                  <span aria-hidden="true">&#128197;</span>{{ formatDate(task.dueDate) }}
                                </span>
                              }
                            </div>
                            @if (task.late) {
                              <p class="mt-3 flex items-center gap-1 border-t border-red-700 pt-2 text-xs font-semibold text-red-100"><span aria-hidden="true">&#9888;</span> Overdue</p>
                            }
                          </a>
                        </div>
                      }
                      @if (tasksForStatus(column.status).length === 0) { <div class="rounded-lg border border-dashed border-slate-300 bg-white/60 py-5 text-center text-xs text-slate-500">No tasks yet<br><span class="text-slate-400">Drop a task here</span></div> }
                    </div>
                  </section>
                }
              </div>

              @if (false && taskTotalPages() > 0) {
                <div class="flex items-center justify-between mt-4 text-xs text-slate-600">
                  <span>
                    Page {{ taskPage() + 1 }} / {{ taskTotalPages() }} • {{ taskTotalElements() }} tasks
                  </span>
                  <div class="flex items-center gap-2">
                    <button
                      (click)="prevTaskPage()"
                      [disabled]="taskPage() === 0"
                      class="border border-slate-200 px-3 py-1.5 rounded disabled:opacity-60"
                    >
                      Previous
                    </button>
                    <button
                      (click)="nextTaskPage()"
                      [disabled]="taskPage() + 1 >= taskTotalPages()"
                      class="border border-slate-200 px-3 py-1.5 rounded disabled:opacity-60"
                    >
                      Next
                    </button>
                  </div>
                </div>
              }

            </div>
          </section>
          }

          @if (activeSection() === 'deployments') {
          <section class="xl:col-span-3">
            <div class="rounded-xl border border-slate-700 bg-[#161b22] p-5 shadow-sm">
              <div class="mb-5 flex items-start justify-between gap-4"><div><p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Gitea repository</p><h2 class="mt-1 font-semibold text-white">{{ linkedRepository() || 'Repository activity' }}</h2></div><span class="rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-200">Gitea</span></div>
              <h3 class="mb-3 text-sm font-semibold text-slate-200">Deployments</h3>
              @if (!hasLinkedRepository()) {
                <div class="gp-empty-state min-h-32"><div class="gp-empty-icon" aria-hidden="true">⌘</div><p class="font-medium text-slate-700">No repository linked</p><p class="mt-1 text-sm text-slate-500">Link a Gitea repository to view its commits and deployments.</p>@if (canEditProject()) { <button type="button" (click)="activeSection.set('details')" class="mt-4 text-sm font-medium text-slate-950 hover:underline">Add repository</button> }</div>
              } @else if (loadingDeployments()) {
                <p class="text-sm text-slate-500">Loading deployments...</p>
              } @else if (deployments().length === 0) {
                <div class="gp-empty-state min-h-32"><div class="gp-empty-icon" aria-hidden="true">↗</div><p class="font-medium text-slate-700">No deployments yet</p><p class="mt-1 text-sm text-slate-500">Deployment activity for this project will appear here.</p></div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="min-w-full text-sm">
                    <thead>
                      <tr class="border-b border-slate-700 text-left text-xs uppercase tracking-wide text-slate-400">
                        <th class="py-2 pr-4 font-medium">Status</th>
                        <th class="py-2 pr-4 font-medium">Commit</th>
                        <th class="py-2 pr-4 font-medium">Triggered by</th>
                        <th class="py-2 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (deployment of deployments(); track deployment.id) {
                        <tr class="border-b border-slate-700 last:border-0">
                          <td class="py-3 pr-4">
                            <span [class]="deployment.status === 'SUCCESS' ? 'inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700' : 'inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700'">
                              {{ deployment.status }}
                            </span>
                          </td>
                          <td class="py-3 pr-4">
                            <p class="font-medium text-slate-100">{{ deployment.commitMessage || 'No commit message' }}</p>
                            <p class="text-xs text-slate-400 font-mono">{{ shortCommitHash(deployment.commitHash) }}</p>
                          </td>
                          <td class="py-3 pr-4 text-slate-300">{{ deployment.triggeredBy }}</td>
                          <td class="py-3 text-slate-400">{{ relativeTimeFromNow(deployment.finishedAt || deployment.startedAt) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }

              @if (hasLinkedRepository()) {
                <div class="mt-6 border-t border-slate-700 pt-5">
                  <h2 class="mb-3 font-semibold text-slate-100">Recent commits</h2>
                  @if (loadingCommits()) {
                    <p class="text-sm text-slate-500">Loading commits...</p>
                  } @else if (commits().length === 0) {
                    <p class="text-sm text-slate-500">No recent commits for this repository.</p>
                  } @else {
                    <ul class="divide-y divide-slate-700">
                      @for (commit of commits(); track commit.sha) {
                        <li class="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div class="min-w-0">
                            <p class="truncate font-medium text-slate-100">{{ commit.message || 'No commit message' }}</p>
                            <p class="mt-1 font-mono text-xs text-slate-400">{{ shortCommitHash(commit.sha) }}</p>
                          </div>
                          <p class="shrink-0 text-xs text-slate-400">{{ commit.authorName || 'Unknown author' }} &middot; {{ relativeTimeFromNow(commit.date) }}</p>
                        </li>
                      }
                    </ul>
                  }
                </div>
              }
            </div>
          </section>
          }

          @if (activeSection() === 'details') {
          <section class="xl:col-span-3 mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 xl:grid-cols-2">
            @if (activeSection() === 'details') {
            @if (canEditProject()) {
              <div class="rounded-xl border border-slate-700 bg-[#161b22] p-5 shadow-sm xl:col-span-2">
                <div class="mb-5 border-b border-slate-700 pb-4"><p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Project configuration</p><h2 class="mt-1 font-semibold text-white">Project details and repository</h2><p class="mt-1 text-sm text-slate-400">Keep the workspace information and its Gitea connection together.</p></div>
                <form [formGroup]="projectSettingsForm" (ngSubmit)="saveProjectSettings()" class="space-y-4">
                  <input
                    formControlName="name"
                    type="text"
                    placeholder="Project name"
                    class="gp-input"
                  />
                  <textarea
                    formControlName="description"
                    rows="3"
                    placeholder="Project description"
                    class="gp-input"
                  ></textarea>
                  <div class="rounded-lg border border-slate-700 bg-[#0d1117] p-4">
                    <div class="mb-3 flex items-start gap-2"><span class="mt-0.5 text-slate-600" aria-hidden="true">⌘</span><div><p class="text-sm font-semibold text-slate-800">Repository connection</p><p class="text-xs text-slate-500">Add an owner and repository name to load commits and deployments.</p></div></div>
                    <div class="grid gap-3 sm:grid-cols-2">
                    <div>
                    <label class="mb-1 block text-xs font-medium text-slate-600">Repository owner <span class="text-slate-400">(optional)</span></label>
                    <input
                      formControlName="repoOwner"
                      type="text"
                      placeholder="e.g. my-org"
                      class="gp-input"
                    />
                    </div>
                    <div>
                    <label class="mb-1 block text-xs font-medium text-slate-600">Repository name <span class="text-slate-400">(optional)</span></label>
                    <input
                      formControlName="repoName"
                      type="text"
                      placeholder="e.g. gestproj-backend"
                      class="gp-input"
                    />
                    </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    [disabled]="savingProjectSettings()"
                    class="w-full bg-slate-950 hover:bg-slate-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    Save project
                  </button>
                </form>
                <button
                  type="button"
                  (click)="deleteProject()"
                  [disabled]="deletingProject()"
                  class="w-full mt-3 border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60 py-2 rounded-lg text-sm font-medium"
                >
                  Delete project
                </button>
              </div>
            }
            }

            @if (activeSection() === 'details') {
            @if (canInviteMembers()) {
            <div class="rounded-xl border border-slate-700 bg-[#161b22] p-5 shadow-sm">
              <div class="mb-4"><p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Collaboration</p><h2 class="mt-1 font-semibold text-white">Invite member</h2></div>
                <form [formGroup]="inviteForm" (ngSubmit)="createInvite()" class="space-y-3">
                  <div class="space-y-2">
                    <div class="flex gap-2">
                      <input
                        formControlName="searchQuery"
                        type="text"
                        placeholder="Search user by name, username or email"
                        class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        (click)="searchInviteCandidates()"
                        [disabled]="searchingInviteCandidates()"
                        class="shrink-0 border border-slate-200 hover:bg-slate-50 disabled:opacity-60 px-3 py-2 rounded-lg text-xs font-medium"
                      >
                        Search
                      </button>
                    </div>
                    @if (inviteCandidates().length > 0) {
                      <div class="border border-slate-200 rounded-lg divide-y divide-slate-200 max-h-44 overflow-y-auto">
                        @for (candidate of inviteCandidates(); track candidate.id) {
                          <button
                            type="button"
                            (click)="selectInviteCandidate(candidate)"
                            class="w-full text-left px-3 py-2 hover:bg-slate-50"
                          >
                            <p class="text-sm text-slate-800">{{ candidate.name }} ({{ candidate.username }})</p>
                            <p class="text-xs text-slate-500">{{ candidate.email }}</p>
                          </button>
                        }
                      </div>
                    }
                  </div>
                  <input
                    formControlName="invitedEmail"
                    type="email"
                    placeholder="member@email.com"
                    class="gp-input"
                  />
                  <button
                    type="submit"
                    [disabled]="savingInvite()"
                    class="gp-btn-primary w-full"
                  >
                    Send invitation
                  </button>
                </form>
            </div>
            }

            <div class="rounded-xl border border-slate-700 bg-[#161b22] p-5 shadow-sm">
              <div class="flex items-center justify-between gap-3 mb-3">
                <div><p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Access</p><h2 class="mt-1 font-semibold text-white">Members</h2></div>
                @if (canManageMembers()) {
                <button (click)="managingMembers.set(!managingMembers())" class="text-xs font-medium text-slate-950 hover:underline">
                  {{ managingMembers() ? 'Show names only' : 'Manage members' }}
                </button>
                }
              </div>
              @if (!managingMembers()) {
                <div class="space-y-2">
                  @for (member of members(); track member.id) {
                    <div class="flex items-center justify-between rounded-lg border border-slate-700 bg-[#0d1117] px-3 py-2">
                      <span class="text-sm font-medium text-slate-100">{{ member.username }}</span>
                      <span class="text-xs text-slate-400">{{ member.role }}</span>
                    </div>
                  }
                  @empty {
                    <div class="gp-empty-state min-h-28"><div class="gp-empty-icon" aria-hidden="true">○</div><p class="text-sm font-medium text-slate-700">No additional members yet</p><p class="mt-1 text-xs text-slate-500">Invite collaborators to work together.</p></div>
                  }
                </div>
              } @else if (members().length === 0) {
                <div class="gp-empty-state min-h-28"><div class="gp-empty-icon" aria-hidden="true">○</div><p class="text-sm font-medium text-slate-700">No members loaded</p></div>
              } @else {
                <div class="space-y-3">
                  @for (member of members(); track member.id) {
                    @if (memberDrafts[member.id]; as draft) {
                      <div class="space-y-3 rounded-lg border border-slate-700 bg-[#0d1117] p-3">
                        <div>
                          <p class="text-sm font-medium text-slate-800">{{ member.username }}</p>
                          <p class="text-xs text-slate-500 mt-1">{{ member.role }} · {{ member.status }}</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <select
                            [(ngModel)]="draft.role"
                            [ngModelOptions]="{ standalone: true }"
                            name="role-{{ member.id }}"
                            [disabled]="member.role === 'OWNER' || !canManageMembers() || savingMemberId() === member.id"
                            class="px-3 py-2 border border-slate-200 rounded-lg text-xs"
                          >
                            <option value="OWNER">OWNER</option>
                            <option value="MEMBER">MEMBER</option>
                          </select>
                          <select
                            [(ngModel)]="draft.status"
                            [ngModelOptions]="{ standalone: true }"
                            name="status-{{ member.id }}"
                            [disabled]="member.role === 'OWNER' || !canManageMembers() || savingMemberId() === member.id"
                            class="px-3 py-2 border border-slate-200 rounded-lg text-xs"
                          >
                            <option value="INVITED">INVITED</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                          </select>
                          <input
                            [(ngModel)]="draft.roleTitle"
                            [ngModelOptions]="{ standalone: true }"
                            name="role-title-{{ member.id }}"
                            [disabled]="member.role === 'OWNER' || !canManageMembers() || savingMemberId() === member.id"
                            placeholder="Role title"
                            class="px-3 py-2 border border-slate-200 rounded-lg text-xs"
                          />
                          <input
                            [(ngModel)]="draft.roleDescription"
                            [ngModelOptions]="{ standalone: true }"
                            name="role-description-{{ member.id }}"
                            [disabled]="member.role === 'OWNER' || !canManageMembers() || savingMemberId() === member.id"
                            placeholder="Role description"
                            class="px-3 py-2 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-xs text-slate-700">
                          <label class="flex items-center gap-2">
                            <input [(ngModel)]="draft.canViewProject" [ngModelOptions]="{ standalone: true }" name="view-{{ member.id }}"
                              [disabled]="member.role === 'OWNER' || !canManageMembers() || savingMemberId() === member.id" type="checkbox" />
                            Can view project
                          </label>
                          <label class="flex items-center gap-2">
                            <input [(ngModel)]="draft.canCreateTask" [ngModelOptions]="{ standalone: true }" name="create-task-{{ member.id }}"
                              [disabled]="member.role === 'OWNER' || !canManageMembers() || savingMemberId() === member.id" type="checkbox" />
                            Can create task
                          </label>
                          <label class="flex items-center gap-2">
                            <input [(ngModel)]="draft.canEditTask" [ngModelOptions]="{ standalone: true }" name="edit-task-{{ member.id }}"
                              [disabled]="member.role === 'OWNER' || !canManageMembers() || savingMemberId() === member.id" type="checkbox" />
                            Can edit task
                          </label>
                          <label class="flex items-center gap-2">
                            <input [(ngModel)]="draft.canDeleteTask" [ngModelOptions]="{ standalone: true }" name="delete-task-{{ member.id }}"
                              [disabled]="member.role === 'OWNER' || !canManageMembers() || savingMemberId() === member.id" type="checkbox" />
                            Can delete task
                          </label>
                          <label class="flex items-center gap-2">
                            <input [(ngModel)]="draft.canInviteMember" [ngModelOptions]="{ standalone: true }" name="invite-member-{{ member.id }}"
                              [disabled]="member.role === 'OWNER' || !canManageMembers() || savingMemberId() === member.id" type="checkbox" />
                            Can invite
                          </label>
                          <label class="flex items-center gap-2">
                            <input [(ngModel)]="draft.canManageMembers" [ngModelOptions]="{ standalone: true }" name="manage-members-{{ member.id }}"
                              [disabled]="member.role === 'OWNER' || !canManageMembers() || savingMemberId() === member.id" type="checkbox" />
                            Can manage members
                          </label>
                        </div>

                        <div class="flex items-center gap-2">
                          <button
                            (click)="saveMember(member.id)"
                            [disabled]="member.role === 'OWNER' || !canManageMembers() || savingMemberId() === member.id"
                            class="bg-slate-950 hover:bg-slate-700 disabled:opacity-60 text-white px-3 py-1.5 rounded text-xs font-medium"
                          >
                            Save
                          </button>
                          <button
                            (click)="resetMemberDraft(member)"
                            [disabled]="savingMemberId() === member.id"
                            class="border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded text-xs font-medium text-slate-700"
                          >
                            Reset
                          </button>
                          <button
                            (click)="removeMember(member)"
                            [disabled]="member.role === 'OWNER' || !canManageMembers() || savingMemberId() === member.id"
                            class="border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60 px-3 py-1.5 rounded text-xs font-medium"
                          >
                            Remove
                          </button>
                          @if (member.role === 'OWNER') {
                            <span class="text-xs text-slate-500">Owner cannot be edited here.</span>
                          }
                        </div>
                      </div>
                    }
                  }
                </div>
              }
            </div>

            }

            @if (false) {
            <div class="bg-white border border-slate-200 rounded-xl p-5">
              <h2 class="font-semibold text-slate-800 mb-3">Activity</h2>
              @if (activityLogs().length === 0) {
                <p class="text-sm text-slate-500">No activity logs.</p>
              } @else {
                <div class="space-y-2">
                  @for (log of activityLogs(); track log.id) {
                    <div class="border border-slate-200 rounded-lg p-3">
                      <p class="text-xs text-slate-800">{{ log.action }}</p>
                      <p class="text-xs text-slate-500 mt-1">{{ log.username }} • {{ formatDate(log.createdAt) }}</p>
                    </div>
                  }
                </div>
              }
            </div>
            }
          </section>
          }
        </div>
      }
    </div>
  `
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private memberService = inject(MemberService);
  private invitationService = inject(InvitationService);
  private activityLogService = inject(ActivityLogService);
  private deploymentService = inject(DeploymentService);
  private commitService = inject(CommitService);
  private userService = inject(UserService);

  projectId = signal<number | null>(null);
  project = signal<ProjectResponse | null>(null);
  statistics = signal<ProjectStatisticsResponse | null>(null);
  tasks = signal<TaskResponse[]>([]);
  members = signal<ProjectMemberResponse[]>([]);
  invitations = signal<ProjectInvitationResponse[]>([]);
  activityLogs = signal<ActivityLogResponse[]>([]);
  deployments = signal<DeploymentResponse[]>([]);
  commits = signal<CommitResponse[]>([]);
  inviteCandidates = signal<UserResponse[]>([]);
  searchingInviteCandidates = signal(false);
  loadingDeployments = signal(false);
  loadingCommits = signal(false);
  loading = signal(true);
  error = signal('');
  actionError = signal('');
  savingTask = signal(false);
  savingInvite = signal(false);
  savingMemberId = signal<number | null>(null);
  savingProjectSettings = signal(false);
  deletingProject = signal(false);
  movingTaskId = signal<number | null>(null);
  dragOverStatus = signal<TaskStatus | null>(null);

  taskPage = signal(0);
  taskTotalPages = signal(0);
  taskTotalElements = signal(0);
  activeSection = signal<'board' | 'details' | 'deployments'>('deployments');
  managingMembers = signal(false);

  memberDrafts: Record<number, ProjectMemberUpdateRequest> = {};
  readonly boardColumns: { status: TaskStatus; label: string; columnClass: string; dotClass: string }[] = [
    { status: 'A_FAIRE', label: 'To do', columnClass: 'border-slate-200 bg-slate-100', dotClass: 'bg-slate-500' },
    { status: 'EN_COURS', label: 'In progress', columnClass: 'border-amber-200 bg-amber-50', dotClass: 'bg-amber-500' },
    { status: 'TERMINE', label: 'Done', columnClass: 'border-emerald-200 bg-emerald-50', dotClass: 'bg-emerald-500' }
  ];

  taskForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    status: ['A_FAIRE' as TaskStatus, Validators.required],
    priority: ['MOYENNE' as TaskPriority, Validators.required],
    dueDate: [''],
    assignedTo: ['']
  });

  taskFiltersForm = this.fb.nonNullable.group({
    status: [''],
    priority: [''],
    assignedToMe: [false],
    overdue: [false],
    size: [20]
  });

  inviteForm = this.fb.nonNullable.group({
    searchQuery: [''],
    invitedEmail: ['', [Validators.required, Validators.email]]
  });

  projectSettingsForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    repoOwner: [''],
    repoName: ['']
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId ? Number(rawId) : NaN;
    if (!Number.isFinite(id)) {
      this.error.set('Invalid project id.');
      this.loading.set(false);
      return;
    }
    this.projectId.set(id);
    this.loadAll(id);
  }

  createTask(): void {
    const id = this.projectId();
    if (!this.canCreateTask()) {
      this.setActionError('You do not have permission to create tasks.');
      return;
    }
    if (!id || this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const rawAssignedTo = this.taskForm.controls.assignedTo.value.trim();
    const assignedTo = rawAssignedTo ? Number(rawAssignedTo) : null;
    this.savingTask.set(true);

    this.taskService
      .create(id, {
        title: this.taskForm.controls.title.value,
        description: this.taskForm.controls.description.value,
        status: this.taskForm.controls.status.value,
        priority: this.taskForm.controls.priority.value,
        dueDate: this.taskForm.controls.dueDate.value || null,
        assignedTo: Number.isFinite(assignedTo) ? assignedTo : null
      })
      .subscribe({
        next: () => {
          this.taskForm.reset({
            title: '',
            description: '',
            status: 'A_FAIRE',
            priority: 'MOYENNE',
            dueDate: '',
            assignedTo: ''
          });
          this.savingTask.set(false);
          this.loadTasks(0);
          this.loadStatistics();
        },
        error: err => {
          this.setActionError(err.error?.message ?? 'Unable to create task.');
          this.savingTask.set(false);
        }
      });
  }

  createInvite(): void {
    const id = this.projectId();
    if (!this.canInviteMembers()) {
      this.setActionError('You do not have permission to invite members.');
      return;
    }
    if (!id || this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    this.savingInvite.set(true);
    this.invitationService
      .create(id, {
        invitedEmail: this.inviteForm.controls.invitedEmail.value,
        proposedRole: 'MEMBER',
        roleTitle: 'Member',
        roleDescription: 'Project member',
        canViewProject: true,
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: false,
        canInviteMember: false,
        canManageMembers: false
      })
      .subscribe({
        next: invitation => {
          this.invitations.update(list => [invitation, ...list]);
          this.inviteForm.reset({ searchQuery: '', invitedEmail: '' });
          this.inviteCandidates.set([]);
          this.savingInvite.set(false);
        },
        error: err => {
          this.setActionError(err.error?.message ?? 'Unable to send invitation.');
          this.savingInvite.set(false);
        }
      });
  }

  searchInviteCandidates(): void {
    const query = this.inviteForm.controls.searchQuery.value.trim();
    if (query.length < 2) {
      this.inviteCandidates.set([]);
      return;
    }

    this.searchingInviteCandidates.set(true);
    this.userService.search(query).subscribe({
      next: users => {
        this.inviteCandidates.set(users);
        this.searchingInviteCandidates.set(false);
      },
      error: err => {
        this.setActionError(err.error?.message ?? 'Unable to search users.');
        this.searchingInviteCandidates.set(false);
      }
    });
  }

  selectInviteCandidate(candidate: UserResponse): void {
    this.inviteForm.patchValue({ invitedEmail: candidate.email });
    this.inviteCandidates.set([]);
  }

  applyTaskFilters(): void {
    this.loadTasks(0);
  }

  resetTaskFilters(): void {
    this.taskFiltersForm.reset({
      status: '',
      priority: '',
      assignedToMe: false,
      overdue: false,
      size: 20
    });
    this.loadTasks(0);
  }

  prevTaskPage(): void {
    if (this.taskPage() > 0) {
      this.loadTasks(this.taskPage() - 1);
    }
  }

  nextTaskPage(): void {
    if (this.taskPage() + 1 < this.taskTotalPages()) {
      this.loadTasks(this.taskPage() + 1);
    }
  }

  loadTasks(page = 0): void {
    const id = this.projectId();
    if (!id) {
      return;
    }

    const size = Number(this.taskFiltersForm.controls.size.value);
    const safeSize = Number.isFinite(size) && size > 0 ? size : 20;
    const filters: TaskFilters = { page, size: safeSize };

    const status = this.taskFiltersForm.controls.status.value;
    const priority = this.taskFiltersForm.controls.priority.value;
    const assignedToMe = this.taskFiltersForm.controls.assignedToMe.value;
    const overdue = this.taskFiltersForm.controls.overdue.value;

    if (status) {
      filters.status = status as TaskStatus;
    }
    if (priority) {
      filters.priority = priority as TaskPriority;
    }
    if (assignedToMe) {
      filters.assignedToMe = true;
    }
    if (overdue) {
      filters.overdue = true;
    }

    this.taskService.list(id, filters).subscribe({
      next: pageData => {
        this.tasks.set(pageData.content);
        this.taskPage.set(pageData.number);
        this.taskTotalPages.set(pageData.totalPages);
        this.taskTotalElements.set(pageData.totalElements);
      },
      error: err => {
        this.setActionError(err.error?.message ?? 'Unable to load project tasks.');
      }
    });
  }

  saveMember(memberId: number): void {
    const id = this.projectId();
    if (!this.canManageMembers()) {
      this.setActionError('You do not have permission to manage members.');
      return;
    }
    const draft = this.memberDrafts[memberId];
    if (!id || !draft) {
      return;
    }

    this.savingMemberId.set(memberId);
    this.memberService.update(id, memberId, draft).subscribe({
      next: updated => {
        this.members.update(list => list.map(member => (member.id === updated.id ? updated : member)));
        this.memberDrafts = {
          ...this.memberDrafts,
          [updated.id]: this.toMemberUpdateRequest(updated)
        };
        this.savingMemberId.set(null);
      },
      error: err => {
        this.setActionError(err.error?.message ?? 'Unable to update member.');
        this.savingMemberId.set(null);
      }
    });
  }

  saveProjectSettings(): void {
    const id = this.projectId();
    if (!this.canEditProject()) {
      this.setActionError('Only the project owner can update project settings.');
      return;
    }
    if (!id || this.projectSettingsForm.invalid) {
      this.projectSettingsForm.markAllAsTouched();
      return;
    }

    this.savingProjectSettings.set(true);
    this.projectService
      .update(id, {
        name: this.projectSettingsForm.controls.name.value,
        description: this.projectSettingsForm.controls.description.value,
        repoOwner: this.projectSettingsForm.controls.repoOwner.value,
        repoName: this.projectSettingsForm.controls.repoName.value
      })
      .subscribe({
        next: updated => {
          this.project.set(updated);
          this.projectSettingsForm.reset({
            name: updated.name,
            description: updated.description ?? '',
            repoOwner: updated.repoOwner ?? '',
            repoName: updated.repoName ?? ''
          });
          if (this.hasLinkedRepository()) {
            this.loadDeployments();
            this.loadCommits();
          } else {
            this.deployments.set([]);
            this.commits.set([]);
          }
          this.savingProjectSettings.set(false);
          this.setActionError('');
        },
        error: err => {
          this.setActionError(err.error?.message ?? 'Unable to update project.');
          this.savingProjectSettings.set(false);
        }
      });
  }

  deleteProject(): void {
    const id = this.projectId();
    if (!this.canEditProject()) {
      this.setActionError('Only the project owner can delete this project.');
      return;
    }
    if (!id) {
      return;
    }
    if (!window.confirm('Delete this project and all related data? This action cannot be undone.')) {
      return;
    }

    this.deletingProject.set(true);
    this.projectService.delete(id).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.setActionError(err.error?.message ?? 'Unable to delete project.');
        this.deletingProject.set(false);
      }
    });
  }

  currentMember(): ProjectMemberResponse | null {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      return null;
    }
    return this.members().find(member => member.userId === userId) ?? null;
  }

  canCreateTask(): boolean {
    const member = this.currentMember();
    return !!member && (member.role === 'OWNER' || member.canCreateTask);
  }

  canMoveTasks(): boolean {
    const member = this.currentMember();
    return !!member && member.status === 'ACTIVE' && (member.role === 'OWNER' || member.canEditTask);
  }

  canInviteMembers(): boolean {
    const member = this.currentMember();
    return !!member && (member.role === 'OWNER' || member.canInviteMember);
  }

  canManageMembers(): boolean {
    const member = this.currentMember();
    return !!member && (member.role === 'OWNER' || member.canManageMembers);
  }

  canEditProject(): boolean {
    const userId = this.auth.currentUser()?.id;
    const project = this.project();
    return !!userId && !!project && project.ownerId === userId;
  }

  resetMemberDraft(member: ProjectMemberResponse): void {
    this.memberDrafts = {
      ...this.memberDrafts,
      [member.id]: this.toMemberUpdateRequest(member)
    };
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  removeMember(member: ProjectMemberResponse): void {
    const projectId = this.projectId();
    if (!projectId || !this.canManageMembers() || member.role === 'OWNER') {
      return;
    }
    if (!window.confirm(`Remove ${member.username} from this project?`)) {
      return;
    }
    this.savingMemberId.set(member.id);
    this.memberService.remove(projectId, member.userId).subscribe({
      next: () => {
        this.members.update(members => members.filter(item => item.id !== member.id));
        const { [member.id]: _, ...drafts } = this.memberDrafts;
        this.memberDrafts = drafts;
        this.savingMemberId.set(null);
      },
      error: err => {
        this.setActionError(err.error?.message ?? 'Unable to remove member.');
        this.savingMemberId.set(null);
      }
    });
  }

  tasksForStatus(status: TaskStatus): TaskResponse[] {
    return this.tasks().filter(task => task.status === status);
  }

  priorityLabel(priority: TaskPriority): string {
    return ({ BASSE: 'Low', MOYENNE: 'Medium', HAUTE: 'High' })[priority];
  }

  priorityBadgeClass(priority: TaskPriority): string {
    return {
      BASSE: 'shrink-0 rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-wide text-slate-600',
      MOYENNE: 'shrink-0 rounded-full border border-slate-500 bg-slate-200 px-2 py-1 text-[10px] font-bold tracking-wide text-slate-700',
      HAUTE: 'shrink-0 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-bold tracking-wide text-white'
    }[priority];
  }

  userInitials(username: string | null): string {
    if (!username) {
      return '?';
    }
    return username
      .trim()
      .split(/\s+/)
      .map(part => part.charAt(0))
      .join('')
      .slice(0, 2);
  }

  onDragStart(event: DragEvent, task: TaskResponse): void {
    if (!this.canMoveTasks()) {
      event.preventDefault();
      return;
    }
    this.movingTaskId.set(task.id);
    event.dataTransfer?.setData('text/plain', String(task.id));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent, status: TaskStatus): void {
    if (!this.canMoveTasks() || !this.movingTaskId()) {
      return;
    }
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.dragOverStatus.set(status);
  }

  onDragLeave(event: DragEvent, status: TaskStatus): void {
    if (event.currentTarget === event.target && this.dragOverStatus() === status) {
      this.dragOverStatus.set(null);
    }
  }

  onDragEnd(): void {
    this.movingTaskId.set(null);
    this.dragOverStatus.set(null);
  }

  onDrop(event: DragEvent, status: TaskStatus): void {
    event.preventDefault();
    const taskId = this.movingTaskId() ?? Number(event.dataTransfer?.getData('text/plain'));
    this.onDragEnd();
    const task = this.tasks().find(item => item.id === taskId);
    if (!task || task.status === status || !this.canMoveTasks()) {
      return;
    }

    const previousStatus = task.status;
    this.tasks.update(tasks => tasks.map(item => item.id === task.id ? { ...item, status } : item));
    this.taskService.update(task.id, {
      title: task.title,
      description: task.description,
      status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo
    }).subscribe({
      next: () => {
        this.loadStatistics();
        this.setActionError('');
      },
      error: err => {
        this.tasks.update(tasks => tasks.map(item => item.id === task.id ? { ...item, status: previousStatus } : item));
        this.setActionError(err.error?.message ?? 'Unable to move task.');
      }
    });
  }

  pendingInvitations(): ProjectInvitationResponse[] {
    return this.invitations().filter(invitation => invitation.status === 'PENDING');
  }

  linkedRepository(): string {
    const owner = this.project()?.repoOwner?.trim();
    const name = this.project()?.repoName?.trim();
    if (!owner || !name) {
      return '';
    }
    return `${owner}/${name}`;
  }

  hasLinkedRepository(): boolean {
    return this.linkedRepository().length > 0;
  }

  shortCommitHash(hash: string): string {
    const normalized = hash?.trim();
    if (!normalized) {
      return '-';
    }
    return normalized.slice(0, 7);
  }

  relativeTimeFromNow(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const diffMs = date.getTime() - Date.now();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

    if (Math.abs(diffMs) < hour) {
      return rtf.format(Math.round(diffMs / minute), 'minute');
    }
    if (Math.abs(diffMs) < day) {
      return rtf.format(Math.round(diffMs / hour), 'hour');
    }
    return rtf.format(Math.round(diffMs / day), 'day');
  }

  private loadAll(id: number): void {
    this.loading.set(true);
    this.actionError.set('');
    this.projectService.get(id).subscribe({
      next: project => {
        this.project.set(project);
        this.projectSettingsForm.reset({
          name: project.name,
          description: project.description ?? '',
          repoOwner: project.repoOwner ?? '',
          repoName: project.repoName ?? ''
        });
        if (this.hasLinkedRepository()) {
          this.loadDeployments();
          this.loadCommits();
        } else {
          this.deployments.set([]);
          this.commits.set([]);
        }
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Unable to load project.');
        this.loading.set(false);
      }
    });

    this.loadStatistics();
    this.loadTasks(0);
    this.loadMembers();

    this.invitationService.list(id).subscribe({
      next: invitations => this.invitations.set(invitations),
      error: err => {
        this.setActionError(err.error?.message ?? 'Unable to load project invitations.');
      }
    });

    this.activityLogService.list(id).subscribe({
      next: logs => this.activityLogs.set(logs),
      error: err => {
        this.setActionError(err.error?.message ?? 'Unable to load activity logs.');
      }
    });
  }

  private loadMembers(): void {
    const id = this.projectId();
    if (!id) {
      return;
    }

    this.memberService.list(id).subscribe({
      next: members => {
        this.members.set(members);
        this.memberDrafts = members.reduce<Record<number, ProjectMemberUpdateRequest>>((acc, member) => {
          acc[member.id] = this.toMemberUpdateRequest(member);
          return acc;
        }, {});
      },
      error: err => {
        this.setActionError(err.error?.message ?? 'Unable to load project members.');
      }
    });
  }

  private loadStatistics(): void {
    const id = this.projectId();
    if (!id) {
      return;
    }

    this.projectService.getStatistics(id).subscribe({
      next: statistics => this.statistics.set(statistics),
      error: err => {
        this.setActionError(err.error?.message ?? 'Unable to load project statistics.');
      }
    });
  }

  private loadDeployments(): void {
    const id = this.projectId();
    if (!id) {
      return;
    }
    this.loadingDeployments.set(true);
    this.deploymentService.list(id).subscribe({
      next: deployments => {
        this.deployments.set(deployments);
        this.loadingDeployments.set(false);
      },
      error: err => {
        this.setActionError(err.error?.message ?? 'Unable to load project deployments.');
        this.loadingDeployments.set(false);
      }
    });
  }

  private loadCommits(): void {
    const id = this.projectId();
    if (!id) {
      return;
    }
    this.loadingCommits.set(true);
    this.commitService.list(id).subscribe({
      next: commits => {
        this.commits.set(commits);
        this.loadingCommits.set(false);
      },
      error: err => {
        this.setActionError(err.error?.message ?? 'Unable to load recent commits.');
        this.loadingCommits.set(false);
      }
    });
  }

  private setActionError(message: string): void {
    this.actionError.set(message);
  }

  private toMemberUpdateRequest(member: ProjectMemberResponse): ProjectMemberUpdateRequest {
    return {
      role: member.role as ProjectMemberRole,
      status: member.status as ProjectMemberStatus,
      roleTitle: member.roleTitle ?? '',
      roleDescription: member.roleDescription ?? '',
      canViewProject: member.canViewProject,
      canCreateTask: member.canCreateTask,
      canEditTask: member.canEditTask,
      canDeleteTask: member.canDeleteTask,
      canInviteMember: member.canInviteMember,
      canManageMembers: member.canManageMembers
    };
  }
}
