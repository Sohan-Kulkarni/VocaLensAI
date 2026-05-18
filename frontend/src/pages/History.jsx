import { Eye, GitCompare, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getApiError } from '../api/client';
import { compareInterviews, deleteInterview, fetchHistory } from '../api/interviews';
import { ComparisonChart } from '../components/charts/ComparisonChart';
import { EmptyState } from '../components/ui/EmptyState';
import { GlassCard } from '../components/ui/GlassCard';
import { Skeleton } from '../components/ui/Skeleton';
import { domains, formatDate, formatScore, scoreTone } from '../utils/format';

export function History() {
  const [filters, setFilters] = useState({ q: '', domain: '', min_score: '', from_date: '', to_date: '' });
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => {
    const entries = Object.entries(filters).filter(([, value]) => value !== '');
    return Object.fromEntries(entries);
  }, [filters]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchHistory(params);
        if (mounted) setSessions(data);
      } catch (error) {
        toast.error(getApiError(error, 'Could not load history.'));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [params]);

  async function handleDelete(id) {
    try {
      await deleteInterview(id);
      setSessions((items) => items.filter((item) => item.id !== id));
      setSelected((items) => items.filter((item) => item !== id));
      toast.success('Session deleted.');
    } catch (error) {
      toast.error(getApiError(error, 'Delete failed.'));
    }
  }

  async function handleCompare() {
    if (selected.length < 2) {
      toast.error('Select at least two sessions.');
      return;
    }
    try {
      const data = await compareInterviews(selected);
      setComparison(data);
    } catch (error) {
      toast.error(getApiError(error, 'Comparison failed.'));
    }
  }

  function toggleSelected(id) {
    setSelected((items) => {
      if (items.includes(id)) return items.filter((item) => item !== id);
      if (items.length >= 4) {
        toast.error('Compare up to four sessions.');
        return items;
      }
      return [...items, id];
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Session Archive</p>
          <h2 className="mt-2 text-3xl font-bold">Interview history</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Search, filter, compare, and revisit previous interview analyses.
          </p>
        </div>
        <button className="btn-primary" onClick={handleCompare} disabled={selected.length < 2}>
          <GitCompare size={17} />
          Compare selected
        </button>
      </div>

      <GlassCard>
        <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.6fr_0.65fr_0.65fr]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 text-slate-500" size={16} />
            <input
              className="input pl-10"
              placeholder="Search by title"
              value={filters.q}
              onChange={(event) => setFilters({ ...filters, q: event.target.value })}
            />
          </label>
          <select
            className="input"
            value={filters.domain}
            onChange={(event) => setFilters({ ...filters, domain: event.target.value })}
          >
            <option value="">All domains</option>
            {domains.map((domain) => (
              <option key={domain}>{domain}</option>
            ))}
          </select>
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-3.5 text-slate-500" size={16} />
            <input
              className="input pl-10"
              type="number"
              min="0"
              max="100"
              placeholder="Min score"
              value={filters.min_score}
              onChange={(event) => setFilters({ ...filters, min_score: event.target.value })}
            />
          </label>
          <input
            className="input"
            type="date"
            value={filters.from_date}
            onChange={(event) => setFilters({ ...filters, from_date: event.target.value })}
          />
          <input
            className="input"
            type="date"
            value={filters.to_date}
            onChange={(event) => setFilters({ ...filters, to_date: event.target.value })}
          />
        </div>
      </GlassCard>

      {comparison ? (
        <GlassCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Comparison</h3>
              <p className="mt-1 text-sm text-slate-400">
                Overall delta: {comparison.deltas.overall_score >= 0 ? '+' : ''}
                {comparison.deltas.overall_score}
              </p>
            </div>
            <button className="btn-secondary py-2" onClick={() => setComparison(null)}>
              Clear
            </button>
          </div>
          <ComparisonChart sessions={comparison.sessions} />
        </GlassCard>
      ) : null}

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-28" />
          ))}
        </div>
      ) : sessions.length ? (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="glass rounded-xl p-4">
              <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-cyan-300"
                  checked={selected.includes(session.id)}
                  onChange={() => toggleSelected(session.id)}
                  aria-label={`Select ${session.title} for comparison`}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="truncate text-lg font-semibold">{session.title}</h3>
                    <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs text-slate-300">
                      {session.domain}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(session.created_at)}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span className="rounded-full bg-white/[0.07] px-2 py-1">{Math.round(session.wpm || 0)} WPM</span>
                    <span className="rounded-full bg-white/[0.07] px-2 py-1">
                      {session.filler_count || 0} fillers
                    </span>
                    <span className="rounded-full bg-white/[0.07] px-2 py-1">
                      Confidence {formatScore(session.confidence_score)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 lg:justify-end">
                  <span className={`text-3xl font-bold ${scoreTone(session.overall_score || 0)}`}>
                    {formatScore(session.overall_score)}
                  </span>
                  <Link className="icon-button" title="View analysis" to={`/analysis/${session.id}`}>
                    <Eye size={18} />
                  </Link>
                  <button className="icon-button text-rose-200" title="Delete session" onClick={() => handleDelete(session.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No sessions match your filters"
          description="Adjust the search and filters or create a new interview analysis."
          actionLabel="New interview"
          to="/upload"
        />
      )}
    </div>
  );
}
