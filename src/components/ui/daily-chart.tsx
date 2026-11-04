import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DailyChart({
  data,
  label,
  formatValue,
  max,
  axisFormat = formatValue,
}: {
  data: { date: string; label: string; value: number | null }[];
  label: string;
  formatValue: (value: number) => string;
  max?: number;
  axisFormat?: (value: number) => string;
}) {
  return (
    <div className="h-48 min-w-0" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
          accessibilityLayer
        >
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--plum)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, max ?? "auto"]}
            {...(max === 5 ? { ticks: [1, 2, 3, 4, 5] } : {})}
            allowDecimals={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            tickFormatter={axisFormat}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [formatValue(value), label]}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="value"
            fill="var(--primary)"
            radius={[5, 5, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
