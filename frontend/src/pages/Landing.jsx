import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, BrainCircuit, FileText, Mic2, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const bars = [34, 68, 42, 82, 56, 92, 48, 74, 38, 64, 86, 46, 70, 52, 90, 40];

export function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 signal-field opacity-70" />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src="/brand-mark.svg" className="h-11 w-11" alt="VocaLens AI mark" />
          <div>
            <p className="text-lg font-bold">VocaLens AI</p>
            <p className="text-xs text-slate-400">AI Interview Assistant</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link className="btn-secondary hidden py-2 sm:inline-flex" to="/login">
            Login
          </Link>
          <Link className="btn-primary py-2" to="/register">
            Start free
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl content-center gap-10 px-4 pb-14 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-cyan-100">
            <Sparkles size={16} />
            Speech-to-text, scoring, feedback, and reports
          </div>
          <h1 className="max-w-5xl text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
            VocaLens AI
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            A polished AI interview analysis platform that listens to practice answers, measures communication quality,
            evaluates technical relevance, and turns each session into clear coaching feedback.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" to="/register">
              Analyze an interview
              <ArrowRight size={18} />
            </Link>
            <Link className="btn-secondary" to="/login">
              View dashboard
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="glass rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">Live Analysis</p>
                <h2 className="mt-2 text-2xl font-bold">Interview Readiness 86</h2>
              </div>
              <div className="flex gap-2">
                {['Confidence', 'Technical', 'Fluency'].map((item) => (
                  <span key={item} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="animated-bars mt-8 flex h-48 items-end gap-2">
              {bars.map((height, index) => (
                <span
                  key={index}
                  className="flex-1 rounded-t-lg bg-cyan-300/80"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['WPM', '142', 'optimal pace'],
                ['Fillers', '4', 'low severity'],
                ['Technical', '78', 'AI/ML coverage'],
              ].map(([label, value, caption]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-bold">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{caption}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {[
              [Mic2, 'Audio interview input', 'Upload files or record answers directly in the browser.'],
              [BrainCircuit, 'ML scoring engine', 'Filler, WPM, sentiment, confidence, and domain relevance.'],
              [BarChart3, 'Analytics dashboard', 'Animated radar, trend, sentiment, and WPM charts.'],
              [FileText, 'PDF reports', 'Download a structured report with feedback and transcript.'],
              [ShieldCheck, 'JWT auth', 'Secure accounts with password hashing and protected APIs.'],
            ].map(([Icon, title, text]) => (
              <div key={title} className="glass-soft rounded-xl p-4">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-amber-200">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
