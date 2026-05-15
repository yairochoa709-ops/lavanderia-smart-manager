import React from 'react';
import { Shirt, Scale, Wind, Layers, Plus, Minus } from 'lucide-react';

// IDs actualizados para simular llaves foráneas de la BD
const servicesList = [
  { id: 1, name: 'Lavado en Seco', icon: Wind, price: 5.50 },
  { id: 2, name: 'Por Peso', icon: Scale, price: 1.50 },
  { id: 3, name: 'Planchado', icon: Shirt, price: 2.00 },
];

const ServiceSelector = ({ selectedServices, updateQuantity }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
      <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
        <div className="bg-primary-100 p-2 rounded-lg">
          <Layers size={20} className="text-primary-600" />
        </div>
        Selección de Servicios
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {servicesList.map((service) => {
          const selectedItem = selectedServices.find(s => s.id === service.id);
          const qty = selectedItem ? selectedItem.qty : 0;
          const isSelected = qty > 0;
          const Icon = service.icon;
          const isWeightService = service.id === 2;

          return (
            <div
              key={service.id}
              className={`border-2 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                isSelected 
                  ? 'border-primary-500 bg-primary-50/40 shadow-lg shadow-primary-500/10' 
                  : 'border-slate-100 bg-slate-50'
              }`}
            >
              <div className={`p-4 rounded-full transition-colors duration-300 ${
                isSelected 
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/40' 
                  : 'bg-white text-slate-500 shadow-sm'
              }`}>
                <Icon size={32} strokeWidth={isSelected ? 2.5 : 2} />
              </div>
              <div className="text-center">
                <h3 className={`font-bold text-lg ${isSelected ? 'text-primary-900' : 'text-slate-700'}`}>
                  {service.name}
                </h3>
                <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  isSelected ? 'bg-white text-primary-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  Base: ${service.price.toFixed(2)}
                </div>
              </div>
              
              {/* Controles de cantidad o Peso */}
              {isWeightService ? (
                <div className="flex flex-col items-center gap-1 w-full">
                  <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-100 p-2 w-full max-w-[140px]">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.0 Kg"
                      value={qty || ''}
                      onChange={(e) => updateQuantity(service, parseFloat(e.target.value) || 0, true)}
                      className="w-full text-center font-bold text-lg text-slate-800 outline-none bg-transparent"
                    />
                    <span className="text-slate-400 font-bold text-xs uppercase">Kg</span>
                  </div>
                  {qty > 0 && (
                    <span className="text-[10px] text-primary-600 font-bold animate-in fade-in slide-in-from-top-1">
                      Subtotal: ${(qty * service.price).toFixed(2)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-2 bg-white rounded-xl shadow-sm border border-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(service, -1)}
                    disabled={qty === 0}
                    className={`p-2 rounded-lg transition-colors ${qty > 0 ? 'text-slate-600 hover:bg-slate-100 active:scale-95' : 'text-slate-300 cursor-not-allowed'}`}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="font-bold w-8 text-center text-xl text-slate-800">{qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(service, 1)}
                    className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 active:scale-95 transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceSelector;
