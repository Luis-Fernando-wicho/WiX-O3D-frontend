import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import WiXLOGO from "../../public/LOGO-WiX-O-BYN.svg";
import COPYLOGO from "../../public/copy.svg";

const API_URL = "http://localhost:3000/api/codes";

const AdminDashboard = () => {
  const [pedidos, setPedidos] = useState([]);

  // Guarda un arreglo con los códigos de los pedidos que están abiertos
  const [pedidosExpandidos, setPedidosExpandidos] = useState([]);

  // 1. CARGAR PEDIDOS DESDE LA BASE DE DATOS AL ABRIR LA PÁGINA
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setPedidos(Array.isArray(data) ? data : data.data || []);
      })
      .catch((err) =>
        console.error("Error al cargar pedidos de MongoDB:", err),
      );
  }, []);

  // generar el código único
  const generarCodigo = () => {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, "0");
    const hora = String(ahora.getHours()).padStart(2, "0");
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");

    const abecedario = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letra1 = abecedario.charAt(
      Math.floor(Math.random() * abecedario.length),
    );
    const letra2 = abecedario.charAt(
      Math.floor(Math.random() * abecedario.length),
    );

    return `WX${dia}${hora}${mes}${letra1}${letra2}`;
  };

  // CREAR Y GUARDAR NUEVO PEDIDO EN BLANCO EN MONGO
  const agregarPedido = () => {
    const nuevoId = generarCodigo();

    fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: nuevoId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al generar en el servidor");
        return res.json();
      })
      .then((resData) => {
        const pedidoGuardado = resData.data || resData;
        setPedidos([
          pedidoGuardado,
          ...pedidos,
        ]); /* guarda el nuevo pedido antes de los pedidos anteriores */

        /* Hace que el nuevo pedido aparezca expandido automáticamente */
        setPedidosExpandidos((prev) => [...prev, nuevoId]);
      })
      .catch((err) =>
        console.error("Error al guardar código en MongoDB:", err),
      );
  };

  //  ELIMINAR UN PEDIDO POR SU CÓDIGO DE LA BASE DE DATOS
  const borrarPedido = (codeABorrar) => {
    fetch(`${API_URL}/${codeABorrar}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo eliminar en el servidor");
        setPedidos(
          pedidos.filter(
            (pedido) => (pedido.code || pedido.id) !== codeABorrar,
          ),
        );

        setPedidosExpandidos((prev) => prev.filter((c) => c !== codeABorrar));
      })
      .catch((err) => console.error("Error al eliminar de MongoDB:", err));
  };

  // ACTUALIZAR EL CHECKBOX DE ENVIADO
  const actualizarDatoPedido = (code, campo, valor) => {
    if (campo === "enviado") {
      fetch(`${API_URL}/enviado/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enviado: valor }),
      }).catch((err) =>
        console.error("Error al actualizar estado de envío:", err),
      );
    }

    setPedidos(
      pedidos.map((pedido) => {
        const pedidoCode = pedido.code || pedido.id;
        return pedidoCode === code ? { ...pedido, [campo]: valor } : pedido;
      }),
    );
  };

  // FUNCIÓN PARA COPIAR AL PORTAPAPELES
  const copiarAlPortapapeles = (texto) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    console.log(`Copiado: ${texto}`);
  };

  // FUNCIÓN Alterna el estado abierto/cerrado de una tarjeta de pedido
  const togglePedido = (code) => {
    setPedidosExpandidos((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  return (
    <div className="AdminDashboard">
      <button onClick={agregarPedido} className="AdminDashboard__add-order">
        <img src={WiXLOGO} alt="" title="Haz clic agregar pedido" />
      </button>

      <div className="AdminDashboard__orders">
        {pedidos.map((pedido) => {
          const currentCode = pedido.code || pedido.id;

          const isExpanded = pedidosExpandidos.includes(currentCode);

          return (
            <div key={pedido._id || currentCode} className="order">
              <h3
                className="order__header-toggle"
                title="Haz clic para expandir o contraer"
              >
                CÓDIGO: <span className="order__code">{currentCode}</span>
                <button
                  className="order__copy-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // Evita que se cierre/abra la tarjeta al hacer clic en copiar
                    copiarAlPortapapeles(currentCode);
                  }}
                  title="Copiar código"
                >
                  <img src={COPYLOGO} alt="" />
                </button>
                <span
                  onClick={() => togglePedido(currentCode)}
                  className={`order__arrow ${isExpanded ? "order__arrow--open" : ""}`}
                >
                  ▼
                </span>
              </h3>

              {isExpanded && (
                <div className="order__form-animation">
                  <div className="order__form">
                    <div className="form-group__admin">
                      <label htmlFor="calle">Calle y número</label>
                      <input
                        type="text"
                        value={pedido.calleNumero || ""}
                        onClick={() => copiarAlPortapapeles(pedido.calleNumero)}
                        title="Haz clic para copiar"
                        readOnly
                      />
                    </div>

                    <div className="form-group__admin">
                      <label htmlFor="num-interior">Número interior</label>
                      <input
                        type="text"
                        value={pedido.numeroInterior || ""}
                        onClick={() =>
                          copiarAlPortapapeles(pedido.numeroInterior)
                        }
                        title="Haz clic para copiar"
                        readOnly
                      />
                    </div>

                    <div className="form-group__admin">
                      <label htmlFor="cp">Código postal</label>
                      <input
                        type="text"
                        value={pedido.codigoPostal || ""}
                        onClick={() =>
                          copiarAlPortapapeles(pedido.codigoPostal)
                        }
                        title="Haz clic para copiar"
                        readOnly
                      />
                    </div>

                    <div className="form-group__admin">
                      <label htmlFor="colonia">Colonia</label>
                      <input
                        type="text"
                        value={pedido.colonia || ""}
                        onClick={() => copiarAlPortapapeles(pedido.colonia)}
                        title="Haz clic para copiar"
                        readOnly
                      />
                    </div>

                    <div className="form-group__admin">
                      <label htmlFor="ciudad">Ciudad</label>
                      <input
                        type="text"
                        value={pedido.ciudad || ""}
                        onClick={() => copiarAlPortapapeles(pedido.ciudad)}
                        title="Haz clic para copiar"
                        readOnly
                      />
                    </div>

                    <div className="form-group__admin">
                      <label htmlFor="estado">Estado</label>
                      <input
                        type="text"
                        value={pedido.estado || ""}
                        onClick={() => copiarAlPortapapeles(pedido.estado)}
                        title="Haz clic para copiar"
                        readOnly
                      />
                    </div>

                    <div className="form-group__admin">
                      <label htmlFor="referencia">Referencia</label>
                      <input
                        type="text"
                        value={pedido.referencia || ""}
                        onClick={() => copiarAlPortapapeles(pedido.referencia)}
                        title="Haz clic para copiar"
                        readOnly
                      />
                    </div>

                    <div className="form-group__admin">
                      <label htmlFor="nombre">Nombre completo</label>
                      <input
                        type="text"
                        value={pedido.nombreCompleto || ""}
                        onClick={() =>
                          copiarAlPortapapeles(pedido.nombreCompleto)
                        }
                        title="Haz clic para copiar"
                        readOnly
                      />
                    </div>

                    <div className="form-group__admin">
                      <label htmlFor="telefono">Teléfono</label>
                      <input
                        type="tel"
                        value={pedido.telefono || ""}
                        onClick={() => copiarAlPortapapeles(pedido.telefono)}
                        title="Haz clic para copiar"
                        readOnly
                      />
                    </div>

                    <div className="form-group__admin">
                      <label htmlFor="correo">Correo electrónico</label>
                      <input
                        type="email"
                        value={pedido.correo || ""}
                        onClick={() => copiarAlPortapapeles(pedido.correo)}
                        title="Haz clic para copiar"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="order__buttons">
                    <label>
                      <input
                        type="checkbox"
                        checked={pedido.enviado || false}
                        onChange={(e) =>
                          actualizarDatoPedido(
                            currentCode,
                            "enviado",
                            e.target.checked,
                          )
                        }
                      />
                      Enviado
                    </label>

                    <button onClick={() => borrarPedido(currentCode)}>
                      Borrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {pedidos.length === 0 && (
          <p style={{ color: "#ffffff", fontStyle: "italic" }}>
            No hay pedidos activos en MongoDB. Haz clic en "WiX-O" para
            comenzar.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
