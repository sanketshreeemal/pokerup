import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import theme, { getCurrencySymbol } from "@/theme/theme";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  currency?: string;
  className?: string;
  dualValue?: {
    leftValue: number;
    rightValue: number;
    leftColor?: string;
    rightColor?: string;
  };
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  currency,
  className = "",
  dualValue
}: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number' && currency) {
      return `${getCurrencySymbol(currency)}${val.toLocaleString()}`;
    }
    return val;
  };

  const formatDualNumber = (num: number) => {
    if (currency) {
      return `${getCurrencySymbol(currency)}${num.toLocaleString()}`;
    }
    return num.toLocaleString();
  };

  return (
    <Card className={`${className} hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-slate-200 bg-gradient-to-br from-white to-slate-50`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {title}
        </CardTitle>
        <div 
          className="h-8 w-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${theme.colors.primary}15` }}
        >
          <Icon 
            className="h-4 w-4" 
            style={{ color: theme.colors.primary }}
          />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {dualValue ? (
          <div className="text-xl lg:text-2xl font-bold mb-1 flex items-center gap-2">
            <span style={{ color: dualValue.leftColor || theme.colors.success }}>
              {formatDualNumber(dualValue.leftValue)}
            </span>
            <span style={{ color: theme.colors.textSecondary }}>/</span>
            <span style={{ color: dualValue.rightColor || theme.colors.error }}>
              {formatDualNumber(Math.abs(dualValue.rightValue))}
            </span>
          </div>
        ) : (
          <div className="text-xl lg:text-2xl font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
            {formatValue(value)}
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 leading-tight">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span 
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                trend.isPositive 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-700 bg-red-100'
              }`}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-slate-400 ml-2">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 