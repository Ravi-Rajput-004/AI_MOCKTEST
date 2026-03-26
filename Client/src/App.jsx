import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useUserStore } from './store/userStore.js';
import { useMe } from './queries/auth.queries.js';
import Navbar from './components/common/Navbar.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import Loader from './components/common/Loader.jsx';
import { registerSW } from './lib/registerSW.js';

registerSW();

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Setup = lazy(() => import('./pages/Setup.jsx'));
const InterviewRoom = lazy(() => import('./pages/InterviewRoom.jsx'));
const Results = lazy(() => import('./pages/Results.jsx'));
const Pricing = lazy(() => import('./pages/Pricing.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useUserStore();
  if (isLoading) return <Loader fullScreen text="Checking auth..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useUserStore();
  if (isLoading) return <Loader fullScreen text="Checking auth..." />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useUserStore();
  if (isLoading) return <Loader fullScreen text="Checking auth..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function AuthInitializer({ children }) {
  const { data: user, isLoading, isError } = useMe();
  const { setUser, clearUser, setLoading } = useUserStore();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        setUser(user); // Keep existing token if already set by interceptor
      } else if (isError) {
        clearUser();
      }
      setLoading(false);
    }
  }, [isLoading, user, isError, setUser, clearUser, setLoading]);

  if (isLoading) return <Loader fullScreen text="Initializing..." />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loader fullScreen />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/setup" element={<ProtectedRoute><Setup /></ProtectedRoute>} />
          <Route path="/interview/:id" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
          <Route path="/results/:sessionId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthInitializer>
            <Navbar />
            <AnimatedRoutes />
          </AuthInitializer>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A2E',
              color: '#F1F5F9',
              border: '1px solid #2D2D44',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
