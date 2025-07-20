import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import theme, { getCurrencySymbol } from "@/theme/theme";

const getNiceTicks = (minValue: number, maxValue: number, tickCount = 5) => {
  const range = maxValue - minValue;

  if (range <= 0 || !isFinite(range)) {
    const center = minValue && isFinite(minValue) ? minValue : 0;
    const step = 1;
    const ticks = Array.from({ length: tickCount }, (_, i) => 
      Math.round(center - (step * Math.floor(tickCount/2)) + (i * step))
    );
    return {
      domain: [ticks[0], ticks[ticks.length - 1]],
      ticks: ticks
    };
  }

  const rawStep = range / (tickCount - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;

  let niceStep;
  if (residual > 5) {
    niceStep = 10 * magnitude;
  } else if (residual > 2) {
    niceStep = 5 * magnitude;
  } else if (residual > 1) {
    niceStep = 2 * magnitude;
  } else {
    niceStep = magnitude;
  }

  if (niceStep <= 0) {
    niceStep = 1;
  }

  const niceMin = Math.floor(minValue / niceStep) * niceStep;
  const niceMax = Math.ceil(maxValue / niceStep) * niceStep;

  const ticks = [];
  let currentValue = niceMin;
  while (currentValue <= niceMax) {
    ticks.push(currentValue);
    currentValue += niceStep;
  }
  
  return { domain: [niceMin, niceMax], ticks };
};


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
  totalPotSize?: number;
}

export function CumulativeWinningsChart({ data, currency, totalPotSize }: CumulativeWinningsChartProps) {
  const formatCurrency = (value: number) => {
    return `${getCurrencySymbol(currency)}${Math.round(value).toLocaleString()}`;
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
      <Card className="bg-white shadow-sm border border-slate-200">
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
  const { domain, ticks } = getNiceTicks(minValue, maxValue, 5);

  // Determine X-axis span and whether positive/negative areas exist
  const xMin = Math.min(...data.map(d => d.gameIndex));
  const xMax = Math.max(...data.map(d => d.gameIndex));
  const hasPositive = domain[1] > 0;
  const hasNegative = domain[0] < 0;

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle style={{ color: theme.colors.textPrimary }}>
          Cumulative Winnings Over Time
        </CardTitle>
        <p className="text-sm text-slate-500">
          Track your poker performance across all games
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 5,
                left: -20,
                bottom: 20,
              }}
            >
              <defs>
                <linearGradient id="gradientPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#dcfce7" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="gradientNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fee2e2" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.colors.border}
                opacity={0.5}
              />

              {/* Shaded regions above and below break-even (0) */}
              {hasNegative && (
                <ReferenceArea
                  x1={xMin}
                  x2={xMax}
                  y1={domain[0]}
                  y2={0}
                  strokeOpacity={0}
                  fill="url(#gradientNegative)"
                />
              )}
              {hasPositive && (
                <ReferenceArea
                  x1={xMin}
                  x2={xMax}
                  y1={0}
                  y2={domain[1]}
                  strokeOpacity={0}
                  fill="url(#gradientPositive)"
                />
              )}
              <XAxis
                dataKey="gameIndex"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: theme.colors.textSecondary }}
                label={{ 
                  value: 'Game Number', 
                  position: 'insideBottom', 
                  offset: -15,
                  style: { textAnchor: 'middle', fill: theme.colors.textSecondary }
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: theme.colors.textSecondary }}
                tickFormatter={formatCurrency}
                domain={domain}
                ticks={ticks}
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
                stroke="#6b7280" /* slightly darker for prominence */
                strokeDasharray="4 4"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="cumulativeWinnings"
                stroke={theme.colors.textSecondary}
                strokeWidth={3}
                dot={{
                  fill: "#374151",
                  strokeWidth: 2,
                  stroke: theme.colors.surface,
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  stroke: "#374151",
                  strokeWidth: 2,
                  fill: theme.colors.surface
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Total Pot Stat */}
        {totalPotSize !== undefined && (
          <div className="mt-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">
                  Total Pot Played
                </div>
                <div className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                  {formatCurrency(totalPotSize)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 