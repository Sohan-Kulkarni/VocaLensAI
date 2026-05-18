import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function FillerChart({ frequency = {} }) {
  const data = Object.entries(frequency).map(([word, count]) => ({ word, count }));
  const chartData = data.length ? data : [{ word: 'none', count: 0 }];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="word" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ background: '#0d1020', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
          />
          <Bar dataKey="count" fill="#fb7185" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
