import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AuthScreen } from './Login';

export function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getApiError(error, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen title="Create your workspace" subtitle="Start tracking interview readiness across practice sessions.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input"
          placeholder="Full name"
          value={form.full_name}
          onChange={(event) => setForm({ ...form, full_name: event.target.value })}
          required
        />
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
          placeholder="Password, minimum 8 characters"
          minLength={8}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <button className="btn-primary w-full" disabled={loading}>
          <UserPlus size={16} />
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link className="font-semibold text-cyan-200 hover:text-cyan-100" to="/login">
          Login
        </Link>
      </p>
    </AuthScreen>
  );
}
