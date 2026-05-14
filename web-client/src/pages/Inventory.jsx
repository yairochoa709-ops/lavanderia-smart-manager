import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, TrendingUp, Plus, Minus, X, CheckCircle2 } from 'lucide-react';

const initialInventory = [
  { id: 1, name: 'Detergente Líquido Industrial', currentQty: 15, unit: 'Litros', minStock: 20 },
  { id: 2, name: 'Suavizante Floral', currentQty: 45, unit: 'Litros', minStock: 15 },
  { id: 3, name: 'Desmanchador Clorado', currentQty: 5, unit: 'Litros', minStock: 10 },
  { id: 4, name: 'Bolsas Plásticas Grandes', currentQty: 150, unit: 'Unidades', minStock: 200 },
  { id: 5, name: 'Perchas de Alambre', currentQty: 500, unit: 'Unidades', minStock: 100 },
  { id: 6, name: 'Quitamanchas Premium', currentQty: 18, unit: 'Litros', minStock: 15 },
];

const Inventory = () => {
  const [inventory, setInventory] = useState(initialInventory);
  
  // Modal & Toast States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    unit: 'Unidades',
    currentQty: '',
    minStock: ''
  });

  // Cerrar modal con la tecla Esc
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleStockChange = (id, change) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.currentQty + change);
        return { ...item, currentQty: newQty };
      }
      return item;
    }));
  };

  const getStatus = (item) => {
    if (item.currentQty <= item.minStock) return 'critical';
    if (item.currentQty <= item.minStock * 1.5) return 'warning';
    return 'ok';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name.trim() || formData.currentQty === '' || formData.minStock === '') {
      return; // El form de HTML5 requerirá los campos de todos modos, esto es doble seguridad.
    }

    setInventory(prev => [...prev, {
      id: Date.now(),
      name: formData.name,
      unit: formData.unit,
      currentQty: parseInt(formData.currentQty),
      minStock: parseInt(formData.minStock)
    }]);

    setIsModalOpen(false);
    setFormData({ name: '', unit: 'Unidades', currentQty: '', minStock: '' });
    
    // Mostrar Toast
    setToastMessage('Suministro agregado exitosamente');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const totalProducts = inventory.length;
  const criticalProducts = inventory.filter(item => getStatus(item) === 'critical').length;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 right-8 z-50 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right-8 fade-in duration-300">
          <CheckCircle2 size={24} />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Modal Component */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
             onClick={() => setIsModalOpen(false)}>
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()} // Evitar que el clic dentro del modal lo cierre
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <div className="bg-primary-100 p-2 rounded-lg text-primary-600">
                  <Package size={20} />
                </div>
                Nuevo Suministro
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Producto</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej. Detergente Suave"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Unidad de Medida</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 bg-white"
                  >
                    <option value="Litros">Litros</option>
                    <option value="Kilogramos">Kilogramos</option>
                    <option value="Unidades">Unidades</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Stock Inicial</label>
                  <input
                    type="number"
                    name="currentQty"
                    min="0"
                    required
                    value={formData.currentQty}
                    onChange={handleInputChange}
                    placeholder="Ej. 50"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Punto de Reorden (Alerta)</label>
                <input
                  type="number"
                  name="minStock"
                  min="1"
                  required
                  value={formData.minStock}
                  onChange={handleInputChange}
                  placeholder="Stock mínimo para recibir alerta"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all"
                >
                  Agregar Suministro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventario de Suministros</h1>
          <p className="text-slate-500 mt-2 text-lg">Gestione los niveles de stock y reciba alertas tempranas de reabastecimiento.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Nuevo Suministro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md">
          <div className="p-4 bg-primary-50 text-primary-600 rounded-full">
            <Package size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Productos</p>
            <p className="text-4xl font-extrabold text-slate-800 mt-1">{totalProducts}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md">
          <div className="p-4 bg-red-50 text-red-600 rounded-full">
            <AlertTriangle size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Alerta Crítica</p>
            <p className="text-4xl font-extrabold text-red-600 mt-1">{criticalProducts}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Último Abasto</p>
            <p className="text-xl font-bold text-slate-800 mt-1">Hoy, 09:30 AM</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-5 font-semibold">Producto</th>
                <th className="p-5 font-semibold">Stock Actual</th>
                <th className="p-5 font-semibold">Punto Reorden</th>
                <th className="p-5 font-semibold">Estado</th>
                <th className="p-5 font-semibold text-center">Gestión Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inventory.map((item) => {
                const status = getStatus(item);
                let rowBg = '';
                let statusBadge = null;

                if (status === 'critical') {
                  rowBg = 'bg-red-50/40';
                  statusBadge = <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><AlertTriangle size={14}/> Crítico</span>;
                } else if (status === 'warning') {
                  rowBg = 'bg-amber-50/40';
                  statusBadge = <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200"><AlertTriangle size={14}/> Preventivo</span>;
                } else {
                  statusBadge = <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle size={14}/> Óptimo</span>;
                }

                return (
                  <tr key={item.id} className={`${rowBg} hover:bg-slate-50 transition-colors group`}>
                    <td className="p-5">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{item.unit}</p>
                    </td>
                    <td className="p-5">
                      <span className={`text-2xl font-extrabold ${status === 'critical' ? 'text-red-600' : status === 'warning' ? 'text-amber-600' : 'text-slate-800'}`}>
                        {item.currentQty}
                      </span>
                    </td>
                    <td className="p-5 text-slate-500 font-semibold text-lg">
                      {item.minStock}
                    </td>
                    <td className="p-5">
                      {statusBadge}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleStockChange(item.id, -1)}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm active:scale-90 active:bg-red-100"
                          title="Consumir 1 unidad"
                        >
                          <Minus size={18} />
                        </button>
                        <button 
                          onClick={() => handleStockChange(item.id, 1)}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm active:scale-90 active:bg-emerald-100"
                          title="Ingresar 1 unidad"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
