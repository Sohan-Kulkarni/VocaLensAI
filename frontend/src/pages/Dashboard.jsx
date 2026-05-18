import { motion } from 'framer-motion';
import { Activity, Brain, Gauge, Mic2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchProfile } from '../api/auth';
import { fetchHistory } from '../api/interviews';
import { ScoreTrendChart } from '../components/charts/ScoreTrendChart';
import { EmptyState } from '../components/ui/EmptyState';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricCard } from '../components/ui/MetricCard';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { formatDate, formatScore, scoreTone } from '../utils/format';
import { useEffect, useMemo, useState } from 'react';

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  return valid.length ? Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length) : 0;
}

export function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [history, profileData] = await Promise.all([fetchHistory(), fetchProfile()]);
        if (mounted) {
          setSessions(history);
          setProfile(profileData);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      avgScore: profile?.average_score || average(sessions.map((session) => session.overall_score || 0)),
      avgConfidence: average(sessions.map((session) => session.confidence_score || 0)),
      avgTechnical: average(sessions.map((session) => session.technical_score || 0)),
      total: profile?.total_sessions || sessions.length,
    }),
    [profile, sessions],
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Interview Command Center</p>
            <h2 className="mt-2 text-3xl font-bold">Readiness analytics</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Track speaking patterns, confidence, technical coverage, and coaching signals across sessions.
            </p>
          </div>
          <Link to="/upload" className="btn-primary">
            <Mic2 size={17} />
            New interview
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Average score" value={formatScore(stats.avgScore)} suffix="/100" icon={Gauge} toneByScore />
        <MetricCard label="Confidence" value={formatScore(stats.avgConfidence)} suffix="/100" icon={Activity} toneByScore />
        <MetricCard label="Technical" value={formatScore(stats.avgTechnical)} suffix="/100" icon={Brain} toneByScore />
        <MetricCard label="Sessions" value={stats.total} icon={Mic2} />
      </div>

      {sessions.length ? (
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <GlassCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Score trend</h3>
                <p className="mt-1 text-sm text-slate-400">Overall, confidence, and technical performance over time.</p>
              </div>
              <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs text-slate-300">
                Last {Math.min(sessions.length, 8)} sessions
              </span>
            </div>
            <ScoreTrendChart sessions={sessions} />
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold">Recent sessions</h3>
            <div className="mt-5 space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <Link
                  key={session.id}
                  to={`/analysis/${session.id}`}
                  className="block rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{session.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(session.created_at)}</p>
                    </div>
                    <span className={`text-lg font-bold ${scoreTone(session.overall_score || 0)}`}>
                      {formatScore(session.overall_score)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span className="rounded-full bg-white/[0.07] px-2 py-1">{session.domain}</span>
                    <span className="rounded-full bg-white/[0.07] px-2 py-1">{Math.round(session.wpm || 0)} WPM</span>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : (
        <EmptyState
          title="No interview sessions yet"
          description="Record or upload your first answer to generate speech-to-text, scoring, charts, and feedback."
          actionLabel="Start first analysis"
          to="/upload"
        />
      )}
    </div>
  );
}
