import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAuthSession } from '../../utils/authSession';
import { Skeleton } from '../ui/Skeleton';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-4">
        <Skeleton className="h-24 w-full max-w-sm" />
      </main>
    );
  }

  // The context drives normal auth state, while this direct sessionStorage check
  // prevents protected content from rendering if the tab-scoped token was removed.
  return isAuthenticated && getAuthSession() ? <Outlet /> : <Navigate to="/login" replace />;
}
