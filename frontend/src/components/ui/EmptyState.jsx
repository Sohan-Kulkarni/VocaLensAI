import { ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({ title, description, actionLabel, to }) {
  return (
    <div className="glass-soft rounded-xl p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
        <ClipboardList size={24} />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{description}</p>
      {to ? (
        <Link to={to} className="btn-primary mt-5">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
