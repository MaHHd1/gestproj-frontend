import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { ProjectResponse } from '../../core/models/project.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Projects</h1>
          <p class="text-slate-500 text-sm mt-1">All your collaborative projects</p>
        </div>
        <button (click)="showModal.set(true)"
          class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Project
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && projects().length === 0) {
        <div class="text-center py-20">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
            </svg>
          </div>
          <h3 class="text-slate-600 font-medium mb-2">No projects yet</h3>
          <p class="text-slate-400 text-sm mb-4">Create your first project to get started</p>
          <button (click)="showModal.set(true)"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Create project
          </button>
        </div>
      }

      <!-- Project grid -->
      @if (!loading() && projects().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (project of projects(); track project.id) {
            <a [routerLink]="['/projects', project.id]"
              class="bg-white rounded-xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer block">
              <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span class="text-indigo-600 font-bold text-sm">{{ project.name.charAt(0).toUpperCase() }}</span>
                </div>
                <svg class="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
              <h3 class="font-semibold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">{{ project.name }}</h3>
              <p class="text-slate-500 text-sm line-clamp-2 mb-4">{{ project.description || 'No description' }}</p>
              <div class="flex items-center gap-1 text-xs text-slate-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                {{ project.ownerUsername }}
              </div>
            </a>
          }
        </div>
      }
    </div>

    <!-- Create project modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-bold text-slate-800">New Project</h2>
            <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          @if (createError()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{{ createError() }}</div>
          }

          <form [formGroup]="createForm" (ngSubmit)="createProject()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Project name *</label>
              <input formControlName="name" type="text" placeholder="My awesome project"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                [class.border-red-400]="createForm.get('name')?.invalid && createForm.get('name')?.touched">
              @if (createForm.get('name')?.invalid && createForm.get('name')?.touched) {
                <p class="text-red-500 text-xs mt-1">Project name is required</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea formControlName="description" rows="3" placeholder="What is this project about?"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none">
              </textarea>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" (click)="closeModal()"
                class="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="creating()"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                @if (creating()) { Creating... } @else { Create }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private fb = inject(FormBuilder);

  projects = signal<ProjectResponse[]>([]);
  loading = signal(true);
  showModal = signal(false);
  creating = signal(false);
  createError = signal('');

  createForm = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.projectService.list().subscribe({
      next: data => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  createProject(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.creating.set(true);
    this.createError.set('');
    this.projectService.create(this.createForm.value as any).subscribe({
      next: project => {
        this.projects.update(list => [project, ...list]);
        this.closeModal();
        this.creating.set(false);
      },
      error: err => {
        this.createError.set(err.error?.message ?? 'Failed to create project');
        this.creating.set(false);
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.createForm.reset();
    this.createError.set('');
  }
}
