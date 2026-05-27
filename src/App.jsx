import { Routes, Route } from "react-router-dom";

import Header from "./header/header.jsx";

import CodeVerification from "./pages/CodeVerification.jsx";
import AddressForm from "./pages/AddressForm.jsx";

import AdminDashboard from "./pages/adminPages/AdminDashboard.jsx";

import PageNotFound from "./pages/PageNotFound.jsx";

import "./App.css";

function App() {
  return (
    <>
      <div className="page">
        <Header />
        <Routes>
          <Route path="*" element={<PageNotFound />} />
          <Route path="/" element={<CodeVerification />} />
          <Route path="/AddressForm" element={<AddressForm />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
