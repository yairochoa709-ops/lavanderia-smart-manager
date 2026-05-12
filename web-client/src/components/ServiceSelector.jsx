import React from 'react';
import { Shirt, Scale, Wind, Layers } from 'lucide-react';

const servicesList = [
  { id: 'dry', name: 'Lavado en Seco', icon: Wind, price: 5.50 },
  { id: 'weight', name: 'Por Peso', icon: Scale, price: 1.50 },
  { id: 'ironing', name: 'Planchado', icon: Shirt, price: 2.00 },
];

const ServiceSelector = ({ selectedServices, toggleService }) => {
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
          const isSelected = selectedServices.some(s => s.id === service.id);
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              onClick={() => toggleService(service)}
              className={`cursor-pointer border-2 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 transition-all duration-300 transform hover:-translate-y-1 ${
                isSelected 
                  ? 'border-primary-500 bg-primary-50/40 shadow-lg shadow-primary-500/10' 
                  : 'border-slate-100 hover:border-primary-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-4 rounded-full transition-colors duration-300 ${
                isSelected 
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/40' 
                  : 'bg-slate-100 text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600'
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceSelector;
