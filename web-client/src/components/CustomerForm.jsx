import React from 'react';
import { User, CreditCard, Phone } from 'lucide-react';

const CustomerForm = ({ customer, setCustomer }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'id' || name === 'phone') {
      // Allow empty string or only numbers
      if (value !== '' && !/^\d+$/.test(value)) return;
    }

    if (name === 'id') {
      const maxLength = customer.idType === 'RUC' ? 13 : 10;
      if (value.length > maxLength) return;
    }

    if (name === 'idType') {
      const newMaxLength = value === 'RUC' ? 13 : 10;
      setCustomer(prev => ({ 
        ...prev, 
        [name]: value,
        id: prev.id.length > newMaxLength ? prev.id.slice(0, newMaxLength) : prev.id 
      }));
      return;
    }

    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
      <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
        <div className="bg-primary-100 p-2 rounded-lg">
          <User size={20} className="text-primary-600" />
        </div>
        Datos del Cliente
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
              <User size={18} />
            </div>
            <input
              type="text"
              name="name"
              value={customer.name}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
              placeholder="Ej. Juan Pérez"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-semibold text-slate-700">Identificación</label>
            <select
              name="idType"
              value={customer.idType || 'CEDULA'}
              onChange={handleChange}
              className="text-xs font-semibold px-2 py-0.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-slate-600 bg-slate-50 focus:bg-white cursor-pointer transition-colors"
            >
              <option value="CEDULA">Cédula</option>
              <option value="RUC">RUC</option>
            </select>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
              <CreditCard size={18} />
            </div>
            <input
              type="text"
              name="id"
              value={customer.id}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
              placeholder={customer.idType === 'RUC' ? "13 dígitos" : "10 dígitos"}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
              <Phone size={18} />
            </div>
            <input
              type="text"
              name="phone"
              value={customer.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
              placeholder="Ej. 0991234567"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
