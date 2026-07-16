export interface UserResponse {
  id: number;
  email: string;
  username: string;
  name: string;
  profileImageUrl: string | null;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserResponse;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  user?: UserResponse;
}

export interface UpdateProfileRequest {
  name: string;
  username: string;
  password?: string;
  profileImageUrl?: string | null;
}
