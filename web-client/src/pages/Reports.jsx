import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, ShoppingBag, AlertTriangle, DollarSign, Calendar as CalendarIcon, Filter } from 'lucide-react';

// --- MOCK DATA ---
const generateMockTransactions = () => {
  const transactions = [];
  const today = new Date();
  
  for (let i = 0; i < 45; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - Math.floor(Math.random() * 30)); // Últimos 30 días
    
    const isPenalty = Math.random() > 0.8;
    const penaltyAmount = isPenalty ? Math.floor(Math.random() * 5) + 1 : 0;
    const servicesTotal = Math.floor(Math.random() * 30) + 10;
    const totalAmount = servicesTotal + penaltyAmount;
    const iva = totalAmount * 0.15;
    
    transactions.push({
      id: `TRX-${2026000 + i}`,
      date: date.toISOString(),
      amount: Number((totalAmount + iva).toFixed(2)),
      penalty: Number(penaltyAmount.toFixed(2)),
      method: Math.random() > 0.4 ? 'Efectivo' : 'Transferencia',
      customer: `Cliente ${i+1}`
    });
  }
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const mockTransactions = generateMockTransactions();

// Datos para gráficos
const last7DaysData = [
  { name: 'Lun', ingresos: 125.50 },
  { name: 'Mar', ingresos: 210.00 },
  { name: 'Mié', ingresos: 180.75 },
  { name: 'Jue', ingresos: 240.20 },
  { name: 'Vie', ingresos: 310.00 },
  { name: 'Sáb', ingresos: 450.50 },
  { name: 'Dom', ingresos: 190.00 },
];

const serviceDistributionData = [
  { name: 'Lavado por Peso', value: 45 },
  { name: 'Lavado en Seco', value: 30 },
  { name: 'Planchado', value: 15 },
  { name: 'Desmanchado Especial', value: 10 },
];
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];


const Reports = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Cálculos de KPIs basados en la data mockeada
  const kpis = useMemo(() => {
    let totalRevenue = 0;
    let totalPenalty = 0;
    
    mockTransactions.forEach(t => {
      totalRevenue += t.amount;
      totalPenalty += t.penalty;
    });

    return {
      totalRevenue,
      totalOrders: mockTransactions.length,
      totalPenalty,
      inventoryAlerts: 3 // Dato estático para demostración, vendría del backend
    };
  }, []);

  // Formateador de moneda para gráficos
  const formatCurrency = (value) => `$${value}`;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reportes y Estadísticas</h1>
          <p className="text-slate-500 mt-2 text-lg">Analice el rendimiento financiero y operativo de la lavandería.</p>
        </div>
        
        {/* Filtros de Fecha */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 px-3">
            <CalendarIcon size={18} className="text-slate-400" />
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="outline-none text-sm font-medium text-slate-700 bg-transparent"
            />
          </div>
          <span className="text-slate-300">-</span>
          <div className="flex items-center gap-2 px-3">
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="outline-none text-sm font-medium text-slate-700 bg-transparent"
            />
          </div>
          <button className="bg-primary-50 text-primary-600 p-2 rounded-lg hover:bg-primary-100 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* KPIs Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md group">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Ingresos del Mes</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">${kpis.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md group">
          <div className="p-4 bg-primary-50 text-primary-600 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Pedidos</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{kpis.totalOrders}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md group">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Ingresos x Recargo</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">${kpis.totalPenalty.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md group">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-colors">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Alertas Inventario</p>
            <p className="text-3xl font-extrabold text-red-600 mt-1">{kpis.inventoryAlerts}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico de Barras */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ingresos Últimos 7 Días</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCurrency} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Ingresos']}
                />
                <Bar dataKey="ingresos" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pastel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Distribución de Servicios</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {serviceDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value}%`, 'Popularidad']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de Resumen de Transacciones */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Transacciones Recientes</h3>
          <button className="text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors">
            Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-5 font-bold">ID Transacción</th>
                <th className="p-5 font-bold">Fecha y Hora</th>
                <th className="p-5 font-bold">Cliente</th>
                <th className="p-5 font-bold">Método de Pago</th>
                <th className="p-5 font-bold text-right">Recargos</th>
                <th className="p-5 font-bold text-right">Monto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockTransactions.slice(0, 10).map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5">
                    <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-sm">{trx.id}</span>
                  </td>
                  <td className="p-5 text-sm text-slate-600">
                    {new Date(trx.date).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="p-5 text-sm font-medium text-slate-700">
                    {trx.customer}
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      trx.method === 'Efectivo' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {trx.method}
                    </span>
                  </td>
                  <td className="p-5 text-right text-sm">
                    {trx.penalty > 0 ? (
                      <span className="text-amber-600 font-bold">+${trx.penalty.toFixed(2)}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-5 text-right font-extrabold text-slate-800">
                    ${trx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
