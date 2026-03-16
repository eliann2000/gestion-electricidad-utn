import { useEffect, useMemo, useState } from "react";
import { clientesApi } from "../services/clientes";
import { productosApi } from "../services/productos";
import { ventasApi } from "../services/ventas";

import AgregarProductoForm from "../components/ventas/AgregarProductoForm";
import CarritoTable from "../components/ventas/CarritoTable";

export default function NuevaVentaPage() {
  const [clientes, setClientes] = useState([]); // El estado clientes se utiliza para almacenar la lista de clientes que se obtiene del backend. Inicialmente es un array vacío, y se actualiza con los datos traídos mediante la función cargarData. Esta lista de clientes se muestra en un select para que el usuario pueda elegir a qué cliente se le asignará la venta.
  const [productos, setProductos] = useState([]); // El estado productos se utiliza para almacenar la lista de productos disponibles que se obtiene del backend. Inicialmente es un array vacío, y se actualiza con los datos traídos mediante la función cargarData. Esta lista de productos se muestra en el formulario para agregar productos a la venta, permitiendo al usuario seleccionar un producto y su cantidad.

  // lo que el usuario va seleccionando en el formulario

  const [clienteId, setClienteId] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("1");

  // lo que se va agregando al carrito (items) y el resultado de la operación (error, okMsg)

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [enviarEmail, setEnviarEmail] = useState(false); // El estado enviarEmail se utiliza para controlar si el usuario ha marcado la opción de enviar el comprobante por email al registrar la venta. Es un booleano que se establece a true cuando el usuario marca la casilla correspondiente. Al registrar la venta, si enviarEmail es true, se realiza una solicitud adicional al backend para enviar el correo con el comprobante de la venta. Este estado permite que el usuario decida si desea recibir el comprobante por email o no.

  // edición carrito (nombres simples)
  const [idItemEdit, setIdItemEdit] = useState(null); // id del producto de la fila que edito
  const [prodEdit, setProdEdit] = useState("");
  const [cantEdit, setCantEdit] = useState("1");

  const limpiarMsgs = () => {
    setError("");
    setOkMsg("");
  };

  const resetEdicion = () => {
    setIdItemEdit(null);
    setProdEdit("");
    setCantEdit("1");
  };

  const buscarProd = (id) => productos.find((p) => p.id === id); // La función buscarProd se utiliza para encontrar un producto en la lista de productos disponibles a partir de su ID. Toma un ID como argumento y devuelve el producto correspondiente si lo encuentra, o undefined si no lo encuentra. Esta función es útil para validar que el producto seleccionado por el usuario existe en la lista de productos traída del backend, y para obtener información adicional del producto (como el precio o el stock) al agregarlo al carrito o al editarlo.

  const cargarData = async () => {
    setLoading(true);
    setError("");
    try {
      const [c, p] = await Promise.all([clientesApi.list(), productosApi.list()]);

      setClientes(
        [...c].sort((a, b) =>
          `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es")
        )
      );

      setProductos(p.filter((x) => x.activo));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarData();
  }, []);

  const total = useMemo(() => items.reduce((acc, it) => acc + it.subtotal, 0), [items]); // El estado total se calcula utilizando useMemo para optimizar el rendimiento. Se define como la suma de los subtotales de todos los items en el carrito. Cada vez que los items cambian, se recalcula el total sumando el subtotal de cada item (precio por cantidad). Esto permite mostrar al usuario el monto total de la venta en tiempo real a medida que agrega, edita o quita productos del carrito.

  const agregarItem = () => {
    limpiarMsgs();

    const idProd = Number(productoId);
    const cant = Number(cantidad);

    if (!idProd) return setError("Elegí un producto");
    if (!Number.isFinite(cant) || cant <= 0) return setError("Cantidad inválida");

    const prod = buscarProd(idProd);
    if (!prod) return setError("Producto no encontrado");

    const precio = Number(prod.precio); // El precio se obtiene del producto seleccionado utilizando la función buscarProd para encontrar el producto en la lista de productos disponibles. Se convierte a número para asegurarse de que se pueda realizar la operación de multiplicación con la cantidad. Este precio se utiliza para calcular el subtotal del item (precio por cantidad) que se agrega al carrito, y también para actualizar el total de la venta.
    const yaEnCarrito = items.find((x) => x.productoId === idProd); // La variable yaEnCarrito se utiliza para verificar si el producto que el usuario está intentando agregar al carrito ya existe en la lista de items del carrito. Se busca en el array items un item que tenga el mismo productoId que el producto que se quiere agregar. Si se encuentra, yaEnCarrito contendrá ese item, lo que indica que el producto ya está en el carrito. Esto es importante para manejar correctamente la cantidad y el subtotal del item, ya que si el producto ya está en el carrito, se debe actualizar la cantidad y el subtotal en lugar de agregar un nuevo item al array.
    const cantFinal = (yaEnCarrito?.cantidad || 0) + cant; // La variable cantFinal se utiliza para calcular la cantidad total del producto en el carrito después de agregar la nueva cantidad. Si el producto ya está en el carrito (yaEnCarrito), se toma la cantidad actual de ese item (yaEnCarrito.cantidad) y se le suma la nueva cantidad que el usuario quiere agregar (cant). Si el producto no está en el carrito, se considera que la cantidad actual es 0, por lo que cantFinal será simplemente la cantidad que se quiere agregar. Esta variable es importante para validar que la cantidad total del producto en el carrito no exceda el stock disponible antes de agregar o actualizar el item en el carrito.

    if (cantFinal > prod.stock) return setError(`Stock insuficiente. Disponible: ${prod.stock}`);

    setItems((prev) => {
      if (yaEnCarrito) {
        return prev.map((x) =>
          x.productoId === idProd ? { ...x, cantidad: cantFinal, subtotal: precio * cantFinal } : x // Si el producto ya está en el carrito, se actualiza la cantidad y el subtotal del item correspondiente. Se recorre el array de items y se encuentra el item que tiene el mismo productoId que el producto que se está agregando. Para ese item, se crea un nuevo objeto con la misma información pero con la cantidad actualizada a cantFinal y el subtotal recalculado como precio por cantFinal. Para los demás items, se devuelve el mismo objeto sin cambios. Esto permite mantener la inmutabilidad del estado al actualizar solo el item que corresponde al producto agregado.
        );
      }
      return [...prev, { productoId: idProd, nombre: prod.nombre, precio, cantidad: cant, subtotal: precio * cant }];
    });

    setProductoId("");
    setCantidad("1");
  };

  const quitarItem = (idProd) => {
    if (idItemEdit === idProd) resetEdicion(); // Si el producto que se está quitando es el mismo que se está editando, se resetea la edición para evitar inconsistencias en el formulario de edición.
    setItems((prev) => prev.filter((x) => x.productoId !== idProd)); // La función quitarItem se utiliza para eliminar un item del carrito a partir del ID del producto. Toma el ID del producto como argumento y actualiza el estado items filtrando el array para excluir el item que tiene el productoId igual al ID proporcionado. Esto permite que el usuario quite productos del carrito de manera sencilla, y el total de la venta se actualizará automáticamente al recalcularse con los items restantes.
  };

  const iniciarEdicion = (it) => { // IT representa el item del carrito que se va a editar. La función iniciarEdicion se utiliza para preparar el formulario de edición con los datos del item seleccionado. Toma el item como argumento, limpia los mensajes de error y éxito, y luego establece el estado de edición con la información del item: el ID del producto (idItemEdit), el ID del producto en formato string para el campo de selección (prodEdit) y la cantidad en formato string para el campo de cantidad (cantEdit). Esto permite que el usuario vea los datos actuales del item en el formulario de edición y pueda modificarlos antes de guardar los cambios.
    limpiarMsgs();
    setIdItemEdit(it.productoId);
    setProdEdit(String(it.productoId));
    setCantEdit(String(it.cantidad));
  };

  const guardarEdicion = () => {
    limpiarMsgs();

    const idViejo = idItemEdit;
    const idNuevo = Number(prodEdit);
    const cantNueva = Number(cantEdit);

    if (!idViejo) return;
    if (!idNuevo) return setError("Elegí un producto");
    if (!Number.isFinite(cantNueva) || cantNueva <= 0) return setError("Cantidad inválida");

    const prod = buscarProd(idNuevo);
    if (!prod) return setError("Producto no encontrado");
    if (cantNueva > prod.stock) return setError(`Stock insuficiente. Disponible: ${prod.stock}`);

    // si cambio a un producto que ya estaba, se fusiona
    const yaEnCarrito = items.find((x) => x.productoId === idNuevo && x.productoId !== idViejo); // La variable yaEnCarrito se utiliza para verificar si el producto al que se está editando el item ya existe en el carrito en otro item diferente. Se busca en el array items un item que tenga el mismo productoId que el nuevo producto seleccionado (idNuevo) pero con un productoId diferente al del item que se está editando (idViejo). Si se encuentra, yaEnCarrito contendrá ese item, lo que indica que el nuevo producto seleccionado ya está en el carrito en otro item. Esto es importante para manejar correctamente la cantidad y el subtotal del item, ya que si el nuevo producto ya está en el carrito, se debe actualizar la cantidad y el subtotal de ese item existente en lugar de crear un nuevo item o simplemente actualizar el item editado.
    if (yaEnCarrito && yaEnCarrito.cantidad + cantNueva > prod.stock) {
      return setError(`No se puede fusionar: stock insuficiente. Disponible: ${prod.stock}`);
    }

    const precio = Number(prod.precio);

    setItems((prev) => {

      // Para actualizar el carrito después de editar un item, se sigue el siguiente proceso:
      // 1. Se crea un nuevo array sin el item que se está editando (sinViejo).
      // 2. Se verifica si el nuevo producto seleccionado ya existe en el carrito en otro item diferente (existe).
      // 3. Si existe, se fusionan las cantidades sumando la cantidad nueva a la cantidad existente, y se actualiza el subtotal de ese item fusionado.
      // 4. Si no existe, se agrega un nuevo item al array con el nuevo producto, cantidad y subtotal.
      // 5. Finalmente, se ordena el array resultante por productoId para mantener un orden consistente en el carrito.

      const sinViejo = prev.filter((x) => x.productoId !== idViejo);
      const existe = sinViejo.find((x) => x.productoId === idNuevo);

      if (existe) {
        const fusion = existe.cantidad + cantNueva;
        return sinViejo.map((x) =>
          x.productoId === idNuevo ? { ...x, cantidad: fusion, subtotal: Number(x.precio) * fusion } : x
        );
      }

      return [...sinViejo, { productoId: idNuevo, nombre: prod.nombre, precio, cantidad: cantNueva, subtotal: precio * cantNueva }]
        .sort((a, b) => a.productoId - b.productoId);
    });

    resetEdicion();
  };

  const registrarVenta = async () => {
    limpiarMsgs();
    if (items.length === 0) return setError("Agregá al menos un producto");

    const body = {
      clienteId: clienteId ? Number(clienteId) : null,
      items: items.map((it) => ({ productoId: it.productoId, cantidad: it.cantidad })),
    };

    try {
      const venta = await ventasApi.create(body);

      if (enviarEmail) {
        let email; // La variable to se utiliza para almacenar el email destino al que se enviará el comprobante de la venta. Si el cliente seleccionado tiene un email registrado, se utilizará ese email automáticamente. Si el cliente no tiene un email registrado (o si la venta es para consumidor final), se le pedirá al usuario que ingrese un email destino mediante un prompt. Si el usuario no ingresa un email, se cancelará el envío del correo. Esta variable es importante para determinar a qué dirección de correo electrónico se enviará el comprobante de la venta cuando el usuario haya marcado la opción de enviar por email.

        if (!clienteId) {
          email = window.prompt("Ingresá el email destino para enviar el comprobante:");
          if (!email) return;
        }

        await ventasApi.enviarCorreo(venta.id, email ? { to: email } : {});
      }

      setOkMsg(
        enviarEmail
          ? `Venta creada con ID ${venta.id} - Monto total: $${venta.total}. Correo enviado ✅`
          : `Venta creada con ID ${venta.id} - Monto total: $${venta.total}`
      );

      setItems([]);
      setClienteId("");
      resetEdicion();
      setEnviarEmail(false);
      cargarData();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="m0">Nueva Venta</h1>
        </div>
      </div>

      {loading && (
        <p className="mt12" style={{ color: "var(--muted)" }}>
          Cargando datos...
        </p>
      )}

      {error && (
        <div className="alert alertError mt12">
          <b>Error:</b> {error}
        </div>
      )}

      {okMsg && (
        <div className="alert alertOk mt12">
          {okMsg}
        </div>
      )}

      <div className="mt12 card cardFlat">
        <h2 className="cardTitle">Cliente</h2>

        <label className="label">Seleccionar cliente</label>
        <select className="select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Consumidor final</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id} - {c.apellido} {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <AgregarProductoForm
        productos={productos}
        productoId={productoId}
        setProductoId={setProductoId}
        cantidad={cantidad}
        setCantidad={setCantidad}
        agregarItem={agregarItem}
      />

      {/* si CarritoTable usa otros nombres, después se ajusta */}
      <CarritoTable
        items={items}
        productos={productos}
        idItemEdit={idItemEdit}
        prodEdit={prodEdit}
        cantEdit={cantEdit}
        setProdEdit={setProdEdit}
        setCantEdit={setCantEdit}
        editar={iniciarEdicion}
        guardar={guardarEdicion}
        cancelar={resetEdicion}
        quitar={quitarItem}
      />

      <div className="row mt12" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="m0">Total: ${total}</h3>

        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <label className="checkboxRow">
            <input
              type="checkbox"
              checked={enviarEmail}
              onChange={(e) => setEnviarEmail(e.target.checked)}
              disabled={items.length === 0}
            />
            Enviar comprobante por email
          </label>

          <button className="btn btnPrimary" type="button" onClick={registrarVenta} disabled={items.length === 0}>
            Registrar venta
          </button>
        </div>
      </div>
    </div>
  );
}