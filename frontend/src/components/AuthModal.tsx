// AuthModal.tsx — Glassmorphism + Loader + Toast + Guest access
import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, UserPlus, Loader2, X, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from './Toast';

export const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [apodo, setApodo] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setGuestUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = isLogin
      ? `${import.meta.env.VITE_API_URL}/auth/login`
      : `${import.meta.env.VITE_API_URL}/auth/register`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(isLogin ? { correo, password } : { correo, apodo, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(`¡Vaya! ${data.message || 'Error en la autenticación'}`);
        return;
      }
      if (data.success) {
        setUser(data.user, data.token);
        toast.success(`¡Bienvenido, ${data.user.apodo}! 🎓`);
        onClose();
      } else {
        toast.error(data.message || 'Error desconocido');
      }
    } catch {
      toast.error('Error de conexión. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    const guest = setGuestUser();
    toast.success(`Entrando como ${guest.apodo} 👤`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
        style={{
          background: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(99,102,241,0.25)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 pt-10">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl shadow-lg">🎓</div>
          </div>
          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold text-white">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
            <p className="text-slate-400 text-sm mt-1">{isLogin ? 'Accede a tu laboratorio de normalización' : 'Únete a DataQuest hoy'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Correo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input type="email" required value={correo} onChange={e => setCorreo(e.target.value)} placeholder="tu@email.com"
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>
            </div>
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Apodo</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input type="text" required value={apodo} onChange={e => setApodo(e.target.value)} placeholder="MiApodoQuest"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>
            </div>

            <button type="submit" disabled={loading} id="auth-submit-btn"
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{isLogin ? 'Iniciando...' : 'Creando cuenta...'}</>
                : <>{isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}{isLogin ? 'Entrar al Laboratorio' : 'Registrarse'}</>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700/80" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 text-slate-500" style={{ background: 'transparent' }}>o continúa con</span></div>
          </div>

          <button onClick={handleGuest} id="guest-access-btn"
            className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 border border-slate-700 hover:border-cyan-500/60 bg-slate-800/40 hover:bg-slate-700/60 transition-all group">
            <Users className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="group-hover:text-cyan-100 transition-colors">Continuar como Invitado</span>
          </button>

          <div className="mt-5 text-center text-sm text-slate-500">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-indigo-400 hover:text-indigo-300 font-semibold">
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
