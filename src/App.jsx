import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./header/header.jsx";

import CodeVerification from "./pages/CodeVerification.jsx";
import AddressForm from "./pages/AddressForm.jsx";

import Login from "./adminPages/Login.jsx";
import AdminDashboard from "./adminPages/AdminDashboard.jsx";
import Orders from "./adminPages/Orders.jsx";

import PageNotFound from "./pages/PageNotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import "./App.css";

const checkAuth = () => {
  const token = localStorage.getItem("adminToken");

  if (!token) return false;

  return true;
};

function App() {
  const [isAdmin, setIsAdmin] = useState(checkAuth());

  const handleLoginSuccess = () => {
    setIsAdmin(true);
  };

  return (
    <>
      <div className="page">
        <Header />
        <Routes>
          <Route path="/" element={<CodeVerification />} />
          <Route path="/AddressForm" element={<AddressForm />} />
          <Route path="/orders" element={<Orders />} />

          <Route
            path="/Login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />

          <Route element={<ProtectedRoute isAllowed={isAdmin} />}>
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
