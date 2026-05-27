import { useState } from "react";

import "../../blocks/CodeVerification.css";
import WiXLOGO from "../../public/LOGO-WiX-O-BYN.svg";

function CodeVerification() {
  const [code, setCode] = useState("");

  const handleChange = (e) => {
    setCode(e.target.value.toUpperCase());
  };
  return (
    <>
      <section className="code">
        <img src={WiXLOGO} alt="" className="code__logo" />
        <h1 className="code__title">CÓDIGO</h1>
        <input
          type="text"
          value={code}
          onChange={handleChange}
          className="code__input" // Añadimos una clase para el CSS
        />
        <button className="code__button">SEND</button>
      </section>
    </>
  );
}
export default CodeVerification;
