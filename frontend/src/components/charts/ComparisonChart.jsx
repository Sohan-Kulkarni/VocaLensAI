import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function ComparisonChart({ sessions = [] }) {
  const data = sessions.map((session) => ({
    title: session.title.length > 14 ? `${session.title.slice(0, 14)}...` : session.title,
    Overall: Math.round(session.overall_score),
    Confidence: Math.round(session.confidence_score),
    Technical: Math.round(session.technical_score),
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="title" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#0d1020', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
          />
          <Legend />
          <Bar dataKey="Overall" fill="#22d3ee" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Confidence" fill="#fbbf24" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Technical" fill="#34d399" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
