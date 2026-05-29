import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../blocks/CodeVerification.css";
import WiXLOGO from "../../public/LOGO-WiX-O-BYN.svg";

function CodeVerification() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCode(e.target.value.toUpperCase());
    setError(""); // Limpia errores mientras escribe
  };

  const handleVerify = () => {
    if (!code) return;

    fetch(`http://localhost:3000/api/codes/verify/${code}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("El código ingresado no es válido o ya caducó.");
        }
        return res.json();
      })
      .then((data) => {
        alert("¡Código verificado con éxito! Procede a llenar tu dirección.");
        // Aquí puedes guardar el código en localStorage o redirigir al usuario al formulario
        localStorage.setItem("verifiedCode", code);
        // window.location.href = "/address"; (Si usas react-router)
        navigate("/AddressForm");
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <>
      <section className="code">
        <img src={WiXLOGO} alt="" className="code__logo" />
        <h1 className="code__title">CÓDIGO</h1>
        <input
          type="text"
          maxLength={10}
          minLength={10}
          value={code}
          onChange={handleChange}
          className="code__input"
        />
        <button
          onClick={handleVerify}
          className="code__button"
          disabled={code.trim() === ""}
        >
          SEND
        </button>
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </section>
    </>
  );
}
export default CodeVerification;
