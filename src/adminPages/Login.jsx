import { useState } from "react";
import WiXLOGO from "../../public/LOGO-WiX-O-BYN.svg";

import "./Login.css";

const Login = () => {
  // 1. Unificamos el estado. Ya no necesitas variables sueltas para user y password.
  const [formData, setFormData] = useState({
    email: "", // Cambié 'user' a 'email' para que coincida con el 'name' de tu input
    password: "",
  });

  // 2. Un solo manejador de cambios que funciona para ambos inputs sin forzar mayúsculas.
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Esto toma el valor exacto que tecleas (mayúsculas, minúsculas, símbolos) y lo guarda
    setFormData({ ...formData, [name]: value });
  };

  // 3. Validación simplificada para saber si habilitar el botón
  const todosLosCamposLlenos =
    formData.email.trim() !== "" && formData.password.trim() !== "";

  return (
    <div className="login">
      <img src={WiXLOGO} alt="Logo" className="login__logo" />
      <p className="login__welcome">Inicia sesión</p>
      <form className="login__form">
        <div className="login__form-group">
          {/* Ojo aquí: el htmlFor debe coincidir con el id del input */}
          <label htmlFor="email">Usuario</label>
          <input
            className="login__form-input"
            id="email"
            name="email" // Este name debe coincidir con la llave en tu estado formData
            type="email"
            required
            value={formData.email} // Ahora sí está bien conectado
            onChange={handleChange}
          />
        </div>

        <div className="login__form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            className="login__form-input"
            id="password"
            name="password" // Coincide con formData.password
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
        </div>

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
