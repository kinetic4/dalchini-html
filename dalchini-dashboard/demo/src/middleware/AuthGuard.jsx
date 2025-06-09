// Import Dependencies
import { Navigate, useLocation, useOutlet } from "react-router";
import { authService } from "services/authService";

// Local Imports


// ----------------------------------------------------------------------

export default function AuthGuard() {
  const outlet = useOutlet();
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Clear any remaining auth data
    authService.logout();
    // Redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{outlet}</>;
}
