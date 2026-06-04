import { useState } from "react"; // <-- Asegúrate de importar useState
import { Routes, Route } from "react-router-dom";
// ... tus demás importaciones (Header, Login, AdminDashboard, etc.) ...

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
  // Creamos un estado dinámico iniciado con la validación del token
  const [isAdmin, setIsAdmin] = useState(checkAuth());

  // Función para avisar a App que el usuario ya se autenticó
  const handleLoginSuccess = () => {
    setIsAdmin(true);
  };

  return (
    <>
      <div className="page">
        <Header />
        <Routes>
          <Route path="*" element={<PageNotFound />} />
          <Route path="/" element={<CodeVerification />} />
          <Route path="/AddressForm" element={<AddressForm />} />

          {/* PASAMOS LA FUNCIÓN AL LOGIN */}
          <Route
            path="/Login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />

          {/* PROTECTED ROUTE EVALÚA EL ESTADO DINÁMICO */}
          <Route element={<ProtectedRoute isAllowed={isAdmin} />}>
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
