import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Bot,
  Eye,
  EyeOff,
  LineChart,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  Waves,
} from 'lucide-react';
import { FormEvent, useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, CardContent } from '@ghostfx/ui';

import { fetchMe, login, register } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';

type AuthMode = 'login' | 'register';

const features = [
  { icon: ShieldCheck, text: 'AI-powered risk guardrails' },
  { icon: Activity, text: 'Real-time market scanning' },
  { icon: LineChart, text: 'Paper trading simulator' },
];

const demoCredentials = { email: 'demo@ghostfx.ai', password: 'ghostfx123' };

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    if (detail) return detail;
    if (error.code === 'ERR_NETWORK') return 'Cannot reach the API. Start the backend or check VITE_API_URL.';
  }
  return 'Authentication failed. Check your details and try again.';
}

function FieldGroup({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  const id = useId();
  return (
    <div className="group flex items-center gap-0 rounded-xl border border-white/[0.06] bg-white/[0.04] transition-all duration-200 focus-within:border-cyan-400/40 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_0_1px_rgba(34,211,238,0.15)] has-[:focus-visible]:shadow-[0_0_0_1px_rgba(34,211,238,0.15)]">
      <span className="flex items-center justify-center pl-4" aria-hidden="true">
        <Icon className="h-4 w-4 text-slate-500 transition-colors duration-200 group-focus-within:text-cyan-300" />
      </span>
      {children}
    </div>
  );
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500"
      {...props}
    />
  );
}

function FieldSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 [&>option]:bg-slate-800 [&>option]:text-white"
      {...props}
    />
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [mode, setMode] = useState('beginner');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: demoCredentials.email,
    full_name: 'Demo Trader',
    password: demoCredentials.password,
  });

  const authMutation = useMutation({
    mutationFn: async () => {
      const tokens =
        authMode === 'login'
          ? await login(form.email, form.password)
          : await register({ ...form, experience_mode: mode });
      useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token);
      const user = await fetchMe();
      return { tokens, user };
    },
    onSuccess: ({ tokens, user }) => {
      setSession(tokens.access_token, tokens.refresh_token, user);
      navigate('/');
    },
    onError: () => useAuthStore.getState().clearSession(),
  });

  useEffect(() => {
    setShowPassword(false);
  }, [authMode]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    authMutation.mutate();
  }

  function fillDemo() {
    setForm((prev) => ({ ...prev, email: demoCredentials.email, password: demoCredentials.password }));
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      <motion.div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.4), transparent)' }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent)' }}
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute left-1/3 top-1/3 h-64 w-64 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3), transparent)' }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* left brand */}
      <motion.div
        className="relative z-10 hidden w-1/2 flex-col justify-between p-12 lg:flex"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div>
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-lg shadow-cyan-400/25">
              <Bot className="h-5 w-5 text-slate-950" />
            </div>
            <span className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">GhostFX</span>
          </div>

          <motion.h1
            className="mb-6 text-5xl font-bold leading-tight text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Your protective<br />
            <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              trading co-pilot
            </span>
          </motion.h1>

          <motion.p
            className="mb-10 max-w-lg text-lg leading-relaxed text-slate-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            AI-powered market analysis, real-time signals, and risk guardrails — all built to protect your capital
            before pursuing returns.
          </motion.p>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03]">
                  <f.icon className="h-4 w-4 text-cyan-300" />
                </div>
                <span className="text-sm text-slate-300">{f.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="flex items-center gap-3 text-xs text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Waves className="h-3.5 w-3.5" />
          <span>Decision-support software — not financial advice. Trade responsibly.</span>
        </motion.div>
      </motion.div>

      {/* right auth */}
      <div className="relative z-10 flex w-full items-center justify-center px-4 py-8 lg:w-1/2">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Card className="overflow-hidden border-white/[0.06] bg-slate-900/70 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            <div className="h-[3px] w-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400" />
            <CardContent className="p-8">
              {/* mobile brand */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-lg shadow-cyan-400/25">
                  <Bot className="h-4 w-4 text-slate-950" />
                </div>
                <span className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">GhostFX</span>
              </div>

              {/* header */}
              <motion.div className="mb-8" layout="position">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={authMode}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="mb-1 text-2xl font-semibold text-white">
                      {authMode === 'login' ? <>Welcome back</> : <>Create your account</>}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {authMode === 'login'
                        ? 'Sign in to access your trading dashboard.'
                        : 'Start with a free paper-trading account.'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* tab toggle */}
              <div className="mb-7 flex rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
                {(['login', 'register'] as AuthMode[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setAuthMode(tab)}
                    className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      authMode === tab ? 'text-slate-950' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {authMode === tab && (
                      <motion.span
                        layoutId="auth-tab-bg"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {tab === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      {tab === 'login' ? 'Sign in' : 'Register'}
                    </span>
                  </button>
                ))}
              </div>

              {/* form */}
              <form className="space-y-4" onSubmit={onSubmit}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={authMode}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {authMode === 'register' && (
                      <FieldGroup icon={User}>
                        <FieldInput
                          value={form.full_name}
                          onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                          placeholder="Full name"
                          autoComplete="name"
                          required
                        />
                      </FieldGroup>
                    )}

                    <FieldGroup icon={Mail}>
                      <FieldInput
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="Email address"
                        type="email"
                        autoComplete="email"
                        required
                      />
                    </FieldGroup>

                    <FieldGroup icon={LockKeyhole}>
                      <FieldInput
                        value={form.password}
                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                        placeholder="Password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                        minLength={authMode === 'register' ? 8 : 1}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="flex items-center justify-center pr-4 text-slate-500 transition-colors hover:text-slate-300"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </FieldGroup>

                    {authMode === 'register' && (
                      <FieldGroup icon={Sparkles}>
                        <FieldSelect value={mode} onChange={(e) => setMode(e.target.value)}>
                          <option value="beginner">Beginner — simplified guidance</option>
                          <option value="intermediate">Intermediate — balanced insights</option>
                          <option value="advanced">Advanced — full control surfaces</option>
                        </FieldSelect>
                      </FieldGroup>
                    )}
                  </motion.div>
                </AnimatePresence>

                {authMutation.isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                  >
                    {getErrorMessage(authMutation.error)}
                  </motion.div>
                )}

                <Button
                  className="group relative w-full gap-2 overflow-hidden py-3"
                  type="submit"
                  disabled={authMutation.isPending}
                >
                  {authMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="inline-block h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      Starting session…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {authMode === 'login' ? 'Sign in' : 'Create account'}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  )}
                </Button>
              </form>

              {/* quick demo */}
              {authMode === 'login' && (
                <motion.div
                  className="mt-5 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    type="button"
                    onClick={fillDemo}
                    className="group text-xs text-slate-500 transition-colors hover:text-cyan-300"
                  >
                    <span className="mr-1 inline-block transition-transform group-hover:scale-110">👤</span>
                    Use demo credentials
                  </button>
                </motion.div>
              )}

              {/* footer */}
              <motion.p
                className="mt-6 text-center text-xs text-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {authMode === 'login' ? (
                  <>
                    No account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="font-medium text-cyan-400 transition-colors hover:text-cyan-300"
                    >
                      Register free
                    </button>
                  </>
                ) : (
                  <>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="font-medium text-cyan-400 transition-colors hover:text-cyan-300"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
