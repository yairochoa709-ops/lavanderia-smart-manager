import React from 'react';
import { ClipboardList, Package, Receipt, FileText, Users, Droplets } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Recepción', icon: <ClipboardList size={20} />, active: true },
    { name: 'Inventario', icon: <Package size={20} />, active: false },
    { name: 'Facturación', icon: <Receipt size={20} />, active: false },
    { name: 'Reportes', icon: <FileText size={20} />, active: false },
    { name: 'Usuarios', icon: <Users size={20} />, active: false },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-900 text-white flex flex-col shadow-xl z-20">
      <div className="p-6 flex items-center gap-3 border-b border-primary-800">
        <div className="bg-white p-2 rounded-lg text-primary-600">
          <Droplets size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-wide">Smart<span className="font-light">Manager</span></h1>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            onClick={(e) => e.preventDefault()}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              item.active 
                ? 'bg-primary-600 shadow-lg shadow-primary-600/30 font-medium' 
                : 'hover:bg-primary-800 text-primary-100 hover:text-white'
            }`}
          >
            {item.icon}
            {item.name}
          </a>
        ))}
      </nav>
      
      <div className="p-6 border-t border-primary-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center font-bold text-lg">
            A
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-primary-300">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
