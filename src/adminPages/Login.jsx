import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WiXLOGO from "../../public/LOGO-WiX-O-BYN.svg";

import "./Login.css";

const AUTH_API_URL = "https://wix-o3d-backend.onrender.com/api/auth/login";

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user: "",
    password: "",
  });

  // Estado para mostrar un error si se equivocan de credenciales
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    fetch(AUTH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: formData.user,
        password: formData.password,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Usuario o contraseña incorrectos.");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          localStorage.setItem("adminToken", data.token);

          if (onLoginSuccess) onLoginSuccess();
          navigate("/AdminDashboard");
        } else {
          setError(data.message || "Error al iniciar sesión.");
        }
      })
      .catch((err) => {
        setError(err.message || "Error al conectar con el servidor.");
      });
  };

  const todosLosCamposLlenos =
    formData.user.trim() !== "" && formData.password.trim() !== "";

  return (
    <div className="login">
      <img src={WiXLOGO} alt="Logo" className="login__logo" />
      <p className="login__welcome">Inicia sesión</p>

      {/* Agregamos el evento onSubmit al form */}
      <form className="login__form" onSubmit={handleLogin}>
        <div className="login__form-group">
          <label htmlFor="user">Usuario</label>
          {/* Cambiamos type="email" a type="text" porque tu usuario es "wixo3d" (no es un correo) */}
          <input
            className="login__form-input"
            id="user"
            name="user"
            type="text"
            required
            value={formData.user}
            onChange={handleChange}
          />
        </div>

        <div className="login__form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            className="login__form-input"
            id="password"
            name="password"
            type="text"
            required
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        {/* Mensaje de error si se equivocan */}
        {error && (
          <p style={{ color: "#ff4d4d", fontSize: "14px", marginTop: "0" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="login__submit"
          disabled={!todosLosCamposLlenos}
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
