import { BrainCircuit, Database, KeyRound, Server, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchProfile } from '../api/auth';
import { getApiError } from '../api/client';
import { GlassCard } from '../components/ui/GlassCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatScore } from '../utils/format';

const stackItems = [
  [BrainCircuit, 'ML pipeline', 'Whisper transcription, NLP scoring, feedback generation'],
  [Server, 'FastAPI backend', 'JWT auth, REST APIs, SQLAlchemy services'],
  [Database, 'SQLite ORM', 'User, session, transcript, and analysis models'],
  [KeyRound, 'Security', 'Hashed passwords and protected report exports'],
];

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setProfile(await fetchProfile());
      } catch (error) {
        toast.error(getApiError(error, 'Could not load profile.'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-56" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Account</p>
        <h2 className="mt-2 text-3xl font-bold">Profile</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
              <UserCircle size={32} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-bold">{profile?.full_name || user?.full_name}</h3>
              <p className="truncate text-sm text-slate-400">{profile?.email || user?.email}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Sessions</p>
              <p className="mt-2 text-3xl font-bold">{profile?.total_sessions || 0}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Average score</p>
              <p className="mt-2 text-3xl font-bold">{formatScore(profile?.average_score)}/100</p>
            </div>
          </div>
          <p className="mt-5 text-sm text-slate-500">Created {formatDate(profile?.created_at)}</p>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold">Platform architecture</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {stackItems.map(([Icon, title, text]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-amber-200">
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
        </GlassCard>
      </div>
    </div>
  );
}
