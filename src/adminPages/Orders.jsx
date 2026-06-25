import { useState, useEffect } from "react";
import "./Orders.css";

// URL de tu API para las órdenes
const API_URL = "https://wix-o3d-backend.onrender.com/api/orders";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Cargar las órdenes desde MongoDB al abrir la página
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error al cargar órdenes:", err));
  }, []);

  // Función auxiliar para actualizar la base de datos y sincronizar los _id reales
  const saveOrderToDB = (updatedOrder) => {
    fetch(`${API_URL}/${updatedOrder._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedOrder),
    })
      .then((res) => res.json())
      .then((savedOrder) => {
        // Reemplazamos la orden local con la respuesta de DB (para asegurar que los _id de los productos estén bien)
        setOrders((prev) =>
          prev.map((o) => (o._id === savedOrder._id ? savedOrder : o)),
        );
      })
      .catch((err) => console.error("Error al guardar en MongoDB:", err));
  };

  // 2. Crear un nuevo pedido en la base de datos
  const addOrder = () => {
    const newOrderTemplate = {
      client: "",
      adelanto: "",
      isEnviado: false,
      isRecibido: false,
      completedAt: null,
      productos: [{ name: "", price: "", quantity: 1, isFabricated: false }],
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
          isFabricated: false,
        }, // Usamos tempId para no chocar con Mongoose
      ],
    };
    // Actualizamos vista local al instante
    setOrders(orders.map((o) => (o._id === order._id ? updatedOrder : o)));
    // Guardamos en BD para que Mongoose asigne un _id real al nuevo producto
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

  // 3. Manejadores de cambios
  const updateOrder = (order, field, value) => {
    const updatedOrder = { ...order, [field]: value };

    // Si tocamos "isEnviado" o "isRecibido", calculamos si la orden se completó hoy
    if (field === "isEnviado" || field === "isRecibido") {
      updatedOrder.completedAt =
        updatedOrder.isEnviado && updatedOrder.isRecibido ? Date.now() : null;
    }

    // Siempre actualizamos el estado local (React)
    setOrders(orders.map((o) => (o._id === order._id ? updatedOrder : o)));

    // Si es un Switch (booleano), guardamos INMEDIATAMENTE en base de datos
    if (typeof value === "boolean") {
      saveOrderToDB(updatedOrder);
    }
  };

  const updateProduct = (order, productId, field, value) => {
    const updatedOrder = {
      ...order,
      productos: order.productos.map((p) =>
        p._id === productId || p.tempId === productId
          ? { ...p, [field]: value }
          : p,
      ),
    };

    // Actualizar vista local
    setOrders(orders.map((o) => (o._id === order._id ? updatedOrder : o)));

    // Si es el Switch de Fabricado, guardar inmediato en DB
    if (typeof value === "boolean") {
      saveOrderToDB(updatedOrder);
    }
  };

  // Función que se llama cuando el usuario deja de escribir en un cuadro de texto (onBlur)
  const handleInputBlur = (orderId) => {
    const orderToSave = orders.find((o) => o._id === orderId);
    if (orderToSave) saveOrderToDB(orderToSave);
  };

  // 4. Cálculo de Total
  const calculateTotal = (order) => {
    const subtotal = order.productos.reduce((sum, p) => {
      const price = parseFloat(p.price) || 0;
      const qty = parseInt(p.quantity) || 0;
      return sum + price * qty;
    }, 0);
    const adelanto = parseFloat(order.adelanto) || 0;
    const total = subtotal - adelanto;
    return total > 0 ? total : 0;
  };

  // 5. Lógica de Filtrado (Embudo de ventas)
  const porFabricar = orders.filter(
    (o) =>
      !o.productos.every((p) => p.isFabricated) &&
      !(o.isEnviado && o.isRecibido),
  );

  const porEnviar = orders.filter(
    (o) =>
      o.productos.every((p) => p.isFabricated) &&
      !(o.isEnviado && o.isRecibido),
  );

  let realizado = orders.filter(
    (o) =>
      o.productos.every((p) => p.isFabricated) && o.isEnviado && o.isRecibido,
  );

  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  realizado = realizado.filter((o) => {
    const total = calculateTotal(o);
    if (total > 0) return true;
    if (!o.completedAt) return true;
    return Date.now() - new Date(o.completedAt).getTime() <= THIRTY_DAYS_MS;
  });

  realizado.sort((a, b) => {
    const totalA = calculateTotal(a);
    const totalB = calculateTotal(b);
    if (totalA > 0 && totalB === 0) return -1;
    if (totalA === 0 && totalB > 0) return 1;
    return 0;
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
        {porFabricar.length > 0 && (
          <div className="order-grid order-headers">
            <label>Cliente</label>
            <label></label>
            <label>Producto</label>
            <label>Precio</label>
            <label>Cantidad</label>
            <label>Fab</label>
            <label>Adelanto</label>
            <label>Total</label>
          </div>
        )}
        {porFabricar.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-grid">
              <div className="col col-stretch">
                <input
                  placeholder="Nombre"
                  value={order.client}
                  onChange={(e) => updateOrder(order, "client", e.target.value)}
                  onBlur={() => handleInputBlur(order._id)} // GUARDA EN BD AL SALIR DEL CUADRO
                />
              </div>
              <div className="col col-center">
                <button className="btn-round" onClick={() => addProduct(order)}>
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
                    type="number"
                    placeholder="Precio"
                    value={p.price}
                    onChange={(e) =>
                      updateProduct(
                        order,
                        p._id || p.tempId,
                        "price",
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
              <div className="col col-stretch">
                <input
                  type="number"
                  placeholder="$0.00"
                  value={order.adelanto}
                  onChange={(e) =>
                    updateOrder(order, "adelanto", e.target.value)
                  }
                  onBlur={() => handleInputBlur(order._id)}
                />
              </div>
              <div className="col col-stretch">
                <input
                  readOnly
                  value={`$${calculateTotal(order).toFixed(2)}`}
                  style={{ color: "#4cd137" }}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* --- SECCIÓN: POR ENVIAR --- */}
      <section className="orders__section">
        <h1 className="shipments__title">Por enviar</h1>
        {porEnviar.length > 0 && (
          <div className="order-grid order-headers">
            <label>Cliente</label>
            <label>E / R</label>
            <label>Producto</label>
            <label>Precio</label>
            <label>Cantidad</label>
            <label>Fab</label>
            <label>Adelanto</label>
            <label>Total</label>
          </div>
        )}
        {porEnviar.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-grid">
              <div className="col col-stretch">
                <input
                  placeholder="Nombre"
                  value={order.client}
                  onChange={(e) => updateOrder(order, "client", e.target.value)}
                  onBlur={() => handleInputBlur(order._id)}
                />
              </div>
              <div className="col col-center">
                <label className="switch" title="Enviado">
                  <input
                    type="checkbox"
                    checked={order.isEnviado}
                    onChange={(e) =>
                      updateOrder(order, "isEnviado", e.target.checked)
                    }
                  />
                </label>
                <label className="switch" title="Recibido">
                  <input
                    type="checkbox"
                    checked={order.isRecibido}
                    onChange={(e) =>
                      updateOrder(order, "isRecibido", e.target.checked)
                    }
                  />
                </label>
              </div>
              <div className="col">
                {order.productos.map((p) => (
                  <input key={p._id || p.tempId} value={p.name} readOnly />
                ))}
              </div>
              <div className="col">
                {order.productos.map((p) => (
                  <input key={p._id || p.tempId} value={p.price} readOnly />
                ))}
              </div>
              <div className="col">
                {order.productos.map((p) => (
                  <input key={p._id || p.tempId} value={p.quantity} readOnly />
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
              <div className="col col-stretch">
                <input
                  type="number"
                  value={order.adelanto}
                  onChange={(e) =>
                    updateOrder(order, "adelanto", e.target.value)
                  }
                  onBlur={() => handleInputBlur(order._id)}
                />
              </div>
              <div className="col col-stretch">
                <input
                  readOnly
                  value={`$${calculateTotal(order).toFixed(2)}`}
                  style={{ color: "#4cd137" }}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* --- SECCIÓN: REALIZADO --- */}
      <section className="orders__section">
        <h1 className="realized__title">Realizado</h1>
        {realizado.length > 0 && (
          <div className="order-grid-realized order-headers">
            <label>Cliente</label>
            <label>Producto</label>
            <label>Precio</label>
            <label>Cantidad</label>
            <label>Adelanto</label>
            <label>Deuda Pendiente</label>
          </div>
        )}
        {realizado.map((order) => {
          const isPaid = calculateTotal(order) === 0;
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
                    <input key={p._id || p.tempId} value={p.name} readOnly />
                  ))}
                </div>
                <div className="col">
                  {order.productos.map((p) => (
                    <input key={p._id || p.tempId} value={p.price} readOnly />
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
                <div className="col col-stretch">
                  <input
                    type="number"
                    value={order.adelanto}
                    onChange={(e) =>
                      updateOrder(order, "adelanto", e.target.value)
                    }
                    onBlur={() => handleInputBlur(order._id)}
                    style={{ borderBottom: "2px solid yellow" }}
                  />
                </div>
                <div className="col col-stretch">
                  <input
                    readOnly
                    value={`$${calculateTotal(order).toFixed(2)}`}
                    style={{
                      color: isPaid ? "gray" : "#ff4d4d",
                      fontWeight: "bold",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default Orders;
