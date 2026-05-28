import React, { useState, useEffect } from "react";
import "../../../blocks/AdminDashboard.css";
import WiXLOGO from "../../../public/LOGO-WiX-O-BYN.svg";

// Definimos la URL de tu backend local
const API_URL = "http://localhost:3000/api/codes";

const AdminDashboard = () => {
  const [pedidos, setPedidos] = useState([]);

  // 1. CARGAR PEDIDOS DESDE LA BASE DE DATOS AL ABRIR LA PÁGINA
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        // Mongoose nos devuelve el arreglo directamente o dentro de un objeto
        setPedidos(Array.isArray(data) ? data : data.data || []);
      })
      .catch((err) =>
        console.error("Error al cargar pedidos de MongoDB:", err),
      );
  }, []);

  // Función para generar el código único
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

  // 2. CREAR Y GUARDAR NUEVO PEDIDO EN BLANCO EN MONGO
  const agregarPedido = () => {
    const nuevoId = generarCodigo();

    fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: nuevoId }), // Mandamos el código generado al backend
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al generar en el servidor");
        return res.json();
      })
      .then((resData) => {
        // Guardamos en el estado el objeto real creado por la base de datos
        // Usamos resData.data porque usualmente el controlador envuelve la respuesta ahí
        const pedidoGuardado = resData.data || resData;
        setPedidos([pedidoGuardado, ...pedidos]);
      })
      .catch((err) =>
        console.error("Error al guardar código en MongoDB:", err),
      );
  };

  // 3. ELIMINAR UN PEDIDO POR SU CÓDIGO DE LA BASE DE DATOS
  const borrarPedido = (codeABorrar) => {
    fetch(`${API_URL}/${codeABorrar}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo eliminar en el servidor");
        // Filtramos el estado local para quitarlo de la pantalla inmediatamente
        setPedidos(
          pedidos.filter(
            (pedido) => (pedido.code || pedido.id) !== codeABorrar,
          ),
        );
      })
      .catch((err) => console.error("Error al eliminar de MongoDB:", err));
  };

  // 4. ACTUALIZAR INPUTS O EL CHECKBOX DE ENVIADO
  const actualizarDatoPedido = (code, campo, valor) => {
    // Si lo que cambia es el checkbox de enviado, disparamos la petición PATCH al backend
    if (campo === "enviado") {
      fetch(`${API_URL}/enviado/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enviado: valor }),
      }).catch((err) =>
        console.error("Error al actualizar estado de envío:", err),
      );
    }

    // Actualizamos visualmente el estado en React para que no se sienta lento
    setPedidos(
      pedidos.map((pedido) => {
        const pedidoCode = pedido.code || pedido.id;
        return pedidoCode === code ? { ...pedido, [campo]: valor } : pedido;
      }),
    );
  };

  return (
    <div className="AdminDashboard">
      <button onClick={agregarPedido} className="AdminDashboard__add-order">
        <img src={WiXLOGO} alt="" className="address__logo" />
      </button>

      <div className="AdminDashboard__orders">
        {pedidos.map((pedido) => {
          // MongoDB guarda el identificador en 'pedido.code'
          const currentCode = pedido.code || pedido.id;

          return (
            <div key={pedido._id || currentCode} className="order">
              <h3>
                Código de Pedido:{" "}
                <span className="order__code">{currentCode}</span>
              </h3>

              {/* Formulario de Dirección y Datos */}
              <div className="order__form">
                <div className="form-group">
                  <label htmlFor="calle">Calle y número</label>
                  <input
                    type="text"
                    value={pedido.calleNumero || ""}
                    onChange={(e) =>
                      actualizarDatoPedido(
                        currentCode,
                        "calleNumero",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="num-interior">Número interior</label>
                  <input
                    type="text"
                    value={pedido.numeroInterior || ""}
                    onChange={(e) =>
                      actualizarDatoPedido(
                        currentCode,
                        "numeroInterior",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cp">Código postal</label>
                  <input
                    type="text"
                    value={pedido.codigoPostal || ""}
                    onChange={(e) =>
                      actualizarDatoPedido(
                        currentCode,
                        "codigoPostal",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="colonia">Colonia</label>
                  <input
                    type="text"
                    value={pedido.colonia || ""}
                    onChange={(e) =>
                      actualizarDatoPedido(
                        currentCode,
                        "colonia",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ciudad">Ciudad</label>
                  <input
                    type="text"
                    value={pedido.ciudad || ""}
                    onChange={(e) =>
                      actualizarDatoPedido(
                        currentCode,
                        "ciudad",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estado">Estado</label>
                  <input
                    type="text"
                    value={pedido.estado || ""}
                    onChange={(e) =>
                      actualizarDatoPedido(
                        currentCode,
                        "estado",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="referencia">Referencia</label>
                  <input
                    type="text"
                    value={pedido.referencia || ""}
                    onChange={(e) =>
                      actualizarDatoPedido(
                        currentCode,
                        "referencia",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nombre">Nombre completo</label>
                  <input
                    type="text"
                    value={pedido.nombreCompleto || ""}
                    onChange={(e) =>
                      actualizarDatoPedido(
                        currentCode,
                        "nombreCompleto",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    value={pedido.telefono || ""}
                    onChange={(e) =>
                      actualizarDatoPedido(
                        currentCode,
                        "telefono",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="correo">Correo electrónico</label>
                  <input
                    type="email"
                    value={pedido.correo || ""}
                    onChange={(e) =>
                      actualizarDatoPedido(
                        currentCode,
                        "correo",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>

              {/* Controles finales: Enviado y Borrar */}
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
