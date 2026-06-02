import "./Popup.css";
import CHECK from "../../public/circle-check.svg";
import ERROR from "../../public/xbox-x.svg";

function Popup({ isOpen, type, message, onClose }) {
  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null;

  // Determinamos el ícono según el tipo de mensaje
  const icon = type === "success" ? CHECK : ERROR;

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="popup">
        <h2 className="popup__title">{message}</h2>
        <img src={icon} alt={type} className="popup__icon" />
      </div>

      <button className="popup__close" onClick={onClose}>
        <img src={ERROR} alt="Cerrar" />
      </button>
    </div>
  );
}

export default Popup;
