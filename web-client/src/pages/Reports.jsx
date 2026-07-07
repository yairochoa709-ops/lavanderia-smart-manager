import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, ShoppingBag, AlertTriangle, DollarSign, Calendar as CalendarIcon, Filter, RefreshCw, ChevronDown, Download, FileText, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

const Reports = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Cargar transacciones reales del backend
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const backendBase = `http://${window.location.hostname}:8080`;
      const response = await fetch(`${backendBase}/api/facturas`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        toast.error('Error al cargar historial de transacciones');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('No se pudo conectar al servidor para los reportes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filtrar transacciones por rango de fechas
  const filteredTransactions = useMemo(() => {
    return transactions.filter(trx => {
      // Usar hora local para evitar saltos de día por zona horaria UTC
      const d = new Date(trx.fechaEmision);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const trxDate = `${year}-${month}-${day}`;
      
      let isAfterFrom = true;
      if (dateFrom) {
        isAfterFrom = trxDate >= dateFrom;
      }

      let isBeforeTo = true;
      if (dateTo) {
        isBeforeTo = trxDate <= dateTo;
      }

      return isAfterFrom && isBeforeTo;
    });
  }, [transactions, dateFrom, dateTo]);

  // Cálculos de KPIs basados en la data real filtrada
  const kpis = useMemo(() => {
    let totalRevenue = 0;
    let totalPenalty = 0;
    
    filteredTransactions.forEach(t => {
      totalRevenue += t.totalPagado;
      totalPenalty += t.valorRecargoPermanencia;
    });

    // Calcular alertas reales del inventario local
    let inventoryAlerts = 0;
    const savedInventory = localStorage.getItem('smartmanager_inventory');
    if (savedInventory) {
      const inventory = JSON.parse(savedInventory);
      inventoryAlerts = inventory.filter(item => item.currentQty <= item.minStock).length;
    }

    return {
      totalRevenue,
      totalOrders: filteredTransactions.length,
      totalPenalty,
      inventoryAlerts
    };
  }, [filteredTransactions]);

  // Datos dinámicos para el gráfico de barras (Ingresos por día)
  const barChartData = useMemo(() => {
    if (filteredTransactions.length === 0) return [];
    const dataMap = {};
    // Procesar de la más antigua a la más reciente (invertir el orden de las transacciones)
    [...filteredTransactions].reverse().forEach(trx => {
      const d = new Date(trx.fechaEmision);
      const dayFormat = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }); // Ej: "lun 6"
      if (!dataMap[dayFormat]) dataMap[dayFormat] = 0;
      dataMap[dayFormat] += trx.totalPagado;
    });
    
    return Object.keys(dataMap).map(key => ({
      name: key,
      ingresos: dataMap[key]
    }));
  }, [filteredTransactions]);

  // Datos dinámicos para el gráfico de pastel (Distribución de Servicios)
  const pieChartData = useMemo(() => {
    if (filteredTransactions.length === 0) return [];
    const serviceCounts = {};
    filteredTransactions.forEach(trx => {
      if (trx.servicios && trx.servicios.length > 0) {
        trx.servicios.forEach(srv => {
          if (!serviceCounts[srv]) serviceCounts[srv] = 0;
          serviceCounts[srv] += 1;
        });
      } else {
        const fallback = 'Servicios Generales';
        if (!serviceCounts[fallback]) serviceCounts[fallback] = 0;
        serviceCounts[fallback] += 1;
      }
    });

    return Object.keys(serviceCounts).map(key => ({
      name: key,
      value: serviceCounts[key]
    }));
  }, [filteredTransactions]);

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['ID Factura', 'Fecha', 'Cliente', 'Subtotal', 'Recargos', 'IVA', 'Total', 'Metodo de Pago'];
    const rows = filteredTransactions.map(trx => [
      `TRX-${String(trx.idFactura).padStart(6, '0')}`,
      new Date(trx.fechaEmision).toLocaleString('es-ES'),
      trx.nombreCliente,
      trx.subtotalSinImpuestos,
      trx.valorRecargoPermanencia,
      trx.totalIva,
      trx.totalPagado,
      trx.metodoPago || 'Efectivo/Punto'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transacciones_reporte.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No hay transacciones para exportar en este rango');
      return;
    }
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('SmartManager', 14, 22);
    
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246); // primary-500
    doc.text('Reporte Oficial de Transacciones', 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-ES')}`, 14, 38);
    
    // Resumen de ingresos
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Total de Ingresos Acumulados: $${kpis.totalRevenue.toFixed(2)}`, 14, 48);
    doc.text(`Total de Pedidos Procesados: ${kpis.totalOrders}`, 14, 54);
    
    // Tabla
    const tableColumn = ["ID Factura", "Fecha y Hora", "Cliente", "Método", "Subtotal", "Recargos", "IVA", "Total"];
    const tableRows = [];

    filteredTransactions.forEach(trx => {
      const trxData = [
        `TRX-${String(trx.idFactura).padStart(6, '0')}`,
        new Date(trx.fechaEmision).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
        trx.nombreCliente,
        trx.metodoPago || 'Efectivo/Punto',
        `$${trx.subtotalSinImpuestos.toFixed(2)}`,
        `$${trx.valorRecargoPermanencia.toFixed(2)}`,
        `$${trx.totalIva.toFixed(2)}`,
        `$${trx.totalPagado.toFixed(2)}`
      ];
      tableRows.push(trxData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 62,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' }, // blue-600
      alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] }
      }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Página ${i} de ${pageCount} - Lavandería SmartManager`, 14, doc.internal.pageSize.height - 10);
    }

    doc.save('informe_transacciones_smartmanager.pdf');
    toast.success('Informe PDF generado exitosamente');
  };

  // Formateador de moneda para gráficos
  const formatCurrency = (value) => `$${value}`;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Reportes y Estadísticas
            <button 
              onClick={fetchTransactions} 
              disabled={loading}
              className={`p-2 text-slate-400 hover:text-primary-600 transition-colors bg-white rounded-full shadow-sm border border-slate-100 ${loading ? 'animate-spin text-primary-600' : ''}`}
              title="Actualizar datos en tiempo real"
            >
              <RefreshCw size={20} />
            </button>
          </h1>
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
          <button 
            onClick={() => { setDateFrom(''); setDateTo(''); }}
            title="Limpiar filtros"
            className="bg-primary-50 text-primary-600 p-2 rounded-lg hover:bg-primary-100 transition-colors"
          >
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
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Ingresos Acumulados</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">${kpis.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md group">
          <div className="p-4 bg-primary-50 text-primary-600 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Pedidos (Histórico)</p>
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
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ingresos Últimos 7 Días (Proyección)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {barChartData.length > 0 ? (
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Ingresos']}
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="ingresos" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No hay datos suficientes para graficar
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pastel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Distribución de Servicios</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {pieChartData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [value, 'Pedidos']}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}}/>
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No hay datos suficientes
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de Resumen de Transacciones */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8 relative min-h-[300px]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Transacciones Recientes (Tiempo Real)</h3>
          
          <div className="relative">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              onBlur={() => setTimeout(() => setIsExportMenuOpen(false), 200)}
              className="flex items-center gap-2 text-sm font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition-colors border border-primary-100"
            >
              <Download size={16} />
              Exportar Informe
              <ChevronDown size={16} className={`transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={() => { exportToPDF(); setIsExportMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors border-b border-slate-50"
                >
                  <FileText size={18} className="text-red-500" />
                  Formato PDF
                </button>
                <button 
                  onClick={() => { exportToCSV(); setIsExportMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <FileSpreadsheet size={18} className="text-emerald-500" />
                  Formato CSV
                </button>
              </div>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <RefreshCw className="animate-spin text-primary-600" size={32} />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertTriangle size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">No hay transacciones en este rango de fechas.</p>
            <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-5 font-bold">ID Factura</th>
                  <th className="p-5 font-bold">Fecha y Hora</th>
                  <th className="p-5 font-bold">Cliente</th>
                  <th className="p-5 font-bold">Método de Pago</th>
                  <th className="p-5 font-bold text-right">Recargos</th>
                  <th className="p-5 font-bold text-right">Monto Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTransactions.map((trx) => (
                  <tr key={trx.idFactura} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-sm">
                        TRX-{String(trx.idFactura).padStart(6, '0')}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-slate-600">
                      {new Date(trx.fechaEmision).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-5 text-sm font-medium text-slate-700">
                      {trx.nombreCliente}
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        (trx.metodoPago || 'Efectivo') === 'Efectivo' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {trx.metodoPago || 'Efectivo/Punto'}
                      </span>
                    </td>
                    <td className="p-5 text-right text-sm">
                      {trx.valorRecargoPermanencia > 0 ? (
                        <span className="text-amber-600 font-bold">+${trx.valorRecargoPermanencia.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-5 text-right font-extrabold text-slate-800">
                      ${trx.totalPagado.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
