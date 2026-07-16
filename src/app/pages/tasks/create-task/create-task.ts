import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { TaskPriority, TaskStatus } from '../../../core/models/task.model';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-3xl p-8">
      <a [routerLink]="['/projects', projectId]" class="text-sm text-indigo-600 hover:underline">Back to board</a>
      <h1 class="mt-3 text-2xl font-bold text-slate-800">Create task</h1>
      <p class="mt-1 text-sm text-slate-500">Add the task details, then return to the project board.</p>
      <form [formGroup]="form" (ngSubmit)="save()" class="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        @if (error) { <p class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ error }}</p> }
        <div><label class="mb-1 block text-sm font-medium">Title</label><input formControlName="title" class="w-full rounded-lg border border-slate-200 px-3 py-2" /></div>
        <div><label class="mb-1 block text-sm font-medium">Description</label><textarea formControlName="description" rows="4" class="w-full rounded-lg border border-slate-200 px-3 py-2"></textarea></div>
        <div class="grid gap-4 md:grid-cols-3">
          <div><label class="mb-1 block text-sm font-medium">Status</label><select formControlName="status" class="w-full rounded-lg border border-slate-200 px-3 py-2"><option value="A_FAIRE">To do</option><option value="EN_COURS">In progress</option><option value="TERMINE">Done</option></select></div>
          <div><label class="mb-1 block text-sm font-medium">Priority</label><select formControlName="priority" class="w-full rounded-lg border border-slate-200 px-3 py-2"><option value="BASSE">Low</option><option value="MOYENNE">Medium</option><option value="HAUTE">High</option></select></div>
          <div><label class="mb-1 block text-sm font-medium">Due date</label><input formControlName="dueDate" type="date" class="w-full rounded-lg border border-slate-200 px-3 py-2" /></div>
        </div>
        <div class="flex justify-end gap-3"><a [routerLink]="['/projects', projectId]" class="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</a><button [disabled]="saving" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">Create task</button></div>
      </form>
    </div>
  `
})
export class CreateTaskComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tasks = inject(TaskService);
  private fb = inject(FormBuilder);
  projectId = Number(this.route.snapshot.paramMap.get('id'));
  saving = false;
  error = '';
  form = this.fb.nonNullable.group({ title: ['', Validators.required], description: [''], status: ['A_FAIRE' as TaskStatus], priority: ['MOYENNE' as TaskPriority], dueDate: [''] });
  save(): void {
    if (!Number.isFinite(this.projectId) || this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.error = '';
    const value = this.form.getRawValue();
    this.tasks.create(this.projectId, { ...value, dueDate: value.dueDate || null, assignedTo: null }).subscribe({
      next: () => this.router.navigate(['/projects', this.projectId]),
      error: err => { this.error = err.error?.message ?? 'Unable to create task.'; this.saving = false; }
    });
  }
}
