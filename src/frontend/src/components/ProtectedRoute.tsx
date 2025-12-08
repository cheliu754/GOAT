import { useAuth } from "../AuthContext";
import EmptyDashboard from "./EmptyDashboard";

interface ProtectedRouteProps {
  children: React.ReactNode;
  showEmptyState?: boolean;
}

export default function ProtectedRoute({ children, showEmptyState = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-3xl mb-2">🎓</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showEmptyState) {
      return <EmptyDashboard />;
    }
    // For UpdateModal and other routes, we still want to redirect
    return null;
  }

  return <>{children}</>;
}