import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, CheckCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 1, title: 'Pendientes', color: 'bg-blue-50 border-blue-200', headerColor: 'bg-blue-100 text-blue-800' },
  { id: 2, title: 'En Proceso', color: 'bg-orange-50 border-orange-200', headerColor: 'bg-orange-100 text-orange-800' },
  { id: 3, title: 'Listos para Retiro', color: 'bg-green-50 border-green-200', headerColor: 'bg-green-100 text-green-800' },
];

const OperatorPanel = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTablero();
  }, []);

  const fetchTablero = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://${window.location.hostname}:8080/api/pedidos/tablero`);
      if (!res.ok) throw new Error('Error de red al cargar el tablero');
      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar el tablero.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextState = async (pedido) => {
    if (pedido.idEstado >= 3) return;
    
    const nuevoEstado = pedido.idEstado + 1;
    const previousPedidos = [...pedidos];
    
    // Optimistic UI Update
    setPedidos(pedidos.map(p => p.idPedido === pedido.idPedido ? { ...p, idEstado: nuevoEstado } : p));
    
    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/pedidos/${pedido.idPedido}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idEstado: nuevoEstado })
      });
      
      if (!res.ok) throw new Error('Error al actualizar');
      toast.success(`Pedido movido a ${COLUMNS.find(c => c.id === nuevoEstado).title}`);
    } catch (err) {
      // Revert if error
      setPedidos(previousPedidos);
      toast.error('Fallo al actualizar el estado. Se revirtió el cambio.');
    }
  };

  const getTimeElapsed = (fechaRecepcion) => {
    if (!fechaRecepcion) return 'N/A';
    const start = new Date(fechaRecepcion);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 24) return `${Math.floor(diffHours/24)} d`;
    if (diffHours > 0) return `${diffHours} h ${diffMins % 60} m`;
    return `${diffMins} m`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-200 h-screen rounded-xl opacity-50 p-4">
            <div className="h-10 bg-slate-300 rounded-lg mb-6"></div>
            {[1, 2].map(j => (
              <div key={j} className="h-32 bg-slate-300 rounded-lg mb-4"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Panel Operativo</h1>
        <p className="text-slate-500">Gestión de flujo de trabajo en tiempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {COLUMNS.map(col => {
          const colPedidos = pedidos.filter(p => p.idEstado === col.id);
          
          return (
            <div key={col.id} className={`flex flex-col rounded-2xl border ${col.color} overflow-hidden h-full max-h-[80vh]`}>
              <div className={`p-4 font-bold flex justify-between items-center ${col.headerColor}`}>
                <span>{col.title}</span>
                <span className="bg-white/50 px-2 py-1 rounded-full text-sm">
                  {colPedidos.length}
                </span>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {colPedidos.map(pedido => (
                  <div key={pedido.idPedido} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800">{pedido.nombreCliente}</h3>
                        <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <Package size={12}/> {pedido.uuidTicket}
                        </p>
                      </div>
                      <div className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                        <Clock size={12} />
                        {getTimeElapsed(pedido.fechaRecepcion)}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <ul className="text-sm text-slate-600 list-disc list-inside">
                        {pedido.servicios && pedido.servicios.map((srv, idx) => (
                          <li key={idx} className="truncate">{srv}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {col.id < 3 && (
                      <button 
                        onClick={() => handleNextState(pedido)}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-primary-50 text-primary-600 border border-slate-200 hover:border-primary-200 py-2 rounded-lg font-medium transition-colors text-sm group-hover:bg-primary-600 group-hover:text-white"
                      >
                        Siguiente Etapa
                        <ArrowRight size={16} />
                      </button>
                    )}
                    {col.id === 3 && (
                      <div className="mt-4 w-full flex items-center justify-center gap-2 text-emerald-600 py-2 rounded-lg font-medium bg-emerald-50 text-sm">
                        <CheckCircle size={16} />
                        Esperando Retiro
                      </div>
                    )}
                  </div>
                ))}
                
                {colPedidos.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-xl">
                    Sin pedidos en esta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OperatorPanel;
