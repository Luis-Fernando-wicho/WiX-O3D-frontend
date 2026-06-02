import "./Delate.css";
import TRASH from "../../public/trash.svg";
import ERROR from "../../public/xbox-x.svg";

function Delate({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="backdrop-delate" onClick={onClose}>
      <div className="popup-delate" onClick={(e) => e.stopPropagation()}>
        <h2 className="popup-delate__title">
          ¿Seguro que lo quieres eliminar?
        </h2>
        <img src={TRASH} alt="Eliminar" className="popup-delate__icon" />

        <div className="popup-delate__actions">
          <button
            className="popup-delate__btn popup-delate__btn--confirm"
            onClick={onConfirm}
          >
            Sí
          </button>
          <button
            className="popup-delate__btn popup-delate__btn--cancel"
            onClick={onClose}
          >
            No
          </button>
        </div>
      </div>

      <button className="popup-delate__close" onClick={onClose}>
        <img src={ERROR} alt="Eliminar" />
      </button>
    </div>
  );
}

export default Delate;
