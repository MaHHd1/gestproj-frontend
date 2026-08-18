import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const router = { navigate: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    router.navigate.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: Router, useValue: router }
      ]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('stores the session after login', () => {
    const response = {
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 1, email: 'ada@example.com', username: 'ada', name: 'Ada', profileImageUrl: null }
    };

    service.login({ email: response.user.email, password: 'secret' }).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/api/auth/login`);
    expect(request.request.method).toBe('POST');
    request.flush(response);

    expect(service.getAccessToken()).toBe('access-token');
    expect(service.getRefreshToken()).toBe('refresh-token');
    expect(service.currentUser()).toEqual(response.user);
  });

  it('clears the session and returns to login on logout', () => {
    localStorage.setItem('token', 'access-token');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getRefreshToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('loads and persists the current user', () => {
    const user = { id: 1, email: 'ada@example.com', username: 'ada', name: 'Ada', profileImageUrl: null };

    service.me().subscribe(result => expect(result).toEqual(user));
    http.expectOne(`${environment.apiUrl}/api/auth/me`).flush(user);

    expect(service.currentUser()).toEqual(user);
    expect(JSON.parse(localStorage.getItem('user') ?? '{}')).toEqual(user);
  });
});
