import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { TaskCommentService } from '../../../core/services/task-comment.service';
import { MemberService } from '../../../core/services/member.service';
import {
  TaskCommentCreateRequest,
  TaskCommentResponse,
  TaskPriority,
  TaskResponse,
  TaskStatus
} from '../../../core/models/task.model';
import { ProjectMemberResponse } from '../../../core/models/member.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="p-8 max-w-4xl">
      @if (loading()) {
        <p class="text-slate-500">Loading task...</p>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{{ error() }}</div>
      } @else if (task()) {
        <div class="mb-6">
          <a [routerLink]="['/projects', task()!.projectId]" class="text-sm text-indigo-600 hover:underline">
            Back to project
          </a>
          <h1 class="text-2xl font-bold text-slate-800 mt-2">{{ task()!.title }}</h1>
          <p class="text-slate-500 text-sm mt-1">{{ task()!.description || 'No description' }}</p>
          @if (actionError()) {
            <div class="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">{{ actionError() }}</div>
          }
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h2 class="font-semibold text-slate-800 mb-4">Edit task</h2>
          @if (loadingMembers()) {
            <p class="text-sm text-slate-500">Loading permissions...</p>
          } @else if (canEditTask()) {
            <form [formGroup]="editForm" (ngSubmit)="saveTask()" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input formControlName="title" type="text" class="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              <input formControlName="description" type="text" class="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              <select formControlName="status" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option value="A_FAIRE">A_FAIRE</option>
                <option value="EN_COURS">EN_COURS</option>
                <option value="TERMINE">TERMINE</option>
              </select>
              <select formControlName="priority" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option value="BASSE">BASSE</option>
                <option value="MOYENNE">MOYENNE</option>
                <option value="HAUTE">HAUTE</option>
              </select>
              <input formControlName="dueDate" type="date" class="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              <select formControlName="assignedTo" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option value="">Unassigned</option>
                @for (member of members(); track member.id) {
                  <option [value]="member.userId">{{ member.username }}</option>
                }
              </select>
              <button
                type="submit"
                [disabled]="savingTask()"
                class="md:col-span-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium"
              >
                Save changes
              </button>
            </form>
          } @else {
            <p class="text-sm text-slate-500">You do not have permission to edit this task.</p>
          }

          @if (!loadingMembers() && canDeleteTask()) {
            <button
              type="button"
              (click)="deleteTask()"
              [disabled]="deletingTask()"
              class="mt-3 w-full border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60 py-2 rounded-lg text-sm font-medium"
            >
              Delete task
            </button>
          }
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-5">
          <h2 class="font-semibold text-slate-800 mb-4">Comments</h2>

          @if (loadingMembers()) {
            <p class="text-sm text-slate-500 mb-4">Loading permissions...</p>
          } @else if (canComment()) {
            <form [formGroup]="commentForm" (ngSubmit)="createComment()" class="flex gap-2 mb-4">
              <input
                formControlName="content"
                type="text"
                placeholder="Write a comment..."
                class="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
              <button
                type="submit"
                [disabled]="savingComment()"
                class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm"
              >
                Send
              </button>
            </form>
          } @else {
            <p class="text-sm text-slate-500 mb-4">Only active project members can add comments.</p>
          }

          @if (comments().length === 0) {
            <p class="text-sm text-slate-500">No comments yet.</p>
          } @else {
            <div class="space-y-2">
              @for (comment of comments(); track comment.id) {
                <div class="border border-slate-200 rounded-lg p-3">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <p class="text-sm text-slate-800">{{ comment.content }}</p>
                      <p class="text-xs text-slate-500 mt-1">
                        {{ comment.username }} • {{ formatDate(comment.createdAt) }}
                      </p>
                    </div>
                    @if (canDelete(comment)) {
                      <button
                        (click)="deleteComment(comment.id)"
                        class="text-xs border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TaskDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private taskCommentService = inject(TaskCommentService);
  private memberService = inject(MemberService);

  taskId = signal<number | null>(null);
  task = signal<TaskResponse | null>(null);
  comments = signal<TaskCommentResponse[]>([]);
  members = signal<ProjectMemberResponse[]>([]);
  loading = signal(true);
  loadingMembers = signal(true);
  savingTask = signal(false);
  deletingTask = signal(false);
  savingComment = signal(false);
  error = signal('');
  actionError = signal('');

  editForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    status: ['A_FAIRE' as TaskStatus, Validators.required],
    priority: ['MOYENNE' as TaskPriority, Validators.required],
    dueDate: [''],
    assignedTo: ['']
  });

  commentForm = this.fb.nonNullable.group({
    content: ['', Validators.required]
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId ? Number(rawId) : NaN;
    if (!Number.isFinite(id)) {
      this.error.set('Invalid task id.');
      this.loading.set(false);
      return;
    }
    this.taskId.set(id);
    this.loadTask(id);
    this.loadComments(id);
  }

  saveTask(): void {
    const id = this.taskId();
    if (!this.canEditTask()) {
      this.actionError.set('You do not have permission to edit this task.');
      return;
    }
    if (!id || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const rawAssignedTo = this.editForm.controls.assignedTo.value.trim();
    const assignedTo = rawAssignedTo ? Number(rawAssignedTo) : null;

    this.savingTask.set(true);
    this.taskService.update(id, {
      title: this.editForm.controls.title.value,
      description: this.editForm.controls.description.value,
      status: this.editForm.controls.status.value,
      priority: this.editForm.controls.priority.value,
      dueDate: this.editForm.controls.dueDate.value || null,
      assignedTo: Number.isFinite(assignedTo) ? assignedTo : null
    }).subscribe({
      next: task => {
        this.task.set(task);
        this.actionError.set('');
        this.savingTask.set(false);
      },
      error: err => {
        this.actionError.set(err.error?.message ?? 'Unable to update task.');
        this.savingTask.set(false);
      }
    });
  }

  createComment(): void {
    const id = this.taskId();
    if (!this.canComment()) {
      this.actionError.set('Only active project members can add comments.');
      return;
    }
    if (!id || this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }
    const payload: TaskCommentCreateRequest = { content: this.commentForm.controls.content.value };
    this.savingComment.set(true);
    this.taskCommentService.create(id, payload).subscribe({
      next: comment => {
        this.comments.update(list => [comment, ...list]);
        this.commentForm.reset({ content: '' });
        this.actionError.set('');
        this.savingComment.set(false);
      },
      error: err => {
        this.actionError.set(err.error?.message ?? 'Unable to create comment.');
        this.savingComment.set(false);
      }
    });
  }

  deleteComment(commentId: number): void {
    const id = this.taskId();
    if (!id) {
      return;
    }
    this.taskCommentService.delete(id, commentId).subscribe({
      next: () => this.comments.update(list => list.filter(comment => comment.id !== commentId)),
      error: err => this.actionError.set(err.error?.message ?? 'Unable to delete comment.')
    });
  }

  deleteTask(): void {
    const task = this.task();
    if (!task) {
      return;
    }
    if (!this.canDeleteTask()) {
      this.actionError.set('You do not have permission to delete this task.');
      return;
    }
    if (!window.confirm('Delete this task? This action cannot be undone.')) {
      return;
    }

    this.deletingTask.set(true);
    this.taskService.delete(task.id).subscribe({
      next: () => {
        this.router.navigate(['/projects', task.projectId]);
      },
      error: err => {
        this.actionError.set(err.error?.message ?? 'Unable to delete task.');
        this.deletingTask.set(false);
      }
    });
  }

  canDelete(comment: TaskCommentResponse): boolean {
    return this.auth.currentUser()?.id === comment.userId;
  }

  canEditTask(): boolean {
    const member = this.currentMember();
    return !!member && member.status === 'ACTIVE' && (member.role === 'OWNER' || member.canEditTask);
  }

  canDeleteTask(): boolean {
    const member = this.currentMember();
    return !!member && member.status === 'ACTIVE' && (member.role === 'OWNER' || member.canDeleteTask);
  }

  canComment(): boolean {
    const member = this.currentMember();
    return !!member && member.status === 'ACTIVE';
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  private loadTask(id: number): void {
    this.loading.set(true);
    this.taskService.get(id).subscribe({
      next: task => {
        this.task.set(task);
        this.editForm.reset({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
          assignedTo: task.assignedTo ? String(task.assignedTo) : ''
        });
        this.loadMembers(task.projectId);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Unable to load task.');
        this.loading.set(false);
      }
    });
  }

  private loadComments(id: number): void {
    this.taskCommentService.list(id).subscribe({
      next: comments => this.comments.set(comments),
      error: err => {
        this.actionError.set(err.error?.message ?? 'Unable to load comments.');
      }
    });
  }

  private loadMembers(projectId: number): void {
    this.loadingMembers.set(true);
    this.memberService.list(projectId).subscribe({
      next: members => {
        this.members.set(members);
        this.loadingMembers.set(false);
      },
      error: err => {
        this.actionError.set(err.error?.message ?? 'Unable to load project members.');
        this.loadingMembers.set(false);
      }
    });
  }

  private currentMember(): ProjectMemberResponse | null {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      return null;
    }
    return this.members().find(member => member.userId === userId) ?? null;
  }
}
