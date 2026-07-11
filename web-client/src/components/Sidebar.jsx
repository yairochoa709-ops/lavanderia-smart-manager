import React from 'react';
import { ClipboardList, Package, Receipt, FileText, Users, Droplets, LayoutDashboard, LogOut } from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, currentUser, onLogout }) => {
  const currentUserRole = currentUser?.role === 'Administrador' ? 'ADMIN' : 'OPERATOR';

  const menuItems = [
    { name: 'Recepción', icon: <ClipboardList size={20} />, requiresAdmin: false },
    { name: 'Panel Operativo', icon: <LayoutDashboard size={20} />, requiresAdmin: false },
    { name: 'Inventario', icon: <Package size={20} />, requiresAdmin: false },
    { name: 'Facturación', icon: <Receipt size={20} />, requiresAdmin: false },
    { name: 'Reportes', icon: <FileText size={20} />, requiresAdmin: false },
    { name: 'Usuarios', icon: <Users size={20} />, requiresAdmin: true },
  ];

  // Filtramos el menú según el rol
  const visibleMenuItems = menuItems.filter(item => !item.requiresAdmin || currentUserRole === 'ADMIN');

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-900 text-white flex flex-col shadow-xl z-20">
      <div className="p-6 flex items-center gap-3 border-b border-primary-800">
        <div className="bg-white p-2 rounded-lg text-primary-600">
          <Droplets size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-wide">Smart<span className="font-light">Manager</span></h1>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        {visibleMenuItems.map((item, index) => {
          const isActive = currentPage === item.name;
          return (
            <a
              key={index}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(item.name);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary-600 shadow-lg shadow-primary-600/30 font-medium' 
                  : 'hover:bg-primary-800 text-primary-100 hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
            </a>
          );
        })}
      </nav>
      
      <div className="px-4 pb-4">
        <a
          href="/seguimiento"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-md"
        >
          Vista Cliente
        </a>
      </div>

      <div className="p-6 border-t border-primary-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-lg ${currentUserRole === 'ADMIN' ? 'bg-primary-700' : 'bg-slate-700'}`}>
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium truncate">{currentUser?.name || 'Usuario'}</p>
              <p className="text-xs text-primary-300 truncate">{currentUser?.role || 'Operador'}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-primary-300 hover:text-white hover:bg-primary-800 p-2 rounded-lg transition-colors ml-2 shrink-0"
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
