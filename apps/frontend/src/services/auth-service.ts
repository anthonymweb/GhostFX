import type { AuthTokenResponse, User } from '@ghostfx/shared-types';

import { api } from '@/lib/api';

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthTokenResponse>('/auth/login', { email, password });
  return data;
}

export async function register(input: {
  email: string;
  full_name: string;
  password: string;
  experience_mode: string;
}) {
  const { data } = await api.post<AuthTokenResponse>('/auth/register', input);
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function logout(refreshToken?: string) {
  await api.post('/auth/logout', { refresh_token: refreshToken || null });
}
