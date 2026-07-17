import { useState, useEffect } from "react";
import "./Orders.css";

const API_URL = "https://wix-o3d-backend.onrender.com/api/orders";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error al cargar órdenes:", err))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const saveOrderToDB = (updatedOrder) => {
    fetch(`${API_URL}/${updatedOrder._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedOrder),
    })
      .then((res) => res.json())
      .then((savedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o._id === savedOrder._id ? savedOrder : o)),
        );
      })
      .catch((err) => console.error("Error al guardar en MongoDB:", err));
  };

  const addOrder = () => {
    const newOrderTemplate = {
      client: "",
      deuda: "",
      completedAt: null,
      productos: [
        {
          name: "",
          price: "",
          quantity: 1,
          adelanto: "",
          isFabricated: false,
          isEnviado: false,
          isRecibido: false,
        },
      ],
    };

    setIsLoading(true);
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrderTemplate),
    })
      .then((res) => res.json())
      .then((savedOrder) => setOrders([...orders, savedOrder]))
      .catch((err) => console.error("Error al crear orden:", err))
      .finally(() => setIsLoading(false));
  };

  const addProduct = (order) => {
    const updatedOrder = {
      ...order,
      productos: [
        ...order.productos,
        {
          tempId: Date.now(),
          name: "",
          price: "",
          quantity: 1,
          adelanto: "",
          isFabricated: false,
          isEnviado: false,
          isRecibido: false,
        },
      ],
    };
    setOrders(orders.map((o) => (o._id === order._id ? updatedOrder : o)));
    saveOrderToDB(updatedOrder);
  };

  const removeProduct = (order) => {
    if (order.productos.length > 1) {
      const updatedOrder = {
        ...order,
        productos: order.productos.slice(0, -1),
      };
      setOrders(orders.map((o) => (o._id === order._id ? updatedOrder : o)));
      saveOrderToDB(updatedOrder);
    }
  };

  const updateOrder = (order, field, value) => {
    const updatedOrder = { ...order, [field]: value };
    setOrders(orders.map((o) => (o._id === order._id ? updatedOrder : o)));
  };

  const updateProduct = (order, productId, field, value) => {
    const updatedProductos = order.productos.map((p) =>
      p._id === productId || p.tempId === productId
        ? { ...p, [field]: value }
        : p,
    );

    let updatedOrder = { ...order, productos: updatedProductos };

    const allSent = updatedProductos.every((p) => p.isEnviado);
    const allReceived = updatedProductos.every((p) => p.isRecibido);

    // Si se tocan los switches de envío/recepción, verificar si toda la orden se completó
    if (field === "isEnviado" || field === "isRecibido") {
      updatedOrder.completedAt = allSent && allReceived ? Date.now() : null;
    }

    // SI LA ORDEN ESTÁ REALIZADA: recalculamos la deuda si toca envío/recepción o si el usuario modifica el adelanto, precio o cantidad.
    if (
      allSent &&
      allReceived &&
      (field === "isEnviado" ||
        field === "isRecibido" ||
        field === "adelanto" ||
        field === "price" ||
        field === "quantity")
    ) {
      const total = updatedProductos.reduce(
        (sum, p) =>
          sum + (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0),
        0,
      );
      const adelantos = updatedProductos.reduce(
        (sum, p) => sum + (parseFloat(p.adelanto) || 0),
        0,
      );
      const restante = total - adelantos;

      updatedOrder.deuda = restante > 0 ? restante.toString() : "0";
    }

    setOrders(orders.map((o) => (o._id === order._id ? updatedOrder : o)));

    if (typeof value === "boolean") {
      saveOrderToDB(updatedOrder);
    }
  };

  const handleInputBlur = (orderId) => {
    const orderToSave = orders.find((o) => o._id === orderId);
    if (orderToSave) saveOrderToDB(orderToSave);
  };

  // Cálculos dinámicos
  const getProductTotal = (p) => {
    const price = parseFloat(p.price) || 0;
    const qty = parseInt(p.quantity) || 0;
    return price * qty;
  };

  const getOrderTotal = (order) => {
    return order.productos.reduce((sum, p) => sum + getProductTotal(p), 0);
  };

  const getOrderAdelantos = (order) => {
    return order.productos.reduce(
      (sum, p) => sum + (parseFloat(p.adelanto) || 0),
      0,
    );
  };

  const getOrderRestante = (order) => {
    const total = getOrderTotal(order) - getOrderAdelantos(order);
    return total > 0 ? total : 0;
  };

  // Filtros (Embudo de ventas)
  const porFabricar = orders.filter(
    (o) =>
      !o.productos.every((p) => p.isFabricated) &&
      !o.productos.every((p) => p.isEnviado && p.isRecibido),
  );

  const porEnviar = orders.filter(
    (o) =>
      o.productos.every((p) => p.isFabricated) &&
      !o.productos.every((p) => p.isEnviado && p.isRecibido),
  );

  let realizado = orders.filter((o) =>
    o.productos.every((p) => p.isFabricated && p.isEnviado && p.isRecibido),
  );

  const ONE_MINUTE_MS = 7 * 24 * 60 * 60 * 1000;

  realizado = realizado.filter((o) => {
    // Si el usuario escribió algo en Deuda, usamos eso. Si está vacío, calculamos el restante.
    const hasManualDeuda =
      o.deuda !== "" && o.deuda !== null && o.deuda !== undefined;
    const deudaFinal = hasManualDeuda
      ? parseFloat(o.deuda)
      : getOrderRestante(o);

    // Si la deuda final es mayor a 0, se queda en pantalla
    if (deudaFinal > 0) return true;

    // Si la deuda es 0, evaluamos el tiempo de expiración
    if (!o.completedAt) return true;
    return Date.now() - new Date(o.completedAt).getTime() <= ONE_MINUTE_MS;
  });

  // Ordenar: Los pedidos con deuda mayor a 0 van primero (arriba)
  realizado.sort((a, b) => {
    const deudaA = parseFloat(a.deuda) || 0;
    const deudaB = parseFloat(b.deuda) || 0;
    return deudaB - deudaA; // Orden descendente
  });

  return (
    <div className="orders">
      <button
        className="orders__add-btn"
        onClick={addOrder}
        disabled={isLoading}
      >
        {isLoading ? "Creando..." : "Agregar pedido"}
      </button>

      {/* --- SECCIÓN: POR FABRICAR --- */}
      <section className="orders__section">
        <h1 className="manufacturing__title">Por fabricar</h1>

        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          <>
            {porFabricar.length > 0 && (
              <div className="order-grid order-headers">
                <label>Cliente</label>
                <label></label>
                <label>Producto</label>
                <label>Precio</label>
                <label>Cantidad</label>
                <label>Fab</label>
                <label>Total</label>
                <label>Adelanto</label>
                <label>Restante</label>
              </div>
            )}
            {porFabricar.map((order) => (
              <div className="order-card" key={order._id}>
                <div className="order-grid">
                  <div className="col col-stretch">
                    <input
                      placeholder="Nombre"
                      value={order.client}
                      onChange={(e) =>
                        updateOrder(order, "client", e.target.value)
                      }
                      onBlur={() => handleInputBlur(order._id)}
                    />
                  </div>
                  <div className="col col-add">
                    <button
                      className="btn-round"
                      onClick={() => addProduct(order)}
                    >
                      +
                    </button>
                    <button
                      className="btn-round"
                      onClick={() => removeProduct(order)}
                    >
                      -
                    </button>
                  </div>
                  <div className="col">
                    {order.productos.map((p) => (
                      <input
                        key={p._id || p.tempId}
                        placeholder="Producto"
                        value={p.name}
                        onChange={(e) =>
                          updateProduct(
                            order,
                            p._id || p.tempId,
                            "name",
                            e.target.value,
                          )
                        }
                        onBlur={() => handleInputBlur(order._id)}
                      />
                    ))}
                  </div>
                  <div className="col">
                    {order.productos.map((p) => (
                      <input
                        key={p._id || p.tempId}
                        type="text"
                        placeholder="$0.00"
                        value={p.price ? `$${p.price}` : ""}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(
                            /[^0-9.]/g,
                            "",
                          );
                          updateProduct(
                            order,
                            p._id || p.tempId,
                            "price",
                            rawValue,
                          );
                        }}
                        onBlur={() => handleInputBlur(order._id)}
                      />
                    ))}
                  </div>
                  <div className="col">
                    {order.productos.map((p) => (
                      <input
                        key={p._id || p.tempId}
                        type="number"
                        placeholder="Cant"
                        value={p.quantity}
                        onChange={(e) =>
                          updateProduct(
                            order,
                            p._id || p.tempId,
                            "quantity",
                            e.target.value,
                          )
                        }
                        onBlur={() => handleInputBlur(order._id)}
                      />
                    ))}
                  </div>
                  <div className="col col-switch">
                    {order.productos.map((p) => (
                      <label className="switch" key={p._id || p.tempId}>
                        <input
                          type="checkbox"
                          checked={p.isFabricated}
                          onChange={(e) =>
                            updateProduct(
                              order,
                              p._id || p.tempId,
                              "isFabricated",
                              e.target.checked,
                            )
                          }
                        />
                      </label>
                    ))}
                  </div>

                  {/* Total individual (Solo Lectura) */}
                  <div className="col">
                    {order.productos.map((p) => (
                      <input
                        key={p._id || p.tempId}
                        readOnly
                        value={`$${getProductTotal(p).toFixed(2)}`}
                        style={{ color: "gray", borderColor: "gray" }}
                      />
                    ))}
                  </div>

                  {/* Adelanto individual */}
                  <div className="col">
                    {order.productos.map((p) => (
                      <input
                        key={p._id || p.tempId}
                        type="text"
                        placeholder="$0.00"
                        value={p.adelanto ? `$${p.adelanto}` : ""}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(
                            /[^0-9.]/g,
                            "",
                          );
                          updateProduct(
                            order,
                            p._id || p.tempId,
                            "adelanto",
                            rawValue,
                          );
                        }}
                        onBlur={() => handleInputBlur(order._id)}
                      />
                    ))}
                  </div>

                  {/* Restante Total (Solo Lectura) */}
                  <div className="col col-stretch">
                    <input
                      readOnly
                      value={`$${getOrderRestante(order).toFixed(2)}`}
                      style={{ color: "#4cd137", fontWeight: "bold" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      {/* --- SECCIÓN: POR ENVIAR --- */}
      <section className="orders__section">
        <h1 className="shipments__title">Por enviar</h1>

        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          <>
            {porEnviar.length > 0 && (
              <div className="order-grid order-headers">
                <label>Cliente</label>
                <label>E/R</label>
                <label>Producto</label>
                <label>Precio</label>
                <label>Cantidad</label>
                <label>Fab</label>
                <label>Total</label>
                <label>Adelanto</label>
                <label>Restante</label>
              </div>
            )}
            {porEnviar.map((order) => (
              <div className="order-card" key={order._id}>
                <div className="order-grid">
                  <div className="col col-stretch">
                    <input
                      placeholder="Nombre"
                      value={order.client}
                      onChange={(e) =>
                        updateOrder(order, "client", e.target.value)
                      }
                      onBlur={() => handleInputBlur(order._id)}
                    />
                  </div>

                  {/* Switches E/R por producto */}
                  <div className="col">
                    {order.productos.map((p) => (
                      <div
                        className="col-center"
                        key={p._id || p.tempId}
                        style={{ height: "100%" }}
                      >
                        <label className="switch" title="Enviado">
                          <input
                            type="checkbox"
                            checked={p.isEnviado}
                            onChange={(e) =>
                              updateProduct(
                                order,
                                p._id || p.tempId,
                                "isEnviado",
                                e.target.checked,
                              )
                            }
                          />
                        </label>
                        <label className="switch" title="Recibido">
                          <input
                            type="checkbox"
                            checked={p.isRecibido}
                            onChange={(e) =>
                              updateProduct(
                                order,
                                p._id || p.tempId,
                                "isRecibido",
                                e.target.checked,
                              )
                            }
                          />
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="col">
                    {order.productos.map((p) => (
                      <input key={p._id || p.tempId} value={p.name} readOnly />
                    ))}
                  </div>
                  <div className="col">
                    {order.productos.map((p) => (
                      <input
                        key={p._id || p.tempId}
                        value={p.price ? `$${p.price}` : ""}
                        readOnly
                      />
                    ))}
                  </div>
                  <div className="col">
                    {order.productos.map((p) => (
                      <input
                        key={p._id || p.tempId}
                        value={p.quantity}
                        readOnly
                      />
                    ))}
                  </div>
                  <div className="col col-switch">
                    {order.productos.map((p) => (
                      <label className="switch" key={p._id || p.tempId}>
                        <input
                          type="checkbox"
                          checked={p.isFabricated}
                          onChange={(e) =>
                            updateProduct(
                              order,
                              p._id || p.tempId,
                              "isFabricated",
                              e.target.checked,
                            )
                          }
                        />
                      </label>
                    ))}
                  </div>

                  {/* Total individual (Solo Lectura) */}
                  <div className="col">
                    {order.productos.map((p) => (
                      <input
                        key={p._id || p.tempId}
                        readOnly
                        value={`$${getProductTotal(p).toFixed(2)}`}
                        style={{ color: "gray", borderColor: "gray" }}
                      />
                    ))}
                  </div>

                  {/* Adelanto individual */}
                  <div className="col">
                    {order.productos.map((p) => (
                      <input
                        key={p._id || p.tempId}
                        type="text"
                        placeholder="$0.00"
                        value={p.adelanto ? `$${p.adelanto}` : ""}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(
                            /[^0-9.]/g,
                            "",
                          );
                          updateProduct(
                            order,
                            p._id || p.tempId,
                            "adelanto",
                            rawValue,
                          );
                        }}
                        onBlur={() => handleInputBlur(order._id)}
                      />
                    ))}
                  </div>

                  {/* Restante Total (Solo Lectura) */}
                  <div className="col col-stretch">
                    <input
                      readOnly
                      value={`$${getOrderRestante(order).toFixed(2)}`}
                      style={{ color: "#4cd137", fontWeight: "bold" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      {/* --- SECCIÓN: REALIZADO --- */}
      <section className="orders__section">
        <h1 className="realized__title">Realizado</h1>

        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          <>
            {realizado.length > 0 && (
              <div className="order-grid-realized order-headers">
                <label>Cliente</label>
                <label>Producto</label>
                <label>Precio</label>
                <label>Cantidad</label>
                <label>Total</label>
                <label>Adelanto</label>
                <label>Deuda</label>
              </div>
            )}

            {realizado.map((order) => {
              // Sincronizamos la lógica visual con la del filtro
              const hasManualDeuda =
                order.deuda !== "" &&
                order.deuda !== null &&
                order.deuda !== undefined;
              const deudaFinal = hasManualDeuda
                ? parseFloat(order.deuda)
                : getOrderRestante(order);
              const isPaid = deudaFinal === 0;

              return (
                <div
                  className="order-card"
                  key={order._id}
                  style={{ opacity: isPaid ? 0.3 : 1 }}
                >
                  <div className="order-grid-realized">
                    <div className="col col-stretch">
                      <input value={order.client} readOnly />
                    </div>
                    <div className="col">
                      {order.productos.map((p) => (
                        <input
                          key={p._id || p.tempId}
                          value={p.name}
                          readOnly
                        />
                      ))}
                    </div>
                    <div className="col">
                      {order.productos.map((p) => (
                        <input
                          key={p._id || p.tempId}
                          value={p.price ? `$${p.price}` : ""}
                          readOnly
                        />
                      ))}
                    </div>
                    <div className="col">
                      {order.productos.map((p) => (
                        <input
                          key={p._id || p.tempId}
                          value={p.quantity}
                          readOnly
                        />
                      ))}
                    </div>

                    {/* Total Individual (Lectura) */}
                    <div className="col">
                      {order.productos.map((p) => (
                        <input
                          key={p._id || p.tempId}
                          readOnly
                          value={`$${getProductTotal(p).toFixed(2)}`}
                          style={{ color: "gray", borderColor: "gray" }}
                        />
                      ))}
                    </div>

                    {/* Adelanto Individual (Editable) */}
                    <div className="col">
                      {order.productos.map((p) => (
                        <input
                          key={p._id || p.tempId}
                          type="text"
                          placeholder="$0.00"
                          value={p.adelanto ? `$${p.adelanto}` : ""}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(
                              /[^0-9.]/g,
                              "",
                            );
                            updateProduct(
                              order,
                              p._id || p.tempId,
                              "adelanto",
                              rawValue,
                            );
                          }}
                          onBlur={() => handleInputBlur(order._id)}
                        />
                      ))}
                    </div>

                    {/* Deuda General de la orden (Editable) */}
                    <div className="col col-stretch">
                      <input
                        type="text"
                        placeholder="$0.00"
                        value={order.deuda ? `$${order.deuda}` : ""}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(
                            /[^0-9.]/g,
                            "",
                          );
                          updateOrder(order, "deuda", rawValue);
                        }}
                        onBlur={() => handleInputBlur(order._id)}
                        style={{
                          border: isPaid
                            ? "2px dashed gray"
                            : "2px solid #ff4d4d",
                          color: isPaid ? "gray" : "#ff4d4d",
                          fontWeight: "bold",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </section>
    </div>
  );
}

export default Orders;
