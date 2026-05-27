import "../../blocks/AddressForm.css";
import WiXLOGO from "../../public/LOGO-WiX-O-BYN.svg";

function AddressForm() {
  return (
    <>
      <section className="address">
        <img src={WiXLOGO} alt="" className="address__logo" />
        <form className="address-form">
          <div className="form-group">
            <label htmlFor="calle">Calle y número</label>
            <input type="text" id="calle" required />
          </div>

          <div className="form-group">
            <label htmlFor="num-interior">Número interior</label>
            <input type="text" id="num-interior" />
          </div>

          <div className="form-group">
            <label htmlFor="cp">Código postal</label>
            <input type="text" id="cp" required />
          </div>

          <div className="form-group">
            <label htmlFor="colonia">Colonia</label>
            <input type="text" id="colonia" required />
          </div>

          <div className="form-group">
            <label htmlFor="ciudad">Ciudad</label>
            <input type="text" id="ciudad" required />
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <input type="text" id="estado" required />
          </div>

          <div className="form-group">
            <label htmlFor="referencia">Referencia</label>
            <input type="text" id="referencia" />
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre completo</label>
            <input type="text" id="nombre" required />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input type="tel" id="telefono" placeholder="Teléfono" />
          </div>

          <div className="form-group">
            <label htmlFor="correo">Correo electrónico</label>
            <input type="email" id="correo" />
          </div>

          <button className="address__button">SEND</button>
        </form>
      </section>
    </>
  );
}
export default AddressForm;
