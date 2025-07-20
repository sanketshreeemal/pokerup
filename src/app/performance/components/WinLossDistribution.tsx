// Removed recharts imports since we're removing the pie chart
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

  if (total === 0) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader>
          <CardTitle style={{ color: theme.colors.textPrimary }}>
            Win/Loss Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[120px] flex items-center justify-center">
            <p className="text-slate-500">No completed games</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle style={{ color: theme.colors.textPrimary }}>
          Win/Loss Distribution
        </CardTitle>
        <p className="text-sm text-slate-500">
          Performance breakdown across {total} games
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
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