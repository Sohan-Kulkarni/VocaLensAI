import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function WpmChart({ series = [] }) {
  const data = series?.length ? series : [{ label: 'Current', wpm: 0 }];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
          <ReferenceLine y={120} stroke="#34d399" strokeDasharray="4 4" />
          <ReferenceLine y={165} stroke="#34d399" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{ background: '#0d1020', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
          />
          <Bar dataKey="wpm" fill="#22d3ee" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
