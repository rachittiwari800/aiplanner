import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { LoginPage } from './pages/LoginPage';
import { useUIStore } from './store/useUIStore';
import { useAuth } from './context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const MainContent: React.FC = () => {
  const { activeTab } = useUIStore();

  switch (activeTab) {
    case 'dashboard':
      return <DashboardPage />;
    default:
      return <WorkspacePage tab={activeTab} />;
  }
};

const AuthenticatedApp: React.FC = () => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">Loading your planner...</div>;
  }

  if (!user) return <LoginPage />;

  return (
    <AppLayout>
      <MainContent />
    </AppLayout>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
