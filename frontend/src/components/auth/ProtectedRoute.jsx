import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
