import { Routes, Route } from "react-router-dom";
import Header from "./header/header.jsx";

import CodeVerification from "./pages/CodeVerification.jsx";
import AddressForm from "./pages/AddressForm.jsx";

import Login from "./adminPages/Login.jsx";
import AdminDashboard from "./adminPages/AdminDashboard.jsx";

import PageNotFound from "./pages/PageNotFound.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

import "./App.css";

const checkAuth = () => {
  const tokenDataString = localStorage.getItem("adminToken");
  if (!tokenDataString) return false;

  try {
    const tokenData = JSON.parse(tokenDataString);
    const now = new Date().getTime();

    // Si la fecha actual es menor a la fecha de expiración, es válido
    if (now < tokenData.expiry) {
      return true;
    } else {
      // Si ya pasó 1 semana, borramos el token caducado
      localStorage.removeItem("adminToken");
      return false;
    }
  } catch (error) {
    // Si hay un error al leer el JSON, por seguridad borramos y denegamos
    localStorage.removeItem("adminToken");
    return false;
  }
};

function App() {
  // Evaluamos la autorización en cada render
  const isAdmin = checkAuth();

  return (
    <>
      <div className="page">
        <Header />
        <Routes>
          <Route path="*" element={<PageNotFound />} />
          <Route path="/" element={<CodeVerification />} />
          <Route path="/AddressForm" element={<AddressForm />} />
          <Route path="/Login" element={<Login />} />

          <Route element={<ProtectedRoute isAllowed={isAdmin} />}>
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
