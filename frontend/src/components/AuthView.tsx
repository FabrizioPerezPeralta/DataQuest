import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { loginUser, registerUser, guestLogin } from '../services/api';
import type { User } from '../types';

export const AuthView: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      if (data.success) {
        const userObj: User = {
          id: data.userId,
          correo: email,
          apodo: data.nickname,
          role: data.role === 'admin' || data.role === 'administrador' ? 'administrador' : 'usuario',
          medallas: [],
          activo: true,
          fecha_registro: new Date().toISOString(),
        };
        setUser(userObj);
      } else {
        setError(data.error || 'Credenciales inválidas. Por favor, intenta de nuevo.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al conectar con el servidor. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !nickname || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (nickname.length < 3) {
      setError('El apodo debe tener al menos 3 caracteres.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await registerUser(email, nickname, password);
      if (data.success) {
        const userObj: User = {
          id: data.userId,
          correo: email,
          apodo: data.nickname,
          role: data.role === 'admin' || data.role === 'administrador' ? 'administrador' : 'usuario',
          medallas: [],
          activo: true,
          fecha_registro: new Date().toISOString(),
        };
        setUser(userObj);
      } else {
        setError(data.error || 'El apodo o correo ya están registrados.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar el usuario. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await guestLogin();
      if (data.success) {
        const userObj: User = {
          id: data.userId,
          correo: 'invitado@dataquest.edu',
          apodo: data.nickname,
          role: 'usuario',
          medallas: [],
          activo: true,
          fecha_registro: new Date().toISOString(),
        };
        setUser(userObj);
      } else {
        setError(data.error || 'No se pudo crear la sesión de invitado.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear la sesión de invitado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4">
      {/* Background blobs for premium styling */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse delay-1000"></div>

      <div className="max-w-md w-full z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 text-white text-3xl shadow-xl shadow-indigo-500/25 mb-4 animate-bounce">
            🎓
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            DataQuest
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Normaliza datos, resuelve puzzles y conviértete en maestro
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {/* Mode Switcher */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-8 border border-slate-800/50">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                mode === 'login' ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                mode === 'register' ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white rounded-xl px-4 py-3 outline-none text-sm transition-all placeholder:text-slate-600"
                placeholder="ejemplo@correo.com"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Apodo (Nickname)
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white rounded-xl px-4 py-3 outline-none text-sm transition-all placeholder:text-slate-600"
                  placeholder="Tu apodo de juego"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white rounded-xl px-4 py-3 outline-none text-sm transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm mt-2"
            >
              {loading ? '⏳ Procesando...' : mode === 'login' ? 'Ingresar a DataQuest' : 'Registrar mi Cuenta'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <span className="relative px-3 bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              o también puedes
            </span>
          </div>

          {/* Guest Login */}
          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full py-3 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300 font-semibold rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            🧑‍💻 Entrar como Invitado
          </button>
        </div>
      </div>
    </div>
  );
};
