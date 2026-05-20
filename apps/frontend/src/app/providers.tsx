import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { LoadingPanel } from '@/components/common/loading-panel';
import { fetchMe } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';

function AuthBootstrap({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const setBootstrapped = useAuthStore((state) => state.setBootstrapped);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!token) {
        setBootstrapped(true);
        return;
      }
      try {
        const user = await fetchMe();
        if (active) {
          setUser(user);
        }
      } catch {
        if (active) {
          clearSession();
        }
      } finally {
        if (active) {
          setBootstrapped(true);
        }
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [clearSession, setBootstrapped, setUser, token]);

  if (!bootstrapped) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <LoadingPanel />
      </main>
    );
  }

  return children;
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 15_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap>{children}</AuthBootstrap>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
