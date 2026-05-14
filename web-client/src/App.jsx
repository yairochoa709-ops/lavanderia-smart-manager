import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Reception from './pages/Reception';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Tracking from './pages/Tracking';
import Reports from './pages/Reports';
import Users from './pages/Users';
import OperatorPanel from './pages/OperatorPanel';
import { Toaster } from 'react-hot-toast';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    // Si la URL es la del escáner QR, abrimos directamente la vista de Tracking
    if (window.location.pathname.startsWith('/seguimiento')) {
      return 'Tracking';
    }
    return 'Recepción';
  });
  // Mock auth state for RBAC demonstration
  const [currentUserRole, setCurrentUserRole] = useState('ADMIN'); // 'ADMIN' or 'OPERATOR'

  const isPublicPage = currentPage === 'Tracking';

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />
      {!isPublicPage && (
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          currentUserRole={currentUserRole}
          setCurrentUserRole={setCurrentUserRole} // Just for demo toggling
        />
      )}
      
      <main className={`flex-1 overflow-y-auto ${!isPublicPage ? 'ml-64 p-8' : ''}`}>
        {currentPage === 'Recepción' && <Reception />}
        {currentPage === 'Inventario' && <Inventory />}
        {currentPage === 'Facturación' && <Billing />}
        {currentPage === 'Reportes' && <Reports />}
        {currentPage === 'Usuarios' && currentUserRole === 'ADMIN' && <Users />}
        {currentPage === 'Panel Operativo' && <OperatorPanel />}
        {currentPage === 'Tracking' && <Tracking onBack={() => setCurrentPage('Recepción')} />}
        
        {/* Placeholder for other pages */}
        {!isPublicPage && !['Recepción', 'Inventario', 'Facturación', 'Reportes', 'Usuarios', 'Panel Operativo'].includes(currentPage) && (
          <div className="flex items-center justify-center h-full text-slate-400">
            <h2 className="text-2xl font-semibold">Módulo en construcción: {currentPage}</h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
