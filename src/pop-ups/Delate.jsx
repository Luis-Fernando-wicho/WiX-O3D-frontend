import "./Delate.css";
import TRASH from "../../public/trash.svg";

function Dealate({ isOpen, type, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="popup">
        <h2 className="popup__title">Seguro que lo quieres eliminar?</h2>
        <img src={TRASH} alt={type} className="popup__icon" />
      </div>

      <button className="popup__close" onClick={onClose}>
        <img src={ERROR} alt="Cerrar" />
      </button>
    </div>
  );
}

export default Dealate;
