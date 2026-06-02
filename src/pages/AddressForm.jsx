import { useState } from "react";
import "./AddressForm.css";
import WiXLOGO from "../../public/LOGO-WiX-O-BYN.svg";
import Popup from "../pop-ups/Popup.jsx";

import { useNavigate } from "react-router-dom";

function AddressForm() {
  const navigate = useNavigate();

  const [popupState, setPopupState] = useState({
    isOpen: false,
    type: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    calleNumero: "",
    numeroInterior: "",
    codigoPostal: "",
    colonia: "",
    ciudad: "",
    estado: "",
    referencia: "",
    nombreCompleto: "",
    telefono: "",
    correo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "telefono" ||
      name === "codigoPostal" ||
      name === "numeroInterior"
    ) {
      const soloNumeros = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: soloNumeros });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const activeCode = localStorage.getItem("verifiedCode");

    if (!activeCode) {
      setPopupState({
        isOpen: true,
        type: "error",
        message: err.message,
      });
      setTimeout(() => {
        navigate("/");
      }, 5000);
    }

    fetch(`http://localhost:3000/api/codes/address/${activeCode}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al guardar la dirección");
        return res.json();
      })
      .then(() => {
        setPopupState({
          isOpen: true,
          type: "success",
          message:
            "¡Direccion guardada con exito, pronto te notificaremos sobre tu envio!",
        });

        localStorage.removeItem("verifiedCode");

        setTimeout(() => {
          navigate("/");
        }, 10000);
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
      navigate("/");
    }
  };

  const todosLosCamposLlenos = Object.keys(formData)
    .filter((clave) => clave !== "correo" && clave !== "numeroInterior")
    .every((clave) => formData[clave].trim() !== "");

  return (
    <>
      <section className="address">
        <img src={WiXLOGO} alt="" className="address__logo" />
        <form className="address-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="calle">Calle y número</label>
            <input
              type="text"
              id="calle"
              name="calleNumero"
              value={formData.calleNumero}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group form-group-right">
            <label htmlFor="num-interior">Número interior</label>

            <input
              type="tel"
              maxLength={10}
              id="num-interior"
              name="numeroInterior"
              value={formData.numeroInterior}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cp">Código postal</label>
            <input
              type="tel"
              maxLength={5}
              minLength={5}
              id="cp"
              name="codigoPostal"
              value={formData.codigoPostal}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group form-group-right">
            <label htmlFor="colonia">Colonia</label>
            <input
              type="text"
              id="colonia"
              name="colonia"
              value={formData.colonia}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="ciudad">Ciudad</label>
            <input
              type="text"
              id="ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group form-group-right">
            <label htmlFor="estado">Estado</label>
            <input
              type="text"
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="referencia">Referencia</label>
            <input
              type="text"
              id="referencia"
              name="referencia"
              value={formData.referencia}
              onChange={handleChange}
            />
          </div>
          <div className="form-group form-group-right">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              maxLength={10}
              minLength={10}
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group form-group-right">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="address__button"
            disabled={!todosLosCamposLlenos}
          >
            SEND
          </button>
        </form>
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
export default AddressForm;
