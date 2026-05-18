import {
  BarChart3,
  Clock3,
  LogOut,
  Menu,
  Mic2,
  Sparkles,
  UserCircle,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/upload', label: 'New Interview', icon: Mic2 },
  { to: '/history', label: 'History', icon: Clock3 },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="fixed inset-0 -z-10 signal-field opacity-60" />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-ink/90 p-4 backdrop-blur-2xl transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <img src="/brand-mark.svg" className="h-10 w-10" alt="VocaLens AI mark" />
            <div>
              <p className="text-lg font-bold">VocaLens AI</p>
              <p className="text-xs text-slate-400">Interview intelligence</p>
            </div>
          </NavLink>
          <button className="icon-button lg:hidden" title="Close menu" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-cyan-300 text-slate-950' : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass-soft rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-300/15 text-amber-200">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.full_name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <button className="btn-secondary mt-4 w-full" onClick={handleLogout}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {open ? <button className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} /> : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/75 backdrop-blur-2xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button className="icon-button lg:hidden" title="Open menu" onClick={() => setOpen(true)}>
                <Menu size={18} />
              </button>
              <div>
                <p className="text-sm text-slate-400">Workspace</p>
                <h1 className="text-lg font-semibold">
                  {navItems.find((item) => location.pathname.startsWith(item.to))?.label || 'Analysis'}
                </h1>
              </div>
            </div>
            <NavLink to="/upload" className="btn-primary px-3 py-2">
              <Mic2 size={16} />
              <span className="hidden sm:inline">Practice</span>
            </NavLink>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
