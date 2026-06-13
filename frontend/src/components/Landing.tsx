import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, LogIn, Users, Loader2 } from 'lucide-react';

interface LoginForm {
  correo: string;
  password: string;
  loading: boolean;
  error: string | null;
}

export const Landing: React.FC = () => {
  const { setUser, setGuestUser } = useAuthStore();
  const [form, setForm] = useState<LoginForm>({
    correo: '',
    password: '',
    loading: false,
    error: null,
  });

  const motivationalPhrases = [
    'Domina la Normalización',
    'Diseña Bases de Datos Perfectas',
    'Aprende a Través del Juego',
    'Sé un Experto en BD',
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setForm(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            correo: form.correo,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setForm(prev => ({
          ...prev,
          error: data.message || 'Error al iniciar sesión',
        }));
        return;
      }

      setUser(data.user, data.token);
    } catch (err) {
      setForm(prev => ({
        ...prev,
        error: 'Error de conexión. Intenta de nuevo.',
      }));
    } finally {
      setForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleGuestAccess = () => {
    setGuestUser();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex overflow-hidden">
      {/* Left Side - Visual & Educational */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Database Visualization */}
          <div className="mb-12 relative">
            <div className="text-6xl mb-4">🗄️</div>
            <div className="flex justify-center gap-4 mb-8">
              <div className="w-20 h-24 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-2xl">
                1FN
              </div>
              <div className="w-20 h-24 bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold shadow-2xl transform translate-y-4">
                2FN
              </div>
              <div className="w-20 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold shadow-2xl">
                3FN
              </div>
            </div>
          </div>

          {/* Motivational Text */}
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Aprende Normalización de Bases de Datos de Forma Interactiva
          </h2>

          <div className="space-y-4 mb-12">
            {motivationalPhrases.map((phrase, idx) => (
              <div
                key={idx}
                className="text-lg text-slate-300 flex items-center gap-3 justify-center animate-fade-in"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <span className="text-indigo-400">✓</span>
                {phrase}
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-12 text-sm">
            {[
              { icon: '🎯', text: 'Quests Gamificadas' },
              { icon: '📊', text: 'Visualización en Tiempo Real' },
              { icon: '🏆', text: 'Ranking Global' },
              { icon: '💡', text: 'Mentoría Inteligente' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10 hover:border-indigo-400/50 transition"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <p className="text-xs text-slate-300">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Authentication */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 relative">
        {/* Mobile header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl shadow-lg">
            🎓
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">DataQuest</h1>
            <p className="text-xs text-slate-400">Normalization Lab</p>
          </div>
        </div>

        {/* Auth Container */}
        <div className="w-full max-w-md">
          {/* Logo - Desktop */}
          <div className="hidden lg:flex items-center justify-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl shadow-2xl">
              🎓
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              DataQuest
            </h1>
            <p className="text-slate-400">Tu camino a dominar la Normalización</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            {form.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                {form.error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={form.correo}
                  onChange={e =>
                    setForm(prev => ({ ...prev, correo: e.target.value }))
                  }
                  placeholder="tu@email.com"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e =>
                    setForm(prev => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={form.loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {form.loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Iniciando sesión...</>
              ) : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-400">o</span>
            </div>
          </div>

          {/* Guest Button */}
          <button
            onClick={handleGuestAccess}
            className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-cyan-500/50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 group"
          >
            <Users className="w-5 h-5 group-hover:text-cyan-400 transition" />
            <span>Continuar como Invitado</span>
          </button>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>
              ¿No tienes cuenta?{' '}
              <a
                href="#"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
              >
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
