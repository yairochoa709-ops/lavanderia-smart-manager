import React, { useState } from 'react';
import { Users as UsersIcon, UserPlus, Shield, Mail, Key, CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-react';

const initialUsers = [
  { id: 1, name: 'Yair Ochoa', email: 'admin@smartmanager.com', role: 'Administrador', status: 'Activo' },
  { id: 2, name: 'María Gómez', email: 'mgomez@smartmanager.com', role: 'Operador', status: 'Activo' },
  { id: 3, name: 'Luis Pérez', email: 'lperez@smartmanager.com', role: 'Operador', status: 'Inactivo' },
];

const Users = () => {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Operador', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleToggleStatus = (id) => {
    if (window.confirm("¿Estás seguro de cambiar el estado de este usuario? Si lo desactivas, no podrá acceder al sistema.")) {
      setUsers(prev => prev.map(u => 
        u.id === id 
          ? { ...u, status: u.status === 'Activo' ? 'Inactivo' : 'Activo' } 
          : u
      ));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error on typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.name || !formData.email || !formData.password) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const emailExists = users.some(u => u.email.toLowerCase() === formData.email.toLowerCase());
    if (emailExists) {
      setError("Ya existe un usuario registrado con este correo electrónico.");
      return;
    }

    // Crear nuevo usuario (Mock para enviar al Backend Java)
    const newUser = {
      id: Date.now(), // Simula ID auto-generado
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'Activo'
    };

    console.log("=== NUEVO USUARIO PARA BACKEND (JSON) ===");
    console.log(JSON.stringify({ ...newUser, passwordHash: "encrypted_string_here" }, null, 2));

    setUsers([...users, newUser]);
    setSuccess("Usuario creado y registrado exitosamente.");
    setFormData({ name: '', email: '', role: 'Operador', password: '' });
    
    setTimeout(() => {
      setSuccess('');
      setShowForm(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="text-primary-600" size={32} />
            Gestión de Usuarios (RBAC)
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Administre los accesos, roles y permisos del personal del sistema.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            Nuevo Empleado
          </button>
        )}
      </div>

      {/* Formulario de Nuevo Empleado */}
      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-primary-100 mb-8 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Registrar Nuevo Empleado</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <XCircle size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 size={20} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UsersIcon size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico (Único)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  placeholder="usuario@smartmanager.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rol del Sistema</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Shield size={18} />
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white"
                >
                  <option value="Operador">Operador (Cajero/Mostrador)</option>
                  <option value="Administrador">Administrador (Acceso Total)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña Inicial</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
              >
                <CheckCircle2 size={20} />
                Guardar Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Directorio de Empleados */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Directorio Activo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-5 font-bold">Empleado</th>
                <th className="p-5 font-bold">Contacto</th>
                <th className="p-5 font-bold">Rol</th>
                <th className="p-5 font-bold">Estado Acceso</th>
                <th className="p-5 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-slate-600 font-medium">
                    {user.email}
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'Administrador' 
                        ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      <Shield size={12} />
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      user.status === 'Activo' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {user.status === 'Activo' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                      {user.status}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors border ${
                        user.status === 'Activo'
                          ? 'text-red-600 bg-white border-red-200 hover:bg-red-50'
                          : 'text-emerald-600 bg-white border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {user.status === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
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

export default Users;
