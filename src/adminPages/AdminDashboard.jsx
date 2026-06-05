import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import WiXLOGO from "../../public/LOGO-WiX-O-BYN.svg";
import COPYLOGO from "../../public/copy.svg";
import Delate from "../pop-ups/Delate.jsx";
import TRASH from "../../public/trash.svg";

const API_URL = "https://wix-o3d-backend.onrender.com/api/codes";

const AdminDashboard = () => {
  const [pedidos, setPedidos] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // Ahora guardamos si está abierto y el código del pedido en la mira
  const [delateState, setDelateState] = useState({
    isOpen: false,
    code: null,
  });

  const [pedidosExpandidos, setPedidosExpandidos] = useState([]);

  // 1. CARGAR PEDIDOS DESDE LA BASE DE DATOS
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

  const agregarPedido = () => {
    const nuevoId = generarCodigo();

    setIsLoading(true);

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
        setPedidos([pedidoGuardado, ...pedidos]);
        setPedidosExpandidos((prev) => [...prev, nuevoId]);
      })
      .catch((err) => console.error("Error al guardar código en MongoDB:", err))

      .finally(() => {
        setIsLoading(false);
      });
  };

  // Esta función ahora solo se ejecuta cuando el usuario presiona "Sí" en el popup
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

  const copiarAlPortapapeles = (texto) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    console.log(`Copiado: ${texto}`);
  };

  const togglePedido = (code) => {
    setPedidosExpandidos((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  return (
    <div className="AdminDashboard">
      <button
        onClick={agregarPedido}
        className="AdminDashboard__add-order"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          <img
            src={WiXLOGO}
            alt="Logo WiX-O"
            title="Haz clic para agregar pedido"
          />
        )}
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
                    e.stopPropagation();
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
                    {/* ... (Tus inputs de dirección y contacto se mantienen exactamente igual) ... */}
                    <div className="form-group__admin">
                      <label>Calle y número</label>
                      <input
                        type="text"
                        value={pedido.calleNumero || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group__admin">
                      <label>Número interior</label>
                      <input
                        type="text"
                        value={pedido.numeroInterior || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group__admin">
                      <label>Código postal</label>
                      <input
                        type="text"
                        value={pedido.codigoPostal || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group__admin">
                      <label>Colonia</label>
                      <input
                        type="text"
                        value={pedido.colonia || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group__admin">
                      <label>Ciudad</label>
                      <input type="text" value={pedido.ciudad || ""} readOnly />
                    </div>
                    <div className="form-group__admin">
                      <label>Estado</label>
                      <input type="text" value={pedido.estado || ""} readOnly />
                    </div>
                    <div className="form-group__admin">
                      <label>Referencia</label>
                      <input
                        type="text"
                        value={pedido.referencia || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group__admin">
                      <label>Nombre completo</label>
                      <input
                        type="text"
                        value={pedido.nombreCompleto || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group__admin">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        value={pedido.telefono || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group__admin">
                      <label>Correo electrónico</label>
                      <input
                        type="email"
                        value={pedido.correo || ""}
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

                    {/* Al hacer clic aquí, solo abrimos el popup y guardamos el código */}
                    <button
                      className="buttons__delate"
                      onClick={() =>
                        setDelateState({ isOpen: true, code: currentCode })
                      }
                    >
                      <img src={TRASH} alt="Eliminar" />
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

      {/* Renderizado del Popup de confirmación */}
      <Delate
        isOpen={delateState.isOpen}
        onClose={() => setDelateState({ isOpen: false, code: null })}
        onConfirm={() => {
          borrarPedido(delateState.code); // Ejecuta el borrado real en Mongo y estado local
          setDelateState({ isOpen: false, code: null }); // Cierra el popup
        }}
      />
    </div>
  );
};

export default AdminDashboard;
