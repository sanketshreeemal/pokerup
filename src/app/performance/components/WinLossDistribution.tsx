import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import theme from "@/theme/theme";

interface WinLossData {
  wins: number;
  losses: number;
  breakeven: number;
}

interface WinLossDistributionProps {
  data: WinLossData;
}

export function WinLossDistribution({ data }: WinLossDistributionProps) {
  const total = data.wins + data.losses + data.breakeven;
  
  const chartData = [
    { name: 'Wins', value: data.wins, color: theme.colors.success },
    { name: 'Losses', value: data.losses, color: theme.colors.error },
    { name: 'Break Even', value: data.breakeven, color: theme.colors.warning },
  ].filter(item => item.value > 0);

  const formatTooltip = (value: number, name: string) => {
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return [`${value} (${percentage}%)`, name];
  };

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle style={{ color: theme.colors.textPrimary }}>
            Win/Loss Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-slate-500">No completed games</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: theme.colors.textPrimary }}>
          Win/Loss Distribution
        </CardTitle>
        <p className="text-sm text-slate-500">
          Performance breakdown across {total} completed games
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.textPrimary,
                  fontSize: '14px'
                }}
              />
              <Legend
                wrapperStyle={{
                  color: theme.colors.textSecondary,
                  fontSize: '14px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: theme.colors.success }}>
              {data.wins}
            </div>
            <div className="text-sm text-slate-500">Wins</div>
            <div className="text-xs text-slate-400">
              {total > 0 ? `${((data.wins / total) * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: theme.colors.error }}>
              {data.losses}
            </div>
            <div className="text-sm text-slate-500">Losses</div>
            <div className="text-xs text-slate-400">
              {total > 0 ? `${((data.losses / total) * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: theme.colors.warning }}>
              {data.breakeven}
            </div>
            <div className="text-sm text-slate-500">Break Even</div>
            <div className="text-xs text-slate-400">
              {total > 0 ? `${((data.breakeven / total) * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 