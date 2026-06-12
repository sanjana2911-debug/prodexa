/**
 * ProtectedRoute component restricts access to authenticated users only
 * Redirects to login page if user is not authenticated
 * Prevents redirect flash by only rendering spinner on initial load,
 * and returning null + Navigate for instant redirect
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Initial auth check is still running
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Not authenticated — redirect immediately without rendering children
  // Using replace prevents the protected page from appearing in browser history
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}