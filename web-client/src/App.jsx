import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Reception from './pages/Reception';
import Inventory from './pages/Inventory';

function App() {
  const [currentPage, setCurrentPage] = useState('Recepción');

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {currentPage === 'Recepción' && <Reception />}
        {currentPage === 'Inventario' && <Inventory />}
        {/* Placeholder for other pages */}
        {currentPage !== 'Recepción' && currentPage !== 'Inventario' && (
          <div className="flex items-center justify-center h-full text-slate-400">
            <h2 className="text-2xl font-semibold">Módulo en construcción: {currentPage}</h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
