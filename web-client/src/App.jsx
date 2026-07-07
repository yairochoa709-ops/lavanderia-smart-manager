import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Reception from './pages/Reception';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Tracking from './pages/Tracking';
import Reports from './pages/Reports';
import Users from './pages/Users';
import OperatorPanel from './pages/OperatorPanel';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';

const initialMockUsers = [
  { id: 1, name: 'Yair Ochoa', email: 'admin@smartmanager.com', role: 'Administrador', status: 'Activo' },
  { id: 2, name: 'María Gómez', email: 'mgomez@smartmanager.com', role: 'Operador', status: 'Activo' },
  { id: 3, name: 'Luis Pérez', email: 'lperez@smartmanager.com', role: 'Operador', status: 'Inactivo' },
];

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (window.location.pathname.startsWith('/seguimiento')) {
      return 'Tracking';
    }
    return 'Recepción';
  });

  // Global state for users (persisted in localStorage for demo)
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('smartmanager_users');
    return saved ? JSON.parse(saved) : initialMockUsers;
  });

  // Global auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('smartmanager_auth') === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smartmanager_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist users
  useEffect(() => {
    localStorage.setItem('smartmanager_users', JSON.stringify(users));
  }, [users]);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    localStorage.setItem('smartmanager_auth', 'true');
    localStorage.setItem('smartmanager_current_user', JSON.stringify(user));
    setCurrentPage('Recepción');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('smartmanager_auth');
    localStorage.removeItem('smartmanager_current_user');
  };

  const isPublicPage = currentPage === 'Tracking';

  if (!isAuthenticated && !isPublicPage) {
    return (
      <>
        <Toaster position="top-right" />
        <Login onLogin={handleLogin} users={users} />
      </>
    );
  }

  const currentUserRole = currentUser?.role === 'Administrador' ? 'ADMIN' : 'OPERATOR';

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />
      {!isPublicPage && (
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
      
      <main className={`flex-1 overflow-y-auto ${!isPublicPage ? 'ml-64 p-8' : ''}`}>
        {currentPage === 'Recepción' && <Reception />}
        {currentPage === 'Inventario' && <Inventory />}
        {currentPage === 'Facturación' && <Billing />}
        {currentPage === 'Reportes' && <Reports />}
        {currentPage === 'Usuarios' && currentUserRole === 'ADMIN' && (
          <Users users={users} setUsers={setUsers} />
        )}
        {currentPage === 'Panel Operativo' && <OperatorPanel />}
        {currentPage === 'Tracking' && <Tracking onBack={() => setCurrentPage('Recepción')} />}
        
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
