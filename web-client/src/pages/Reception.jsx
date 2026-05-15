import React, { useState, useEffect } from 'react';
import CustomerForm from '../components/CustomerForm';
import ServiceSelector from '../components/ServiceSelector';
import { Calendar, QrCode, ArrowRight, CheckCircle2, MessageSquare, Loader2, X, Wind } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Reception = () => {
  const [customer, setCustomer] = useState({ name: '', idType: 'CEDULA', id: '', phone: '', email: '' });
  const [selectedServices, setSelectedServices] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [ticketGenerated, setTicketGenerated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ticketUuid, setTicketUuid] = useState(null);
  
  // Nuevos estados para Especificaciones de Carga
  const [clasificacion, setClasificacion] = useState('Blanca');
  const [ciclo, setCiclo] = useState('Normal');
  const [totalPrendas, setTotalPrendas] = useState(1);
  const [insumos, setInsumos] = useState([]);
  
  // Seguridad: Quitar cloro si no es ropa blanca
  useEffect(() => {
    if (clasificacion !== 'Blanca' && insumos.includes('Cloro')) {
      setInsumos(prev => prev.filter(i => i !== 'Cloro'));
    }
  }, [clasificacion]);
  
  // Estado para el modal del QR genérico
  const [showQrModal, setShowQrModal] = useState(false);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const updateQuantity = (service, change, isAbsolute = false) => {
    setSelectedServices(prev => {
      const existing = prev.find(s => s.id === service.id);
      if (existing) {
        const newQty = isAbsolute ? change : Math.max(0, existing.qty + change);
        if (newQty === 0) return prev.filter(s => s.id !== service.id);
        return prev.map(s => s.id === service.id ? { ...s, qty: newQty } : s);
      } else if (change > 0) {
        return [...prev, { ...service, qty: change }];
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

    // Handoff de Datos: Formateo Estructurado para el Backend
    const weightService = selectedServices.find(s => s.id === 2);
    const weightVal = weightService ? weightService.qty : 0;
    const strInsumos = insumos.join(", ") || "Ninguno";
    
    const infoEstructurada = `[DETALLE: ${weightVal} Kg | ${totalPrendas} pcs | ${clasificacion}] [CICLO: ${ciclo}] [INSUMOS: ${strInsumos}] | Obs. Especiales: ${observaciones || "Sin notas adicionales"}`;

    const payload = {
      cliente: {
        nombre: customer.name,
        cedula_ruc: customer.id,
        telefono: customer.phone,
        email: customer.email
      },
      pedido: {
        fecha_entrega_limite: new Date(deliveryDate).toISOString(),
        observaciones: infoEstructurada,
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
      
      // Restauramos el comportamiento rápido (limpieza en 4 segundos)
      setTimeout(() => {
        setTicketGenerated(false);
        setCustomer({ name: '', idType: 'CEDULA', id: '', phone: '', email: '' });
        setSelectedServices([]);
        setDeliveryDate('');
        setObservaciones('');
        setClasificacion('Blanca');
        setCiclo('Normal');
        setTotalPrendas(1);
        setInsumos([]);
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

  const staticTrackingUrl = `${import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173'}/seguimiento`;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 relative">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recepción de Pedidos</h1>
          <p className="text-slate-500 mt-2 text-lg">Registre los datos del cliente y los servicios solicitados para generar un nuevo ticket.</p>
        </div>
        <button
          onClick={() => setShowQrModal(true)}
          className="bg-white border border-primary-200 text-primary-700 hover:bg-primary-50 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <QrCode size={20} />
          Mostrar Portal QR
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CustomerForm customer={customer} setCustomer={setCustomer} />
          
          <ServiceSelector selectedServices={selectedServices} updateQuantity={updateQuantity} />
          
          {/* Nueva Sección: Especificaciones de Carga */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <div className="bg-primary-100 p-2 rounded-lg">
                <Wind size={20} className="text-primary-600" />
              </div>
              Especificaciones de Carga
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Clasificación de Ropa</label>
                <div className="flex flex-wrap gap-2">
                  {['Blanca', 'Color/Oscura', 'Mixta'].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setClasificacion(tipo)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                        clasificacion === tipo
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Ciclo de Lavado</label>
                <select
                  value={ciclo}
                  onChange={(e) => setCiclo(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white font-medium text-sm"
                >
                  <option value="Normal">Normal</option>
                  <option value="Delicado">Delicado</option>
                  <option value="Pesado">Pesado / Edredones</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Total de Prendas</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-full">
                  <input
                    type="number"
                    min="1"
                    value={totalPrendas}
                    onChange={(e) => setTotalPrendas(parseInt(e.target.value) || 1)}
                    className="bg-transparent outline-none font-bold text-slate-700 w-full text-center"
                    placeholder="0 pcs"
                  />
                  <span className="text-slate-400 font-bold text-xs uppercase">pcs</span>
                </div>
              </div>
            </div>

            {/* Preferencias de Insumos */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                Preferencias de Insumos
                <span className="text-[10px] bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Opcional</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {['Detergente Extra', 'Suavizante', 'Cloro', 'Quitamanchas'].map((insumo) => {
                  const isCloro = insumo === 'Cloro';
                  const isDisabled = isCloro && (clasificacion === 'Color/Oscura' || clasificacion === 'Mixta');
                  const isActive = insumos.includes(insumo) && !isDisabled;
                  
                  return (
                    <button
                      key={insumo}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        setInsumos(prev => 
                          prev.includes(insumo) 
                            ? prev.filter(i => i !== insumo) 
                            : [...prev, insumo]
                        );
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 flex items-center gap-2 ${
                        isActive
                          ? 'border-primary-500 bg-primary-600 text-white shadow-lg shadow-primary-600/20 scale-105'
                          : isDisabled
                            ? 'border-slate-50 bg-slate-50 text-slate-300 cursor-not-allowed opacity-50'
                            : 'border-slate-100 bg-white text-slate-500 hover:border-primary-200 hover:bg-slate-50'
                      }`}
                    >
                      {isActive && <CheckCircle2 size={14} className="animate-in zoom-in" />}
                      {insumo}
                    </button>
                  );
                })}
              </div>
              {clasificacion !== 'Blanca' && (
                <p className="text-[10px] text-amber-600 mt-3 font-medium flex items-center gap-1 italic">
                  * El uso de cloro está restringido para prendas de color o mixtas.
                </p>
              )}
            </div>
          </div>
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

      {/* Modal QR Genérico */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center">
              <div className="bg-primary-50 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Portal de Seguimiento</h3>
              <p className="text-slate-500 mb-8">Escanee este código para acceder al portal público.</p>
              
              <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-slate-100 mb-6 inline-block">
                <QRCodeSVG 
                  value={staticTrackingUrl} 
                  size={200} 
                  level="H" 
                  includeMargin={false} 
                />
              </div>
              
              <p className="text-sm text-slate-400 bg-slate-50 py-3 px-4 rounded-xl">
                El cliente deberá ingresar su <strong className="text-slate-700">cédula</strong> en el portal para ver su pedido.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reception;
