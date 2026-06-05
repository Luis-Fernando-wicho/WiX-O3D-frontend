import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WiXLOGO from "../../public/LOGO-WiX-O-BYN.svg";
import EYE from "../../public/eye.svg";
import EYEOFF from "../../public/eye-off.svg";

import "./Login.css";

const AUTH_API_URL = "https://wix-o3d-backend.onrender.com/api/auth/login";

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [verPassword, setVerPassword] = useState(false);

  const [formData, setFormData] = useState({
    user: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

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
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const todosLosCamposLlenos =
    formData.user.trim() !== "" && formData.password.trim() !== "";

  return (
    <div className="login">
      <img src={WiXLOGO} alt="Logo" className="login__logo" />
      <p className="login__welcome">Inicia sesión</p>

      <form className="login__form" onSubmit={handleLogin}>
        <div className="login__form-group">
          <label htmlFor="user">Usuario</label>
          <input
            className="login__form-input"
            id="user"
            name="user"
            type="text"
            required
            value={formData.user}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="login__form-group">
          <label htmlFor="password">Contraseña</label>

          <div className="login__password-wrapper">
            <input
              className="login__form-input login__form-input--password"
              id="password"
              name="password"
              type={verPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button" /* Evita que envíe el formulario */
              className="login__password-toggle"
              onClick={() => setVerPassword(!verPassword)}
              disabled={isLoading}
              title={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {/* CORRECCIÓN: Renderizamos como una imagen usando la variable en el src */}
              <img
                src={verPassword ? EYEOFF : EYE}
                alt="Icono ojo"
                className="login__password-toggle-icon"
              />
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: "#ff4d4d", fontSize: "14px", marginTop: "0" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="login__submit"
          disabled={!todosLosCamposLlenos || isLoading}
        >
          {isLoading ? <div className="spinner"></div> : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
};

export default Login;
