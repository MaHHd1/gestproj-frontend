import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

let lastErrorKey = '';
let lastErrorAt = 0;
const duplicateToastWindowMs = 5000;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toasts = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = errorMessage(error);
      const now = Date.now();
      const errorKey = `${error.status}:${message}`;
      const shouldNotify = errorKey !== lastErrorKey || now - lastErrorAt > duplicateToastWindowMs;
      if (shouldNotify) {
        lastErrorKey = errorKey;
        lastErrorAt = now;
      }

      if (error.status === 429) {
        if (shouldNotify) toasts.show('Too many requests. Please wait a moment and try again.', 'error', 7000);
      } else if (error.status === 0) {
        if (shouldNotify) toasts.show('Unable to reach the server. Check your connection and try again.', 'error');
      } else if (error.status >= 500) {
        if (shouldNotify) toasts.show(message || 'The server encountered a problem. Please try again shortly.', 'error');
      }
      return throwError(() => error);
    })
  );
};

function errorMessage(error: HttpErrorResponse): string {
  if (typeof error.error === 'object' && error.error?.message) {
    return error.error.message;
  }
  if (typeof error.error === 'string' && error.error.trim()) {
    return error.error.trim();
  }
  return '';
}
