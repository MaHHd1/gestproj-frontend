import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { ProjectCreateRequest, ProjectResponse } from '../../core/models/project.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="p-8">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between border-b border-slate-700 pb-5">
        <div>
          <h1 class="text-2xl font-bold text-white">Projects</h1>
          <p class="mt-1 text-sm text-slate-400">Your project workspaces and linked repositories</p>
        </div>
        <button (click)="showModal.set(true)" class="gp-btn-primary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Project
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
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
            class="bg-slate-950 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Create project
          </button>
        </div>
      }

      <!-- Project grid -->
      @if (!loading() && projects().length > 0) {
        <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (project of projects(); track project.id) {
            <a [routerLink]="['/projects', project.id]"
              class="group block rounded-xl border border-slate-700 bg-[#161b22] p-5 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md">
              <div class="mb-4 flex items-start justify-between">
                <div class="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-[#f6f8fa]">
                  <span class="font-mono text-sm font-bold text-slate-700">{{ project.name.charAt(0).toUpperCase() }}</span>
                </div>
                <svg class="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
              <h3 class="mb-1 font-semibold text-white transition-colors group-hover:underline">{{ project.name }}</h3>
              <p class="mb-5 min-h-10 text-sm leading-5 text-slate-400 line-clamp-2">{{ project.description || 'No description provided.' }}</p>
              @if (project.repoOwner && project.repoName) {
                <p class="mb-4 inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"><span aria-hidden="true">⌘</span><span class="truncate">{{ project.repoOwner }}/{{ project.repoName }}</span></p>
              }
              <div class="flex items-center justify-between border-t border-slate-700 pt-3 text-xs text-slate-400">
                <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                {{ project.ownerUsername }}
                </span>
                <span class="font-medium text-slate-900">Open project →</span>
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
              <label class="gp-label">Project name *</label>
              <input formControlName="name" type="text" placeholder="My awesome project"
                class="gp-input"
                [class.border-red-400]="createForm.get('name')?.invalid && createForm.get('name')?.touched">
              @if (createForm.get('name')?.invalid && createForm.get('name')?.touched) {
                <p class="text-red-500 text-xs mt-1">Project name is required</p>
              }
            </div>

            <div>
              <label class="gp-label">Description</label>
              <textarea formControlName="description" rows="3" placeholder="What is this project about?"
                class="gp-input resize-none">
              </textarea>
            </div>

            <div class="rounded-lg border border-slate-200 bg-[#f6f8fa] p-4">
              <div class="mb-3 flex items-center gap-2"><span class="text-lg text-slate-600" aria-hidden="true">⌘</span><div><p class="text-sm font-semibold text-slate-800">Repository connection <span class="font-normal text-slate-500">(optional)</span></p><p class="text-xs text-slate-500">Link a Gitea repository to see commits and deployments.</p></div></div>
              <div class="grid gap-3 sm:grid-cols-2">
              <div>
              <label class="gp-label">Repository owner</label>
              <input formControlName="repoOwner" type="text" placeholder="e.g. my-org"
                class="gp-input">
              </div>
              <div>
              <label class="gp-label">Repository name</label>
              <input formControlName="repoName" type="text" placeholder="e.g. gestproj-backend"
                class="gp-input">
              </div>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" (click)="closeModal()"
                class="gp-btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" [disabled]="creating()"
                class="gp-btn-primary flex-1">
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
    description: [''],
    repoOwner: [''],
    repoName: ['']
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
    const payload: ProjectCreateRequest = {
      name: this.createForm.controls.name.value ?? '',
      description: this.createForm.controls.description.value ?? '',
      repoOwner: this.createForm.controls.repoOwner.value ?? null,
      repoName: this.createForm.controls.repoName.value ?? null
    };
    this.projectService.create(payload).subscribe({
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
