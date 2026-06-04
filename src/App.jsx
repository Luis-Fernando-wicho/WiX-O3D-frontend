import { useState } from "react";
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

    if (now < tokenData.expiry) {
      return true;
    } else {
      localStorage.removeItem("adminToken");
      return false;
    }
  } catch (error) {
    localStorage.removeItem("adminToken");
    return false;
  }
};

function App() {
  // 1. Estado dinámico de autenticación
  const [isAdmin, setIsAdmin] = useState(checkAuth());

  const handleLoginSuccess = () => {
    setIsAdmin(true);
  };

  return (
    <>
      <div className="page">
        <Header />
        <Routes>
          {/* 2. Las rutas fijas van PRIMERO */}
          <Route path="/" element={<CodeVerification />} />
          <Route path="/AddressForm" element={<AddressForm />} />

          {/* Pasamos la función encargada de actualizar el estado al Login */}
          <Route
            path="/Login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute isAllowed={isAdmin} />}>
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
          </Route>

          {/* 3. El comodín de error '*' debe ir SIEMPRE al final de todo */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
