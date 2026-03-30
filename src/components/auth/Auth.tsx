import React, { useState } from 'react';
import { getSupabase } from '../../services/supabaseClient';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles, GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const supabase = getSupabase();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase not configured');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: email === 'nurimanpsk@gmail.com' ? 'admin' : 'user',
            },
          },
        });
        if (signUpError) throw signUpError;
        setMessage('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi (jika diaktifkan).');
      }
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError('Email atau kata sandi salah. Jika Anda belum punya akun, silakan klik "Daftar" di atas atau di bawah.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat otentikasi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600 text-white mb-4 shadow-lg shadow-amber-600/20"
          >
            <GraduationCap size={32} />
          </motion.div>
          <h1 className="text-3xl font-serif font-bold text-stone-800">Administrasi Sekolah</h1>
          <p className="text-stone-500 mt-2">Platform Administrasi & Asesmen Terpadu</p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200 overflow-hidden"
        >
          <div className="p-8">
            <div className="flex bg-stone-100 p-1 rounded-xl mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  isLogin ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  !isLogin ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Daftar
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    placeholder="nama@sekolah.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-12 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex flex-col gap-2">
                  <span>{error}</span>
                  {error.includes('Daftar') && isLogin && (
                    <button 
                      type="button"
                      onClick={() => {
                        setIsLogin(false);
                        setError(null);
                      }}
                      className="text-xs font-bold underline text-left hover:text-red-800 transition-colors"
                    >
                      Daftar Akun Baru Sekarang →
                    </button>
                  )}
                </div>
              )}

              {message && (
                <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {isLogin ? 'Masuk Sekarang' : 'Daftar Akun'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-6 bg-stone-50 border-t border-stone-100 text-center">
            <p className="text-sm text-stone-500">
              {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-amber-600 font-bold hover:underline"
              >
                {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
              </button>
            </p>
          </div>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2 text-stone-400 text-xs">
          <Sparkles size={14} />
          <span>Didukung oleh Teknologi AI Terkini</span>
        </div>
      </div>
    </div>
  );
}
