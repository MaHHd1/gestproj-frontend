import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="flex items-center justify-center gap-2 text-3xl font-bold text-white"><span class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-400 text-base">⌘</span>GestProj</h1>
          <p class="mt-2 text-slate-400">Create your project workspace account</p>
        </div>

        <div class="rounded-xl border border-slate-700 bg-[#161b22] p-8 shadow-2xl">
          <h2 class="mb-2 text-2xl font-bold text-white">Create account</h2>
          <p class="mb-6 text-sm text-slate-400">Start managing projects and repository activity.</p>

          @if (error()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {{ error() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-200">Full name</label>
              <input formControlName="name" type="text" placeholder="John Doe"
                class="gp-input"
                [class.border-red-400]="form.get('name')?.invalid && form.get('name')?.touched">
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <p class="text-red-500 text-xs mt-1">Name is required</p>
              }
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-200">Username</label>
              <input formControlName="username" type="text" placeholder="johndoe"
                class="gp-input"
                [class.border-red-400]="form.get('username')?.invalid && form.get('username')?.touched">
              @if (form.get('username')?.invalid && form.get('username')?.touched) {
                <p class="text-red-500 text-xs mt-1">Username is required (min 3 chars)</p>
              }
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-200">Email</label>
              <input formControlName="email" type="email" placeholder="you@example.com"
                class="gp-input"
                [class.border-red-400]="form.get('email')?.invalid && form.get('email')?.touched">
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="text-red-500 text-xs mt-1">Valid email is required</p>
              }
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-200">Password</label>
              <input formControlName="password" type="password" placeholder="••••••••"
                class="gp-input"
                [class.border-red-400]="form.get('password')?.invalid && form.get('password')?.touched">
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-red-500 text-xs mt-1">Password is required (min 8 chars)</p>
              }
            </div>

            <button type="submit" [disabled]="loading()"
              class="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60">
              @if (loading()) { Creating account... } @else { Create account }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-slate-400">
            Already have an account?
            <a routerLink="/login" class="font-medium text-white hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    name: ['', Validators.required],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.error.set(err.error?.message ?? 'Registration failed');
        this.loading.set(false);
      }
    });
  }
}
