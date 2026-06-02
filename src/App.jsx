import { Routes, Route } from "react-router-dom";
import Header from "./header/header.jsx";

import CodeVerification from "./pages/CodeVerification.jsx";
import AddressForm from "./pages/AddressForm.jsx";

import Login from "./adminPages/Login.jsx";

import AdminDashboard from "./adminPages/AdminDashboard.jsx";

import PageNotFound from "./pages/PageNotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import "./App.css";

function App() {
  // AQUÍ ESTÁ LA LÓGICA DE AUTORIZACIÓN
  // En un sistema real, esto vendría de un Contexto, un estado global,
  // o verificando si existe un token JWT en el localStorage.
  // Por ahora, simularemos que leemos un token del localStorage.
  const hasAdminToken = localStorage.getItem("adminToken");
  const isAdmin = Boolean(hasAdminToken); // Convierte a true si hay token, false si no

  return (
    <>
      <div className="page">
        <Header />
        <Routes>
          {/* Rutas Públicas */}
          <Route path="*" element={<PageNotFound />} />
          <Route path="/" element={<CodeVerification />} />
          <Route path="/AddressForm" element={<AddressForm />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute isAllowed={isAdmin} />}></Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
