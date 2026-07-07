import React, { useState } from 'react';
import { Droplets, Lock, Mail, AlertCircle, LogIn } from 'lucide-react';

const Login = ({ onLogin, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      setError('Credenciales incorrectas. El usuario no existe.');
      return;
    }

    if (user.status !== 'Activo') {
      setError('Tu cuenta está inactiva. Contacta al administrador.');
      return;
    }

    // Since it's a frontend mock, we accept any password of length >= 6 for demonstration
    if (password.length < 6) {
      setError('Credenciales incorrectas.');
      return;
    }

    // Success
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="bg-primary-900 p-8 text-center">
          <div className="inline-flex bg-white p-3 rounded-2xl text-primary-600 mb-4 shadow-lg shadow-primary-900/20">
            <Droplets size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-wide text-white">Smart<span className="font-light">Manager</span></h1>
          <p className="text-primary-200 mt-2 text-sm font-medium">Sistema de Gestión de Lavandería</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Iniciar Sesión</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-3 font-medium animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" /> 
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
                  placeholder="admin@smartmanager.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <LogIn size={20} />
              Acceder al Sistema
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="font-semibold text-slate-700 mb-1">Cuentas de demostración:</p>
            <p>Admin: admin@smartmanager.com</p>
            <p>Operador: mgomez@smartmanager.com</p>
            <p className="text-xs mt-2 text-slate-400">(Contraseña: cualquier texto de min 6 caracteres)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
