import React, { useState } from 'react';
import CustomerForm from '../components/CustomerForm';
import ServiceSelector from '../components/ServiceSelector';
import { Calendar, QrCode, ArrowRight, CheckCircle2 } from 'lucide-react';

const Reception = () => {
  const [customer, setCustomer] = useState({ name: '', idType: 'CEDULA', id: '', phone: '' });
  const [selectedServices, setSelectedServices] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [ticketGenerated, setTicketGenerated] = useState(false);

  // Generar fecha mínima para evitar seleccionar fechas pasadas
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const toggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleGenerateTicket = () => {
    if (!customer.name || !customer.id || !customer.phone || selectedServices.length === 0 || !deliveryDate) {
      alert("Por favor, complete todos los campos obligatorios (Cliente, Servicios y Fecha de Entrega).");
      return;
    }

    const ticketData = {
      customer: { ...customer },
      services: selectedServices.map(s => ({ id: s.id, name: s.name, price: s.price })),
      financials: {
        subtotal: Number(subtotal.toFixed(2)),
        taxRate: 0.15,
        taxes: Number(taxes.toFixed(2)),
        total: Number(total.toFixed(2))
      },
      estimatedDeliveryDate: new Date(deliveryDate).toISOString(),
      status: "PENDIENTE",
      createdAt: new Date().toISOString()
    };

    console.log("=== TICKET GENERADO (JSON LISTO PARA ENVIAR AL BACKEND JAVA) ===");
    console.log(JSON.stringify(ticketData, null, 2));

    // Simulate ticket generation delay for UI
    setTicketGenerated(true);
    setTimeout(() => {
      setTicketGenerated(false);
      setCustomer({ name: '', idType: 'CEDULA', id: '', phone: '' });
      setSelectedServices([]);
      setDeliveryDate('');
    }, 3000);
  };

  const subtotal = selectedServices.reduce((acc, curr) => acc + curr.price, 0);
  const taxes = subtotal * 0.15; // IVA 15%
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
          <ServiceSelector selectedServices={selectedServices} toggleService={toggleService} />
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <div className="bg-primary-100 p-2 rounded-lg">
                <Calendar size={20} className="text-primary-600" />
              </div>
              Entrega Estimada
            </h2>
            <div className="relative group max-w-sm">
              <input
                type="datetime-local"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={getMinDateTime()}
                className="w-full pl-4 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white font-medium"
                required
              />
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
                  <p className="text-sm italic">No hay servicios seleccionados</p>
                </div>
              ) : (
                selectedServices.map(service => (
                  <div key={service.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-700 font-semibold">{service.name}</span>
                    <span className="text-slate-900 font-bold">${service.price.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
            
            <div className="border-t border-slate-100 pt-6 mb-8 space-y-3">
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

            <button
              onClick={handleGenerateTicket}
              disabled={ticketGenerated || selectedServices.length === 0 || !customer.name || !customer.id || !customer.phone || !deliveryDate}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                ticketGenerated 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                  : selectedServices.length === 0 || !customer.name || !customer.id || !customer.phone || !deliveryDate
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-600/40 transform hover:-translate-y-1'
              }`}
            >
              {ticketGenerated ? (
                <>
                  <CheckCircle2 size={24} className="animate-bounce" />
                  Ticket Generado
                </>
              ) : (
                <>
                  <QrCode size={24} />
                  Generar Ticket
                  <ArrowRight size={20} className="ml-1" />
                </>
              )}
            </button>
            
            {ticketGenerated && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-center text-sm font-medium border border-emerald-100 animate-pulse">
                Enlace único generado y listo para enviar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reception;
