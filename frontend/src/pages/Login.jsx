import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getApiError(error, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen title="Welcome back" subtitle="Sign in to continue analyzing interview performance.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <button className="btn-primary w-full" disabled={loading}>
          <LogIn size={16} />
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        New here?{' '}
        <Link className="font-semibold text-cyan-200 hover:text-cyan-100" to="/register">
          Create an account
        </Link>
      </p>
    </AuthScreen>
  );
}

export function AuthScreen({ title, subtitle, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <div className="absolute inset-0 signal-field opacity-60" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <img src="/brand-mark.svg" className="h-11 w-11" alt="VocaLens AI mark" />
          <span className="text-xl font-bold">VocaLens AI</span>
        </Link>
        <div className="glass rounded-xl p-6 sm:p-8">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </motion.div>
    </main>
  );
}
