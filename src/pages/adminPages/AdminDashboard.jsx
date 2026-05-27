import React, { useState } from "react";
import "../../../blocks/AdminDashboard.css";
import WiXLOGO from "../../../public/LOGO-WiX-O-BYN.svg";

const AdminDashboard = () => {
  const [pedidos, setPedidos] = useState([]);

  // Función para generar el código único
  const generarCodigo = () => {
    const ahora = new Date();
    // padStart asegura que siempre haya 2 dígitos (ej. '05' en lugar de '5')
    const dia = String(ahora.getDate()).padStart(2, "0");
    const hora = String(ahora.getHours()).padStart(2, "0");
    const mes = String(ahora.getMonth() + 1).padStart(2, "0"); // Los meses en JS empiezan en 0

    // Generar dos letras mayúsculas aleatorias
    const abecedario = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letra1 = abecedario.charAt(
      Math.floor(Math.random() * abecedario.length),
    );
    const letra2 = abecedario.charAt(
      Math.floor(Math.random() * abecedario.length),
    );

    return `WX${dia}${hora}${mes}${letra1}${letra2}`;
  };

  // Función para crear y agregar un nuevo pedido en blanco
  const agregarPedido = () => {
    const nuevoPedido = {
      id: generarCodigo(),
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
      enviado: false,
    };
    setPedidos([...pedidos, nuevoPedido]);
  };

  // Función para eliminar un pedido por su ID
  const borrarPedido = (idABorrar) => {
    setPedidos(pedidos.filter((pedido) => pedido.id !== idABorrar));
  };

  // Función para actualizar los datos de los inputs de un pedido específico
  const actualizarDatoPedido = (id, campo, valor) => {
    setPedidos(
      pedidos.map((pedido) =>
        pedido.id === id ? { ...pedido, [campo]: valor } : pedido,
      ),
    );
  };

  return (
    <div className="AdminDashboard">
      <button onClick={agregarPedido} className="AdminDashboard__add-order">
        <img src={WiXLOGO} alt="" className="address__logo" />
      </button>

      <div className="AdminDashboard__orders">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="order">
            <h3>
              Código de Pedido: <span className="order__code">{pedido.id}</span>
            </h3>

            {/* Formulario de Dirección y Datos */}
            <div className="order__form">
              <div className="form-group">
                <label htmlFor="calle">Calle y número</label>
                <input
                  type="text"
                  value={pedido.calleNumero}
                  onChange={(e) =>
                    actualizarDatoPedido(
                      pedido.id,
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
                  value={pedido.numeroInterior}
                  onChange={(e) =>
                    actualizarDatoPedido(
                      pedido.id,
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
                  value={pedido.codigoPostal}
                  onChange={(e) =>
                    actualizarDatoPedido(
                      pedido.id,
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
                  value={pedido.colonia}
                  onChange={(e) =>
                    actualizarDatoPedido(pedido.id, "colonia", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="ciudad">Ciudad</label>
                <input
                  type="text"
                  value={pedido.ciudad}
                  onChange={(e) =>
                    actualizarDatoPedido(pedido.id, "ciudad", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado</label>
                <input
                  type="text"
                  value={pedido.estado}
                  onChange={(e) =>
                    actualizarDatoPedido(pedido.id, "estado", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="referencia">Referencia</label>
                <input
                  type="text"
                  value={pedido.referencia}
                  onChange={(e) =>
                    actualizarDatoPedido(
                      pedido.id,
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
                  value={pedido.nombreCompleto}
                  onChange={(e) =>
                    actualizarDatoPedido(
                      pedido.id,
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
                  value={pedido.telefono}
                  onChange={(e) =>
                    actualizarDatoPedido(pedido.id, "telefono", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                  type="email"
                  value={pedido.correo}
                  onChange={(e) =>
                    actualizarDatoPedido(pedido.id, "correo", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Controles finales: Enviado y Borrar */}
            <div className="order__buttons">
              <label>
                <input
                  type="checkbox"
                  checked={pedido.enviado}
                  onChange={(e) =>
                    actualizarDatoPedido(pedido.id, "enviado", e.target.checked)
                  }
                />
                Enviado
              </label>

              <button onClick={() => borrarPedido(pedido.id)}>Borrar</button>
            </div>
          </div>
        ))}

        {pedidos.length === 0 && (
          <p style={{ color: "#ffffff", fontStyle: "italic" }}>
            No hay pedidos activos. Haz clic en "WiX-O" para comenzar.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
