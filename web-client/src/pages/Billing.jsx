import React, { useState, useEffect } from 'react';
import { Receipt, Search, Calendar, Clock, DollarSign, CheckCircle2, FileText, CreditCard, AlertCircle } from 'lucide-react';

// Datos de prueba (Mock Data)
const generateMockOrders = () => {
  const now = new Date();
  
  // Pedido con 4 días de retraso (debería tener $2.00 de recargo)
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 4);
  
  // Pedido que debe entregarse mañana (sin recargo)
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + 1);

  return [
    {
      id: 'TKT-2026-001',
      customer: { name: 'Ana García', id: '0987654321', phone: '0999999999' },
      services: [
        { id: 'dry', name: 'Lavado en Seco (Traje)', price: 8.50 },
        { id: 'ironing', name: 'Planchado (Camisa)', price: 2.00 }
      ],
      estimatedDeliveryDate: pastDate.toISOString(),
      status: 'LISTO_PARA_ENTREGA'
    },
    {
      id: 'TKT-2026-002',
      customer: { name: 'Carlos López', id: '0911111111', phone: '0988888888' },
      services: [
        { id: 'weight', name: 'Lavado por Peso (5kg)', price: 7.50 }
      ],
      estimatedDeliveryDate: futureDate.toISOString(),
      status: 'LISTO_PARA_ENTREGA'
    }
  ];
};

const PENALTY_PER_DAY = 0.50; // $0.50 por cada día de retraso

const Billing = () => {
  const [orders, setOrders] = useState(generateMockOrders());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calcula días de retraso y recargo
  const calculatePenalty = (estimatedDateString) => {
    const estimatedDate = new Date(estimatedDateString);
    const currentDate = new Date();
    
    // Normalizamos las fechas a medianoche para evitar problemas con las horas
    const est = new Date(estimatedDate.getFullYear(), estimatedDate.getMonth(), estimatedDate.getDate());
    const curr = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    const diffTime = curr - est;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays > 0) {
      return {
        daysLate: diffDays,
        penaltyAmount: diffDays * PENALTY_PER_DAY
      };
    }
    
    return { daysLate: 0, penaltyAmount: 0 };
  };

  // Renderiza el detalle de facturación de la orden seleccionada
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

    const { daysLate, penaltyAmount } = calculatePenalty(selectedOrder.estimatedDeliveryDate);
    const servicesSubtotal = selectedOrder.services.reduce((acc, curr) => acc + curr.price, 0);
    
    // Cálculos Finales
    const totalBeforeTax = servicesSubtotal + penaltyAmount;
    const taxes = totalBeforeTax * 0.15; // IVA 15%
    const totalToPay = totalBeforeTax + taxes;

    const handleProcessPayment = () => {
      setIsProcessing(true);
      
      const invoiceData = {
        orderId: selectedOrder.id,
        customer: selectedOrder.customer,
        paymentMethod: paymentMethod,
        financialDetails: {
          servicesSubtotal: Number(servicesSubtotal.toFixed(2)),
          penaltyDays: daysLate,
          penaltyAmount: Number(penaltyAmount.toFixed(2)),
          taxRate: 0.15,
          taxAmount: Number(taxes.toFixed(2)),
          totalPaid: Number(totalToPay.toFixed(2))
        },
        processedAt: new Date().toISOString()
      };

      console.log("=== FACTURA GENERADA (JSON PARA BACKEND) ===");
      console.log(JSON.stringify(invoiceData, null, 2));

      setTimeout(() => {
        setIsProcessing(false);
        // Remover de la lista local
        setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
        setSelectedOrder(null);
      }, 2000);
    };

    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary-100 sticky top-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt size={24} className="text-primary-600" />
            Detalle de Facturación
          </h2>
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
            {selectedOrder.id}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Cliente</p>
          <p className="text-lg font-bold text-slate-800">{selectedOrder.customer.name}</p>
          <p className="text-sm text-slate-500">C.I / RUC: {selectedOrder.customer.id}</p>
        </div>

        <div className="space-y-3 mb-6 min-h-[120px]">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Servicios Completados</p>
          {selectedOrder.services.map((service, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-700 font-semibold">{service.name}</span>
              <span className="text-slate-900 font-bold">${service.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {daysLate > 0 && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">Recargo por Permanencia</p>
                <p className="text-xs text-amber-700 mb-2">El pedido tiene {daysLate} días de retraso en su retiro.</p>
                <div className="flex justify-between items-center text-sm font-bold text-amber-900 pt-2 border-t border-amber-200/50">
                  <span>Cargo adicional ({daysLate} días x ${PENALTY_PER_DAY.toFixed(2)})</span>
                  <span>+ ${penaltyAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
              <DollarSign size={18} />
              Efectivo
            </button>
            <button
              onClick={() => setPaymentMethod('Transferencia')}
              className={`py-3 px-4 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'Transferencia' 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-slate-100 text-slate-500 hover:border-slate-200'
              }`}
            >
              <CreditCard size={18} />
              Transferencia
            </button>
          </div>
        </div>

        <button
          onClick={handleProcessPayment}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
            isProcessing
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-600/40 transform hover:-translate-y-1'
          }`}
        >
          {isProcessing ? (
            <>
              <CheckCircle2 size={24} className="animate-bounce" />
              Procesando y Entregando...
            </>
          ) : (
            <>
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
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar por cliente o N° Ticket..."
              className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 bg-white shadow-sm font-medium"
            />
          </div>

          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Pedidos Listos para Entrega ({orders.length})</h3>

          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400">
              <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50 text-emerald-500" />
              <p className="text-lg font-medium">No hay pedidos pendientes de entrega.</p>
            </div>
          ) : (
            orders.map(order => {
              const { daysLate } = calculatePenalty(order.estimatedDeliveryDate);
              const estDate = new Date(order.estimatedDeliveryDate);
              const formattedDate = estDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

              return (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                    selectedOrder?.id === order.id 
                      ? 'border-primary-500 shadow-md ring-4 ring-primary-500/10' 
                      : 'border-slate-100 hover:border-primary-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                        {order.id}
                      </span>
                      <h4 className="text-lg font-bold text-slate-800">{order.customer.name}</h4>
                    </div>
                    {daysLate > 0 ? (
                      <span className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                        <AlertCircle size={14} />
                        Retrasado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                        <CheckCircle2 size={14} />
                        A Tiempo
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <FileText size={16} />
                      {order.services.length} servicios
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      Entrega: {formattedDate}
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
