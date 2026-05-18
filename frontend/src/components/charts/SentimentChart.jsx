import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const colors = ['#fb7185', '#fbbf24', '#34d399'];

export function SentimentChart({ series = [] }) {
  const data = series?.length ? series : [{ label: 'Neutral', score: 1 }];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="score" nameKey="label" innerRadius={58} outerRadius={94} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#0d1020', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
