// Import Dependencies
import { Navigate, useOutlet } from "react-router";
import { authService } from "services/authService";

// ----------------------------------------------------------------------

export default function GhostGuard() {
  const outlet = useOutlet();
  const isAuthenticated = authService.isAuthenticated();

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/tables/orders-datatable-1" replace />;
  }

  // If not authenticated, show the login page
  return <>{outlet}</>;
}
