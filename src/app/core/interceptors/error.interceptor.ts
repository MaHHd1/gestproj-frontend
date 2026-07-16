import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toasts = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 429) {
        toasts.show('Too many requests. Please wait a moment and try again.', 'error', 7000);
      } else if (error.status === 0) {
        toasts.show('Unable to reach the server. Check your connection and try again.', 'error');
      } else if (error.status >= 500) {
        toasts.show('The server encountered a problem. Please try again shortly.', 'error');
      }
      return throwError(() => error);
    })
  );
};
