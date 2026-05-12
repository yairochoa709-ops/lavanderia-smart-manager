import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Reception from './pages/Reception';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Tracking from './pages/Tracking';

function App() {
  const [currentPage, setCurrentPage] = useState('Recepción');

  const isPublicPage = currentPage === 'Tracking';

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {!isPublicPage && <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      
      <main className={`flex-1 overflow-y-auto ${!isPublicPage ? 'ml-64 p-8' : ''}`}>
        {currentPage === 'Recepción' && <Reception />}
        {currentPage === 'Inventario' && <Inventory />}
        {currentPage === 'Facturación' && <Billing />}
        {currentPage === 'Tracking' && <Tracking onBack={() => setCurrentPage('Recepción')} />}
        
        {/* Placeholder for other pages */}
        {!isPublicPage && currentPage !== 'Recepción' && currentPage !== 'Inventario' && currentPage !== 'Facturación' && (
          <div className="flex items-center justify-center h-full text-slate-400">
            <h2 className="text-2xl font-semibold">Módulo en construcción: {currentPage}</h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
