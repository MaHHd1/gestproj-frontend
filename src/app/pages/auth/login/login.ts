import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="flex items-center justify-center gap-2 text-3xl font-bold text-white"><span class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-400 text-base">⌘</span>GestProj</h1>
          <p class="mt-2 text-slate-400">Sign in to your project workspaces</p>
        </div>

        <div class="rounded-xl border border-slate-700 bg-[#161b22] p-8 shadow-2xl">
          <h2 class="mb-2 text-2xl font-bold text-white">Sign in</h2>
          <p class="mb-6 text-sm text-slate-400">Use your GestProj account to continue.</p>

          @if (error()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {{ error() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-200">Email</label>
              <input formControlName="email" type="email" placeholder="you@example.com"
                class="w-full rounded-lg border border-slate-600 bg-[#0d1117] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                [class.border-red-400]="form.get('email')?.invalid && form.get('email')?.touched">
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="text-red-500 text-xs mt-1">Valid email is required</p>
              }
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-200">Password</label>
              <input formControlName="password" type="password" placeholder="••••••••"
                class="w-full rounded-lg border border-slate-600 bg-[#0d1117] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                [class.border-red-400]="form.get('password')?.invalid && form.get('password')?.touched">
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-red-500 text-xs mt-1">Password is required</p>
              }
            </div>

            <div class="text-right">
              <a routerLink="/forgot-password" class="text-xs font-medium text-slate-200 hover:text-white hover:underline">Forgot password?</a>
            </div>

            <button type="submit" [disabled]="loading()"
              class="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60">
              @if (loading()) { Signing in... } @else { Sign in }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-slate-400">
            No account?
            <a routerLink="/register" class="font-medium text-white hover:underline">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.error.set(err.error?.message ?? 'Invalid credentials');
        this.loading.set(false);
      }
    });
  }
}
