import type { User } from '@ghostfx/shared-types';

import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function register(input: {
  email: string;
  full_name: string;
  password: string;
  experience_mode: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });
  if (error) throw error;
  if (!data.session) throw new Error('Account created. Check email for confirmation link.');

  await api.post('/auth/register', {
    email: input.email,
    full_name: input.full_name,
    experience_mode: input.experience_mode,
  });

  return data.session;
}

export async function fetchMe() {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}
