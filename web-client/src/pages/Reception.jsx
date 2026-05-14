import React, { useState } from 'react';
import CustomerForm from '../components/CustomerForm';
import ServiceSelector from '../components/ServiceSelector';
import { Calendar, QrCode, ArrowRight, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';

const Reception = () => {
  const [customer, setCustomer] = useState({ name: '', idType: 'CEDULA', id: '', phone: '', email: '' });
  const [selectedServices, setSelectedServices] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [ticketGenerated, setTicketGenerated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ticketUuid, setTicketUuid] = useState(null);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const updateQuantity = (service, change) => {
    setSelectedServices(prev => {
      const existing = prev.find(s => s.id === service.id);
      if (existing) {
        const newQty = Math.max(0, existing.qty + change);
        if (newQty === 0) return prev.filter(s => s.id !== service.id);
        return prev.map(s => s.id === service.id ? { ...s, qty: newQty } : s);
      } else if (change > 0) {
        return [...prev, { ...service, qty: 1 }];
      }
      return prev;
    });
    setError('');
  };

  const handleGenerateTicket = async () => {
    setError('');
    
    if (!customer.name || !customer.id || !customer.phone || !customer.email || !deliveryDate) {
      setError("Por favor, complete todos los datos del cliente y la fecha de entrega.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      setError("El correo electrónico ingresado no tiene un formato válido.");
      return;
    }

    if (selectedServices.length === 0) {
      setError("Debe agregar al menos un servicio con cantidad mayor a cero.");
      return;
    }

    const payload = {
      cliente: {
        nombre: customer.name,
        cedula_ruc: customer.id,
        telefono: customer.phone,
        email: customer.email
      },
      pedido: {
        fecha_entrega_limite: new Date(deliveryDate).toISOString(),
        observaciones: observaciones || "Sin observaciones",
        id_usuario: 1
      },
      detalles: selectedServices.map(s => ({
        id_servicio: s.id,
        cantidad: s.qty,
        subtotal_servicio: Number((s.price * s.qty).toFixed(2))
      }))
    };

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8080/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al conectar con el servidor.');
      }

      setTicketUuid(data.uuidTicket);
      setTicketGenerated(true);
      
      setTimeout(() => {
        setTicketGenerated(false);
        setCustomer({ name: '', idType: 'CEDULA', id: '', phone: '', email: '' });
        setSelectedServices([]);
        setDeliveryDate('');
        setObservaciones('');
        setTicketUuid(null);
        setIsSubmitting(false);
      }, 4000);

    } catch (err) {
      setIsSubmitting(false);
      setError("Fallo la conexión: " + err.message);
    }
  };

  const subtotal = selectedServices.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  const taxes = subtotal * 0.15;
  const total = subtotal + taxes;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recepción de Pedidos</h1>
        <p className="text-slate-500 mt-2 text-lg">Registre los datos del cliente y los servicios solicitados para generar un nuevo ticket.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CustomerForm customer={customer} setCustomer={setCustomer} />
          
          <ServiceSelector selectedServices={selectedServices} updateQuantity={updateQuantity} />
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <div className="bg-primary-100 p-2 rounded-lg">
                <Calendar size={20} className="text-primary-600" />
              </div>
              Entrega y Detalles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha Estimada de Entrega</label>
                <input
                  type="datetime-local"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={getMinDateTime()}
                  className="w-full pl-4 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1"><MessageSquare size={16}/> Observaciones Especiales</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white h-[50px]"
                  placeholder="Ej. Entregar en funda extra"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary-100 sticky top-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Resumen del Pedido</h2>
            
            <div className="space-y-4 mb-6 min-h-[150px]">
              {selectedServices.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-8">
                  <div className="p-3 bg-slate-50 rounded-full">
                    <QrCode size={24} className="opacity-50" />
                  </div>
                  <p className="text-sm italic">Agregue servicios usando el botón +</p>
                </div>
              ) : (
                selectedServices.map(service => (
                  <div key={service.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-bold">{service.name}</span>
                      <span className="text-slate-500 text-xs">{service.qty} {service.qty === 1 ? 'unidad' : 'unidades'} x ${service.price.toFixed(2)}</span>
                    </div>
                    <span className="text-slate-900 font-bold">${(service.price * service.qty).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
            
            <div className="border-t border-slate-100 pt-6 mb-6 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-700 font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">IVA (15%)</span>
                <span className="text-slate-700 font-semibold">${taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-slate-50">
                <span className="text-slate-800 font-bold">Total Final</span>
                <span className="text-4xl font-extrabold text-primary-600">${total.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerateTicket}
              disabled={isSubmitting || ticketGenerated || selectedServices.length === 0 || !customer.name || !customer.id || !customer.phone || !customer.email || !deliveryDate}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                ticketGenerated 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                  : (isSubmitting || selectedServices.length === 0 || !customer.name || !customer.id || !customer.phone || !customer.email || !deliveryDate)
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-600/40 transform hover:-translate-y-1'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Procesando...
                </>
              ) : ticketGenerated ? (
                <>
                  <CheckCircle2 size={24} className="animate-bounce" />
                  Pedido Generado
                </>
              ) : (
                <>
                  <QrCode size={24} />
                  Confirmar Pedido
                  <ArrowRight size={20} className="ml-1" />
                </>
              )}
            </button>
            
            {ticketGenerated && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-center text-xs border border-emerald-100 animate-in slide-in-from-bottom-2 fade-in">
                <p className="font-bold mb-1">¡Ticket Registrado en Base de Datos!</p>
                <p className="font-mono text-emerald-600 text-[10px] break-all">{ticketUuid}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reception;
