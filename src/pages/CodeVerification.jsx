import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CodeVerification.css";
import WiXLOGO from "../../public/LOGO-WiX-O-BYN.svg";
import Popup from "../pop-ups/Popup.jsx"; // Importamos el componente Popup

function CodeVerification() {
  const [code, setCode] = useState("");

  const [popupState, setPopupState] = useState({
    isOpen: false,
    type: "",
    message: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCode(e.target.value.toUpperCase());
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
        localStorage.setItem("verifiedCode", code);

        // Mostramos el popup de éxito
        setPopupState({
          isOpen: true,
          type: "success",
          message: "¡Código verificado con éxito!",
        });

        setTimeout(() => {
          navigate("/AddressForm");
        }, 5000);
      })
      .catch((err) => {
        setPopupState({
          isOpen: true,
          type: "error",
          message: err.message,
        });
      });
  };

  // Función para manejar el cierre manual del popup
  const handleClosePopup = () => {
    setPopupState({ ...popupState, isOpen: false });

    // Si el usuario cierra el popup manualmente y era de éxito, lo redirigimos
    if (popupState.type === "success") {
      navigate("/AddressForm");
    }
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
      </section>

      {/* Renderizamos el Popup y le pasamos los valores del estado */}
      <Popup
        isOpen={popupState.isOpen}
        type={popupState.type}
        message={popupState.message}
        onClose={handleClosePopup}
      />
    </>
  );
}

export default CodeVerification;
