import type { User } from '@ghostfx/shared-types';

import { api } from '@/lib/api';
import { requireSupabase } from '@/lib/supabase';

export async function login(email: string, password: string) {
  const supabase = requireSupabase();
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
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });
  if (error) throw error;

  if (data.session) {
    // Email confirmation off — session available immediately
    const token = data.session.access_token;
    await api.post('/auth/register', {
      email: input.email,
      full_name: input.full_name,
      experience_mode: input.experience_mode,
    }, { headers: { Authorization: `Bearer ${token}` } });
    return data.session;
  }

  // Email confirmation on — user must confirm, then login
  throw new Error('Check your email for a confirmation link, then sign in.');
}

export async function fetchMe() {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function logout() {
  const supabase = requireSupabase();
  await supabase.auth.signOut();
}
