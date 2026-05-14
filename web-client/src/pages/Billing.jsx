import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Search, Calendar, DollarSign, CheckCircle2, FileText, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PENALTY_PER_DAY = 0.50;
const IVA_RATE = 0.15;

// Calcula días de retraso y recargo usando solo fechas (sin hora) para evitar
// problemas de zona horaria, igual que el backend con LocalDate.
const calculatePenalty = (fechaLimiteISO) => {
  if (!fechaLimiteISO) return { daysLate: 0, penaltyAmount: 0 };

  const limite = new Date(fechaLimiteISO);
  const hoy = new Date();

  // Normalizar a medianoche local para comparar solo días
  const limiteDay = new Date(limite.getFullYear(), limite.getMonth(), limite.getDate());
  const hoyDay   = new Date(hoy.getFullYear(),   hoy.getMonth(),   hoy.getDate());

  const diffMs   = hoyDay - limiteDay;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return { daysLate: diffDays, penaltyAmount: diffDays * PENALTY_PER_DAY };
  }
  return { daysLate: 0, penaltyAmount: 0 };
};

// Skeleton card para el estado de carga
const SkeletonCard = () => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-slate-200 rounded-full" />
        <div className="h-5 w-36 bg-slate-200 rounded-full" />
      </div>
      <div className="h-6 w-20 bg-slate-200 rounded-full" />
    </div>
    <div className="flex gap-4 mt-4">
      <div className="h-4 w-20 bg-slate-100 rounded-full" />
      <div className="h-4 w-28 bg-slate-100 rounded-full" />
    </div>
  </div>
);

const Billing = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const backendBase = `http://${window.location.hostname}:8080`;

  // Carga los pedidos listos desde el backend
  const fetchPedidosListos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendBase}/api/facturacion/pedidos-listos`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      toast.error('No se pudieron cargar los pedidos. Verifica la conexión con el servidor.');
      console.error('Error al cargar pedidos listos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [backendBase]);

  useEffect(() => {
    fetchPedidosListos();
  }, [fetchPedidosListos]);

  // Filtra pedidos por búsqueda de nombre o ticket
  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    return (
      o.nombreCliente?.toLowerCase().includes(term) ||
      o.uuidTicket?.toLowerCase().includes(term) ||
      o.cedulaCliente?.includes(term)
    );
  });

  // Renderiza el panel de detalle de facturación
  const renderInvoiceSummary = () => {
    if (!selectedOrder) {
      return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-full text-center text-slate-400 min-h-[500px]">
          <div className="p-4 bg-slate-50 rounded-full mb-4">
            <Receipt size={48} className="opacity-30" />
          </div>
          <p className="text-lg">Seleccione un pedido para facturar</p>
        </div>
      );
    }

    const { daysLate, penaltyAmount } = calculatePenalty(selectedOrder.fechaEntregaLimite);
    const servicesSubtotal = Number(selectedOrder.subtotalServicios) || 0;
    const totalBeforeTax = servicesSubtotal + penaltyAmount;
    const taxes = totalBeforeTax * IVA_RATE;
    const totalToPay = totalBeforeTax + taxes;

    const handleProcessPayment = async () => {
      setIsProcessing(true);
      try {
        const res = await fetch(`${backendBase}/api/facturas/procesar/${selectedOrder.idPedido}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Error ${res.status}`);
        }

        const factura = await res.json();
        toast.success(`✅ Factura #${factura.idFactura} generada. Total cobrado: $${factura.totalPagado}`);

        // Eliminar de la lista y limpiar selección (Optimistic UI)
        setOrders(prev => prev.filter(o => o.idPedido !== selectedOrder.idPedido));
        setSelectedOrder(null);
        setPaymentMethod('Efectivo');
      } catch (err) {
        toast.error(`Error al procesar el pago: ${err.message}`);
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary-100 sticky top-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt size={24} className="text-primary-600" />
            Detalle de Facturación
          </h2>
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
            {selectedOrder.uuidTicket}
          </span>
        </div>

        {/* Cliente */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Cliente</p>
          <p className="text-lg font-bold text-slate-800">{selectedOrder.nombreCliente}</p>
          <p className="text-sm text-slate-500">C.I / RUC: {selectedOrder.cedulaCliente}</p>
        </div>

        {/* Servicios */}
        <div className="space-y-3 mb-6 min-h-[80px]">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Servicios Completados</p>
          {selectedOrder.servicios?.map((s, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-700 font-semibold">{s.nombre}</span>
              <span className="text-slate-900 font-bold">${Number(s.subtotal).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Recargo por permanencia */}
        {daysLate > 0 && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">Recargo por Permanencia</p>
                <p className="text-xs text-amber-700 mb-2">El pedido tiene {daysLate} días de retraso en su retiro.</p>
                <div className="flex justify-between items-center text-sm font-bold text-amber-900 pt-2 border-t border-amber-200/50">
                  <span>Cargo adicional ({daysLate} días × ${PENALTY_PER_DAY.toFixed(2)})</span>
                  <span>+ ${penaltyAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Totales */}
        <div className="border-t border-slate-100 pt-6 mb-6 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Subtotal Servicios</span>
            <span className="text-slate-700 font-semibold">${servicesSubtotal.toFixed(2)}</span>
          </div>
          {penaltyAmount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Recargos</span>
              <span className="text-slate-700 font-semibold">${penaltyAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">IVA (15%)</span>
            <span className="text-slate-700 font-semibold">${taxes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-end pt-4 border-t border-slate-100 mt-2">
            <span className="text-slate-800 font-bold">Total a Pagar</span>
            <span className="text-4xl font-extrabold text-primary-600">${totalToPay.toFixed(2)}</span>
          </div>
        </div>

        {/* Método de pago */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Método de Pago</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('Efectivo')}
              className={`py-3 px-4 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'Efectivo'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-slate-100 text-slate-500 hover:border-slate-200'
              }`}
            >
              <DollarSign size={18} /> Efectivo
            </button>
            <button
              onClick={() => setPaymentMethod('Transferencia')}
              className={`py-3 px-4 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'Transferencia'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-slate-100 text-slate-500 hover:border-slate-200'
              }`}
            >
              <CreditCard size={18} /> Transferencia
            </button>
          </div>
        </div>

        {/* Botón principal */}
        <button
          onClick={handleProcessPayment}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
            isProcessing
              ? 'bg-emerald-500 text-white shadow-emerald-500/30 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-600/40 transform hover:-translate-y-1'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CheckCircle2 size={22} />
              Finalizar y Entregar
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Facturación y Cobro</h1>
        <p className="text-slate-500 mt-2 text-lg">Gestione los pagos y la entrega final de los pedidos listos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Lista de Órdenes */}
        <div className="lg:col-span-3 space-y-4">
          {/* Buscador */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar por cliente, cédula o N° Ticket..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 bg-white shadow-sm font-medium"
            />
          </div>

          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Pedidos Listos para Entrega ({isLoading ? '...' : filteredOrders.length})
          </h3>

          {/* Estados de carga / vacío / lista */}
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400">
              <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50 text-emerald-500" />
              <p className="text-lg font-medium">
                {searchTerm ? 'Sin resultados para tu búsqueda.' : 'No hay pedidos pendientes de entrega.'}
              </p>
            </div>
          ) : (
            filteredOrders.map(order => {
              const { daysLate } = calculatePenalty(order.fechaEntregaLimite);
              const fechaFmt = order.fechaEntregaLimite
                ? new Date(order.fechaEntregaLimite).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'N/A';

              return (
                <div
                  key={order.idPedido}
                  onClick={() => { setSelectedOrder(order); setPaymentMethod('Efectivo'); }}
                  className={`bg-white p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                    selectedOrder?.idPedido === order.idPedido
                      ? 'border-primary-500 shadow-md ring-4 ring-primary-500/10'
                      : 'border-slate-100 hover:border-primary-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                        {order.uuidTicket}
                      </span>
                      <h4 className="text-lg font-bold text-slate-800">{order.nombreCliente}</h4>
                    </div>
                    {daysLate > 0 ? (
                      <span className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                        <AlertCircle size={14} /> Retrasado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                        <CheckCircle2 size={14} /> A Tiempo
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <FileText size={16} />
                      {order.servicios?.length || 0} servicios
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      Entrega: {fechaFmt}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Resumen de Facturación */}
        <div className="lg:col-span-2">
          {renderInvoiceSummary()}
        </div>
      </div>
    </div>
  );
};

export default Billing;
