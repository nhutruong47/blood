import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { router } from './routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { installAuthRefresh } from '@/shared/api/axios-instance';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Reconnect on regaining connectivity.
      refetchOnReconnect: true,
      // Don't refetch on tab focus — the user navigates explicitly.
      refetchOnWindowFocus: false,
      // 2 minutes is a sensible "this data is fresh enough to use".
      staleTime: 1000 * 60 * 2,
      // 15 minutes in the in-memory cache before GC kicks in.
      gcTime: 1000 * 60 * 15,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Install the 401 → refresh-token interceptor once at startup.
installAuthRefresh(queryClient);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;