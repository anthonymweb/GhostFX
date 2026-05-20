import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { LockKeyhole, LogIn, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from '@ghostfx/ui';

import { fetchMe, login, register } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';

type AuthMode = 'login' | 'register';

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    if (detail) {
      return detail;
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach the GhostFX API. Start the backend or check VITE_API_URL.';
    }
  }
  return 'Authentication failed. Check the details and try again.';
}

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [mode, setMode] = useState('beginner');
  const [form, setForm] = useState({
    email: 'demo@ghostfx.ai',
    full_name: 'Demo Trader',
    password: 'ghostfx123',
  });

  const authMutation = useMutation({
    mutationFn: async () => {
      let tokens;
      if (authMode === 'login') {
        tokens = await login(form.email, form.password);
      } else {
        tokens = await register({ ...form, experience_mode: mode });
      }
      useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token);
      const user = await fetchMe();
      return { tokens, user };
    },
    onSuccess: ({ tokens, user }) => {
      setSession(tokens.access_token, tokens.refresh_token, user);
      navigate('/');
    },
    onError: () => {
      useAuthStore.getState().clearSession();
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    authMutation.mutate();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl overflow-hidden">
        <CardHeader>
          <div>
            <p className="mb-3 text-sm uppercase text-cyan-300">GhostFX AI Agent</p>
            <CardTitle className="text-3xl">Secure trading co-pilot access</CardTitle>
          </div>
          <LockKeyhole className="h-8 w-8 text-cyan-300" />
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
            <Button
              type="button"
              variant={authMode === 'login' ? 'default' : 'ghost'}
              onClick={() => setAuthMode('login')}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
            <Button
              type="button"
              variant={authMode === 'register' ? 'default' : 'ghost'}
              onClick={() => setAuthMode('register')}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Register
            </Button>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            {authMode === 'register' && (
              <Input
                value={form.full_name}
                onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
                placeholder="Full name"
                required
              />
            )}
            <Input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email"
              type="email"
              autoComplete="email"
              required
            />
            <Input
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Password"
              type="password"
              autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              minLength={authMode === 'register' ? 8 : 1}
              required
            />
            {authMode === 'register' && (
              <Select value={mode} onChange={(event) => setMode(event.target.value)}>
                <option value="beginner">Beginner mode</option>
                <option value="intermediate">Intermediate mode</option>
                <option value="advanced">Advanced mode</option>
              </Select>
            )}
            {authMutation.isError && (
              <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">
                {getErrorMessage(authMutation.error)}
              </div>
            )}
            <Button className="w-full gap-2" type="submit" disabled={authMutation.isPending}>
              {authMutation.isPending ? 'Starting session...' : authMode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
            <p className="m-0 text-sm text-slate-400">
              Use register once for a new account, then sign in with the same credentials. Sessions persist securely with refresh tokens.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
