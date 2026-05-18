import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { scoreTone } from '../../utils/format';

export function MetricCard({ label, value, suffix = '', icon: Icon, delta, toneByScore = false }) {
  const numeric = Number(value);
  const tone = toneByScore && Number.isFinite(numeric) ? scoreTone(numeric) : 'text-white';

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{label}</p>
        {Icon ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.07] text-cyan-200">
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className={`text-3xl font-bold ${tone}`}>
          {value ?? '--'}
          {value !== undefined && value !== null ? <span className="text-base text-slate-400">{suffix}</span> : null}
        </p>
        {delta ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
              delta >= 0 ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'
            }`}
          >
            {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(delta)}%
          </span>
        ) : null}
      </div>
    </div>
  );
}
