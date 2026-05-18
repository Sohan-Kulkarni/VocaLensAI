import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function ScoreTrendChart({ sessions = [] }) {
  const data = [...sessions]
    .reverse()
    .slice(-8)
    .map((session) => ({
      name: new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: Math.round(session.overall_score || 0),
      confidence: Math.round(session.confidence_score || 0),
      technical: Math.round(session.technical_score || 0),
    }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.34} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#0d1020', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
          />
          <Area dataKey="score" stroke="#22d3ee" fill="url(#scoreFill)" strokeWidth={3} />
          <Area dataKey="confidence" stroke="#fbbf24" fill="transparent" strokeWidth={2} />
          <Area dataKey="technical" stroke="#34d399" fill="transparent" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
