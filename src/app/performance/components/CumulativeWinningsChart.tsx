import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import theme, { getCurrencySymbol } from "@/theme/theme";

interface CumulativeWinningsData {
  gameIndex: number;
  gameName: string;
  date: string;
  winnings: number;
  cumulativeWinnings: number;
}

interface CumulativeWinningsChartProps {
  data: CumulativeWinningsData[];
  currency: string;
}

export function CumulativeWinningsChart({ data, currency }: CumulativeWinningsChartProps) {
  const formatCurrency = (value: number) => {
    return `${getCurrencySymbol(currency)}${value.toLocaleString()}`;
  };

  const formatTooltip = (value: any, name: string, props: any) => {
    if (name === 'cumulativeWinnings') {
      return [formatCurrency(value), 'Cumulative Winnings'];
    }
    return [value, name];
  };

  const formatLabel = (label: string, payload: any) => {
    if (payload && payload.length > 0) {
      const data = payload[0].payload;
      return `Game ${label}: ${data.gameName}`;
    }
    return `Game ${label}`;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle style={{ color: theme.colors.textPrimary }}>
            Cumulative Winnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-slate-500">No completed games to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const minValue = Math.min(...data.map(d => d.cumulativeWinnings));
  const maxValue = Math.max(...data.map(d => d.cumulativeWinnings));
  const range = maxValue - minValue;
  const padding = range * 0.1;

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: theme.colors.textPrimary }}>
          Cumulative Winnings Over Time
        </CardTitle>
        <p className="text-sm text-slate-500">
          Track your poker performance across all completed games
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                dataKey="gameIndex"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: theme.colors.textSecondary }}
                label={{ 
                  value: 'Game Number', 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { textAnchor: 'middle', fill: theme.colors.textSecondary }
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: theme.colors.textSecondary }}
                tickFormatter={formatCurrency}
                domain={[minValue - padding, maxValue + padding]}
                label={{ 
                  value: 'Cumulative Winnings', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: theme.colors.textSecondary }
                }}
              />
              <Tooltip
                formatter={formatTooltip}
                labelFormatter={formatLabel}
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
              <ReferenceLine 
                y={0} 
                stroke={theme.colors.textSecondary} 
                strokeDasharray="2 2"
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="cumulativeWinnings"
                stroke={theme.colors.primary}
                strokeWidth={3}
                dot={{
                  fill: theme.colors.primary,
                  strokeWidth: 2,
                  stroke: theme.colors.surface,
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  stroke: theme.colors.primary,
                  strokeWidth: 2,
                  fill: theme.colors.surface
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 