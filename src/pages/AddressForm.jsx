import { useState } from "react";
import "../../blocks/AddressForm.css";
import WiXLOGO from "../../public/LOGO-WiX-O-BYN.svg";

import { useNavigate } from "react-router-dom";

function AddressForm() {
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

  // 2. Corregimos la función para que actualice el estado correctamente
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const activeCode = localStorage.getItem("verifiedCode");

    if (!activeCode) {
      alert("Por favor, regresa y verifica tu código primero.");
      return;
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
        alert(
          "¡Dirección guardada con éxito! Tu pedido WiX-O está en proceso.",
        );
        localStorage.removeItem("verifiedCode");

        navigate("/");
      })
      .catch((err) => alert(err.message));
  };

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
          <div className="form-group">
            <label htmlFor="num-interior">Número interior</label>
            <input
              type="text"
              id="num-interior"
              name="numeroInterior"
              value={formData.numeroInterior}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cp">Código postal</label>
            <input
              type="text"
              id="cp"
              name="codigoPostal"
              value={formData.codigoPostal}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="colonia">Colonia</label>
            <input
              type="text"
              id="colonia"
              name="colonia"
              value={formData.colonia}
              onChange={handleChange}
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
            />
          </div>
          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <input
              type="text"
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
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

          <div className="form-group">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="address__button">
            SEND
          </button>
        </form>
      </section>
    </>
  );
}
export default AddressForm;
