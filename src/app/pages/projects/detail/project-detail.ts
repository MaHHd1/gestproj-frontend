import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { TaskFilters, TaskService } from '../../../core/services/task.service';
import { MemberService } from '../../../core/services/member.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { ActivityLogService } from '../../../core/services/activity-log.service';
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
            <h1 class="text-2xl font-bold text-slate-800">{{ project()!.name }}</h1>
            <p class="text-slate-500 text-sm mt-1">{{ project()!.description || 'No description' }}</p>
          </div>
          <a routerLink="/dashboard" class="text-sm text-indigo-600 hover:underline">Back to projects</a>
        </div>

        <div class="mb-6 flex items-center gap-2 border-b border-slate-200">
          <button (click)="activeSection.set('board')"
            [class]="activeSection() === 'board' ? 'border-b-2 border-indigo-600 px-4 py-3 text-sm font-semibold text-indigo-700' : 'px-4 py-3 text-sm text-slate-500 hover:text-slate-800'">
            Board
          </button>
          <button (click)="activeSection.set('details')"
            [class]="activeSection() === 'details' ? 'border-b-2 border-indigo-600 px-4 py-3 text-sm font-semibold text-indigo-700' : 'px-4 py-3 text-sm text-slate-500 hover:text-slate-800'">
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
            <div class="bg-white border border-slate-200 rounded-lg p-3">
              <p class="text-xs text-slate-500">Total</p>
              <p class="text-lg font-semibold text-slate-800">{{ statistics()!.totalTasks }}</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg p-3">
              <p class="text-xs text-slate-500">Completed</p>
              <p class="text-lg font-semibold text-green-700">{{ statistics()!.completedTasks }}</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg p-3">
              <p class="text-xs text-slate-500">In progress</p>
              <p class="text-lg font-semibold text-amber-700">{{ statistics()!.inProgressTasks }}</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg p-3">
              <p class="text-xs text-slate-500">Late</p>
              <p class="text-lg font-semibold text-red-700">{{ statistics()!.lateTasks }}</p>
            </div>
          </div>
        }

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          @if (activeSection() === 'board') {
          <section class="xl:col-span-3 space-y-6">
            @if (false) {
            <div class="bg-white border border-slate-200 rounded-xl p-5">
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

            <div class="bg-white border border-slate-200 rounded-xl p-5">

              <form [formGroup]="taskFiltersForm" (ngSubmit)="applyTaskFilters()" class="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
                <select formControlName="status" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                  <option value="">All statuses</option>
                  <option value="A_FAIRE">To do</option>
                  <option value="EN_COURS">In progress</option>
                  <option value="TERMINE">Done</option>
                </select>
                <select formControlName="priority" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                  <option value="">All priorities</option>
                  <option value="BASSE">Low</option>
                  <option value="MOYENNE">Medium</option>
                  <option value="HAUTE">High</option>
                </select>
                <label class="flex items-center gap-2 text-xs text-slate-700 border border-slate-200 rounded-lg px-3 py-2">
                  <input formControlName="assignedToMe" type="checkbox" />
                  Assigned to me
                </label>
                <label class="flex items-center gap-2 text-xs text-slate-700 border border-slate-200 rounded-lg px-3 py-2">
                  <input formControlName="overdue" type="checkbox" />
                  Overdue
                </label>
                <select formControlName="size" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                  <option [ngValue]="10">10 / page</option>
                  <option [ngValue]="20">20 / page</option>
                  <option [ngValue]="50">50 / page</option>
                </select>
                <div class="md:col-span-5 flex items-center gap-2">
                  <button
                    type="submit"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-medium"
                  >
                    Apply filters
                  </button>
                  <button
                    type="button"
                    (click)="resetTaskFilters()"
                    class="border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg text-xs font-medium text-slate-700"
                  >
                    Reset
                  </button>
                </div>
              </form>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                @for (column of boardColumns; track column.status) {
                  <section
                    [class]="'rounded-xl border p-3 transition-colors ' + column.columnClass + (dragOverStatus() === column.status ? ' ring-2 ring-indigo-400 ring-offset-2' : '')"
                    (dragover)="onDragOver($event, column.status)"
                    (dragleave)="onDragLeave($event, column.status)"
                    (drop)="onDrop($event, column.status)"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <span [class]="'h-2.5 w-2.5 rounded-full ' + column.dotClass"></span>{{ column.label }}
                      </h3>
                      <div class="flex items-center gap-2">
                        <span class="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{{ tasksForStatus(column.status).length }}</span>
                        @if (canCreateTask()) {
                          <a [routerLink]="['/projects', projectId(), 'tasks', 'new']" [queryParams]="{ status: column.status }" class="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700" [attr.aria-label]="'Create task in ' + column.label">+</a>
                        }
                      </div>
                    </div>
                    <div class="min-h-20 space-y-2">
                      @for (task of tasksForStatus(column.status); track task.id) {
                        <div
                          [attr.draggable]="canMoveTasks() ? 'true' : null"
                          (dragstart)="onDragStart($event, task)"
                          (dragend)="onDragEnd()"
                          [class.opacity-60]="movingTaskId() === task.id"
                          [class.cursor-grab]="canMoveTasks()"
                          class="rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-indigo-300 active:cursor-grabbing"
                        >
                          <a [routerLink]="['/tasks', task.id]" class="block p-3">
                            <p class="text-sm font-medium text-slate-800">{{ task.title }}</p>
                            <div class="mt-3 flex justify-between gap-2 text-xs text-slate-500">
                              <span>{{ priorityLabel(task.priority) }}</span><span class="truncate">{{ task.assignedToUsername || 'Unassigned' }}</span>
                            </div>
                          </a>
                        </div>
                      }
                      @if (tasksForStatus(column.status).length === 0) { <p class="py-3 text-center text-xs text-slate-400">Drop a task here</p> }
                    </div>
                  </section>
                }
              </div>

              @if (taskTotalPages() > 0) {
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

          @if (activeSection() === 'details') {
          <section class="xl:col-span-3 mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 xl:grid-cols-2">
            @if (activeSection() === 'details') {
            @if (canEditProject()) {
              <div class="bg-white border border-slate-200 rounded-xl p-5">
                <h2 class="font-semibold text-slate-800 mb-3">Project settings</h2>
                <form [formGroup]="projectSettingsForm" (ngSubmit)="saveProjectSettings()" class="space-y-3">
                  <input
                    formControlName="name"
                    type="text"
                    placeholder="Project name"
                    class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <textarea
                    formControlName="description"
                    rows="3"
                    placeholder="Project description"
                    class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  ></textarea>
                  <button
                    type="submit"
                    [disabled]="savingProjectSettings()"
                    class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium"
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
            <div class="bg-white border border-slate-200 rounded-xl p-5">
              <h2 class="font-semibold text-slate-800 mb-3">Invite member</h2>
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
                    class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <button
                    type="submit"
                    [disabled]="savingInvite()"
                    class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    Send invitation
                  </button>
                </form>
            </div>
            }

            <div class="bg-white border border-slate-200 rounded-xl p-5">
              <div class="flex items-center justify-between gap-3 mb-3">
                <h2 class="font-semibold text-slate-800">Members</h2>
                @if (canManageMembers()) {
                <button (click)="managingMembers.set(!managingMembers())" class="text-xs text-indigo-600 hover:underline">
                  {{ managingMembers() ? 'Show names only' : 'Manage members' }}
                </button>
                }
              </div>
              @if (!managingMembers()) {
                <div class="space-y-2">
                  @for (member of members(); track member.id) {
                    <div class="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                      <span class="text-sm font-medium text-slate-800">{{ member.username }}</span>
                      <span class="text-xs text-slate-500">{{ member.role }}</span>
                    </div>
                  }
                </div>
              } @else if (members().length === 0) {
                <p class="text-sm text-slate-500">No members loaded.</p>
              } @else {
                <div class="space-y-3">
                  @for (member of members(); track member.id) {
                    @if (memberDrafts[member.id]; as draft) {
                      <div class="border border-slate-200 rounded-lg p-3 space-y-3">
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
                            class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-3 py-1.5 rounded text-xs font-medium"
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

            <div class="bg-white border border-slate-200 rounded-xl p-5">
              <h2 class="font-semibold text-slate-800 mb-3">Pending invitations</h2>
              @if (pendingInvitations().length === 0) {
                <p class="text-sm text-slate-500">No pending invitations.</p>
              } @else {
                <div class="space-y-2">
                  @for (invitation of pendingInvitations(); track invitation.id) {
                    <div class="border border-slate-200 rounded-lg p-3">
                      <p class="text-sm text-slate-800">{{ invitation.invitedEmail }}</p>
                      <p class="text-xs text-slate-500 mt-1">{{ invitation.status }}</p>
                    </div>
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
  private userService = inject(UserService);

  projectId = signal<number | null>(null);
  project = signal<ProjectResponse | null>(null);
  statistics = signal<ProjectStatisticsResponse | null>(null);
  tasks = signal<TaskResponse[]>([]);
  members = signal<ProjectMemberResponse[]>([]);
  invitations = signal<ProjectInvitationResponse[]>([]);
  activityLogs = signal<ActivityLogResponse[]>([]);
  inviteCandidates = signal<UserResponse[]>([]);
  searchingInviteCandidates = signal(false);
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
  activeSection = signal<'board' | 'details'>('board');
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
    description: ['']
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
        description: this.projectSettingsForm.controls.description.value
      })
      .subscribe({
        next: updated => {
          this.project.set(updated);
          this.projectSettingsForm.reset({
            name: updated.name,
            description: updated.description ?? ''
          });
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

  private loadAll(id: number): void {
    this.loading.set(true);
    this.actionError.set('');
    this.projectService.get(id).subscribe({
      next: project => {
        this.project.set(project);
        this.projectSettingsForm.reset({
          name: project.name,
          description: project.description ?? ''
        });
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
