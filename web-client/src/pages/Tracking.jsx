import React, { useState } from 'react';
import { Search, MapPin, CheckCircle2, Clock, Package, MessageCircle, AlertCircle, ArrowLeft, Droplets, Calendar, Loader2 } from 'lucide-react';

// Cada step.id corresponde al id_estado de la tabla estado_proceso
const steps = [
  { id: 1, label: 'Recibido', icon: Package },
  { id: 2, label: 'En Proceso', icon: Clock },
  { id: 3, label: 'Listo para Retiro', icon: MapPin },
  { id: 4, label: 'Entregado', icon: CheckCircle2 }
];

const PENALTY_PER_DAY = 0.50;

const Tracking = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError('');
    setOrderData(null);

    try {
      const backendUrl = `http://${window.location.hostname}:8080/api/public/seguimiento/${encodeURIComponent(searchTerm)}`;
      const response = await fetch(backendUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
           throw new Error('No pudimos encontrar un pedido con ese número de seguimiento o cédula. Por favor, verifica e intenta de nuevo.');
        } else {
           throw new Error('Error al conectar con el servidor.');
        }
      }

      const data = await response.json();
      setOrderData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePenalty = (estimatedDateString, status, idEstado) => {
    if (status === 'ENTREGADO' || idEstado === 4) return { daysLate: 0, penaltyAmount: 0 };

    const estimatedDate = new Date(estimatedDateString);
    const currentDate = new Date();
    
    const est = new Date(estimatedDate.getFullYear(), estimatedDate.getMonth(), estimatedDate.getDate());
    const curr = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    const diffTime = curr - est;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays > 0 && (status === 'LISTO' || idEstado === 3)) {
      return { daysLate: diffDays, penaltyAmount: diffDays * PENALTY_PER_DAY };
    }
    
    return { daysLate: 0, penaltyAmount: 0 };
  };

  // Usamos el idEstado numérico para una comparación exacta e inequívoca
  const getStepStatus = (currentIdEstado, stepId) => {
    const currentId = currentIdEstado ?? 1;
    if (stepId < currentId) return 'completed';
    if (stepId === currentId) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative">
      {/* Botón oculto para regresar al Admin (Solo Demo) */}
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm z-50 transition-colors"
        title="Volver a la vista de Administrador"
      >
        <ArrowLeft size={16} /> Volver al Admin
      </button>

      {/* Header Público */}
      <header className="bg-primary-900 text-white py-6 shadow-md relative z-10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl text-primary-600 shadow-sm">
              <Droplets size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">Smart<span className="font-light">Manager</span></h1>
              <p className="text-primary-200 text-sm">Tu ropa limpia, siempre a tiempo.</p>
            </div>
          </div>
          <a href="https://wa.me/593999999999" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-full font-bold transition-colors shadow-sm">
            <MessageCircle size={18} />
            Contacto WhatsApp
          </a>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col">
        {!orderData && (
          <div className="text-center max-w-xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Sigue tu pedido en tiempo real</h2>
            <p className="text-slate-500 text-lg mb-8">Ingresa tu número de ticket de seguimiento o cédula para conocer el estado exacto de tus prendas.</p>
            
            <form onSubmit={handleSearch} className="relative shadow-xl rounded-2xl">
              <input
                type="text"
                placeholder="Ej. c2f4a1... o 0912345678"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
                className="w-full pl-6 pr-40 py-5 text-lg border-2 border-primary-100 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-700 bg-white shadow-sm"
              />
              <button 
                type="submit"
                disabled={isLoading || !searchTerm.trim()}
                className={`absolute right-2 top-2 bottom-2 px-6 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${
                  isLoading || !searchTerm.trim() 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                <span className="hidden sm:inline">{isLoading ? 'Buscando...' : 'Buscar'}</span>
              </button>
            </form>
            
            {error && (
              <p className="mt-4 text-red-500 bg-red-50 py-3 px-4 rounded-xl text-sm font-medium border border-red-100 flex items-center justify-center gap-2 animate-in shake duration-300">
                <AlertCircle size={18} />
                {error}
              </p>
            )}
          </div>
        )}

        {orderData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
              <div>
                <button onClick={() => { setOrderData(null); setSearchTerm(''); }} className="text-primary-600 hover:text-primary-800 text-sm font-bold flex items-center gap-1 mb-4 transition-colors">
                  <ArrowLeft size={16} /> Nueva Búsqueda
                </button>
                <h2 className="text-3xl font-extrabold text-slate-900">Ticket Público</h2>
                <p className="text-slate-500 text-xs font-mono break-all mt-1">{orderData.idTicket}</p>
                <p className="text-slate-500 text-lg mt-2">Hola, <span className="font-semibold text-slate-700">{orderData.nombreCliente}</span></p>
              </div>
              <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha de Entrega Pactada</p>
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
                  <Calendar size={20} className="text-primary-600" />
                  {new Date(orderData.fechaEntregaPactada).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>
              
              <div className="relative flex flex-col sm:flex-row justify-between mt-4">
                {/* Connecting lines for desktop */}
                <div className="hidden sm:block absolute top-6 left-12 right-12 h-1 bg-slate-100 -z-10 rounded-full"></div>
                
                {steps.map((step, index) => {
                  const status = getStepStatus(orderData.idEstado, step.id);
                  const Icon = step.icon;
                  
                  let iconBg = 'bg-slate-100 text-slate-400';
                  let iconRing = 'ring-8 ring-white';
                  let textClass = 'text-slate-400';
                  
                  if (status === 'completed') {
                    iconBg = 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30';
                    textClass = 'text-emerald-700 font-bold';
                  } else if (status === 'current') {
                    iconBg = 'bg-primary-600 text-white shadow-lg shadow-primary-600/40 animate-pulse';
                    iconRing = 'ring-8 ring-primary-50';
                    textClass = 'text-primary-700 font-extrabold';
                  }

                  return (
                    <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-3 relative z-10 mb-8 sm:mb-0">
                      {/* Connecting line for mobile */}
                      {index !== steps.length - 1 && <div className="sm:hidden absolute top-12 left-6 w-0.5 h-16 bg-slate-100 -z-10"></div>}
                      
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${iconBg} ${iconRing}`}>
                        <Icon size={24} strokeWidth={status === 'current' ? 2.5 : 2} />
                      </div>
                      <div className="sm:text-center">
                        <p className={`text-sm sm:text-base transition-colors duration-500 ${textClass}`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alerta de Recargo */}
            {(() => {
              const { daysLate, penaltyAmount } = calculatePenalty(orderData.fechaEntregaPactada, orderData.estadoActual, orderData.idEstado);
              if (daysLate > 0) {
                return (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl mb-8 flex items-start gap-4 shadow-sm animate-in fade-in duration-500">
                    <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-900 mb-1">Tu pedido está listo, pero tiene retraso en el retiro</h3>
                      <p className="text-amber-800 mb-3">
                        Han pasado {daysLate} días desde la fecha pactada para retirar tu pedido. Según nuestras políticas, se ha aplicado un recargo por permanencia en bodega.
                      </p>
                      <div className="inline-block bg-white px-4 py-2 rounded-xl border border-amber-200 font-bold text-amber-900 shadow-sm">
                        Recargo estimado: +${penaltyAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Resumen de Servicios */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                  <Package size={18} className="text-slate-400" />
                  Prendas en este ticket
                </h3>
                <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold border border-primary-100">
                  Total: ${orderData.totalFinal.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {orderData.servicios.map((service, idx) => (
                  <span key={idx} className="bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 flex items-center gap-2">
                    <span className="font-bold">{service.cantidad}x</span> {service.nombre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Público */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <div className="max-w-4xl mx-auto px-6">
          <p>© {new Date().getFullYear()} Lavandería SmartManager. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Tracking;
