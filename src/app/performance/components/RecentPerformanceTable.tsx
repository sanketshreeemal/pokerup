import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import theme, { getCurrencySymbol } from "@/theme/theme";

interface RecentPerformanceData {
  gameName: string;
  date: string;
  winnings: number;
  roi: number;
  duration: string;
}

interface RecentPerformanceTableProps {
  data: RecentPerformanceData[];
  currency: string;
}

export function RecentPerformanceTable({ data, currency }: RecentPerformanceTableProps) {
  const formatCurrency = (value: number) => {
    return `${getCurrencySymbol(currency)}${value.toLocaleString()}`;
  };

  const formatROI = (roi: number) => {
    const formatted = roi.toFixed(1);
    return `${roi >= 0 ? '+' : ''}${formatted}%`;
  };

  const getWinningsColor = (winnings: number) => {
    if (winnings > 0) return theme.colors.success;
    if (winnings < 0) return theme.colors.error;
    return theme.colors.textSecondary;
  };

  const getROIColor = (roi: number) => {
    if (roi > 0) return theme.colors.success;
    if (roi < 0) return theme.colors.error;
    return theme.colors.textSecondary;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle style={{ color: theme.colors.textPrimary }}>
            Recent Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-slate-500">No completed games to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: theme.colors.textPrimary }}>
          Recent Performance
        </CardTitle>
        <p className="text-sm text-slate-500">
          Your last {data.length} completed games
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                Game
              </TableHead>
              <TableHead className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                Date
              </TableHead>
              <TableHead className="font-semibold text-right" style={{ color: theme.colors.textPrimary }}>
                Winnings
              </TableHead>
              <TableHead className="font-semibold text-right" style={{ color: theme.colors.textPrimary }}>
                ROI
              </TableHead>
              <TableHead className="font-semibold text-right" style={{ color: theme.colors.textPrimary }}>
                Duration
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((game, index) => (
              <TableRow key={index} className="hover:bg-slate-50">
                <TableCell className="font-medium max-w-[150px]">
                  <div className="truncate" title={game.gameName}>
                    {game.gameName}
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">
                  {game.date}
                </TableCell>
                <TableCell 
                  className="text-right font-semibold"
                  style={{ color: getWinningsColor(game.winnings) }}
                >
                  {formatCurrency(game.winnings)}
                </TableCell>
                <TableCell 
                  className="text-right font-semibold"
                  style={{ color: getROIColor(game.roi) }}
                >
                  {formatROI(game.roi)}
                </TableCell>
                <TableCell className="text-right text-slate-600">
                  {game.duration}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 