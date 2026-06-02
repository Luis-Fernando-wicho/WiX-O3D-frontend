// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ isAllowed, redirectTo = "/Login" }) => {
  if (!isAllowed) {
    // Si no está permitido (no hay token o caducó), lo manda al Login
    return <Navigate to={redirectTo} replace />;
  }

  // Si está permitido, renderiza las rutas hijas (en este caso, AdminDashboard)
  return <Outlet />;
};

export default ProtectedRoute;
