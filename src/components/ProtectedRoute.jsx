import { Navigate, Outlet } from "react-router-dom";

// isAllowed: un valor booleano que nos dirá si es admin o no
// redirectPath: a dónde lo mandamos si no tiene permiso (por defecto al inicio)
function ProtectedRoute({ isAllowed, redirectPath = "/" }) {
  if (!isAllowed) {
    // Si no está permitido, lo redirigimos y reemplazamos el historial
    return <Navigate to={redirectPath} replace />;
  }

  // Si está permitido, renderizamos la ruta hija (el AdminDashboard)
  return <Outlet />;
}

export default ProtectedRoute;
