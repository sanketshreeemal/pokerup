import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import theme, { getCurrencySymbol } from "@/theme/theme";

interface MonthlyStatsData {
  month: string;
  games: number;
  winnings: number;
  hours: number;
}

interface MonthlyStatsChartProps {
  data: MonthlyStatsData[];
  currency: string;
}

export function MonthlyStatsChart({ data, currency }: MonthlyStatsChartProps) {
  const formatCurrency = (value: number) => {
    return `${getCurrencySymbol(currency)}${value.toLocaleString()}`;
  };

  const formatTooltip = (value: any, name: string) => {
    if (name === 'winnings') {
      return [formatCurrency(value), 'Winnings'];
    }
    if (name === 'games') {
      return [value, 'Games Played'];
    }
    if (name === 'hours') {
      return [`${value}h`, 'Hours Played'];
    }
    return [value, name];
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle style={{ color: theme.colors.textPrimary }}>
            Monthly Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-slate-500">No data to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: theme.colors.textPrimary }}>
          Monthly Performance Trends
        </CardTitle>
        <p className="text-sm text-slate-500">
          Games played, winnings, and hours over the last 6 months
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.colors.border}
                opacity={0.5}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: theme.colors.textSecondary }}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: theme.colors.textSecondary }}
                tickFormatter={formatCurrency}
                label={{ 
                  value: 'Winnings', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: theme.colors.textSecondary }
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: theme.colors.textSecondary }}
                label={{ 
                  value: 'Games / Hours', 
                  angle: 90, 
                  position: 'insideRight',
                  style: { textAnchor: 'middle', fill: theme.colors.textSecondary }
                }}
              />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.textPrimary,
                  fontSize: '14px'
                }}
                labelStyle={{
                  color: theme.colors.textPrimary,
                  fontWeight: 'bold'
                }}
              />
              <Legend
                wrapperStyle={{
                  color: theme.colors.textSecondary,
                  fontSize: '14px'
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="winnings"
                fill={theme.colors.primary}
                opacity={0.8}
                name="Winnings"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="games"
                stroke={theme.colors.accent}
                strokeWidth={3}
                dot={{
                  fill: theme.colors.accent,
                  strokeWidth: 2,
                  stroke: theme.colors.surface,
                  r: 4
                }}
                name="Games"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="hours"
                stroke={theme.colors.secondary}
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{
                  fill: theme.colors.secondary,
                  strokeWidth: 2,
                  stroke: theme.colors.surface,
                  r: 4
                }}
                name="Hours"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 