import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeeklyProductivity } from "@/hooks/use-analytics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const isHighProductivity = value >= 80;

    return (
      <div className="bg-popover border-border min-w-[150px] rounded-lg border p-3 shadow-lg">
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}%</span>
          {isHighProductivity && (
            <span className="text-xs font-medium text-emerald-500">
              High perf.
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">Productivity Score</p>
      </div>
    );
  }
  return null;
};

const ProductivityChart = () => {
  const { data, isPending, isError } = useWeeklyProductivity();
  const chartData = data?.data;

  if (isPending) {
    return <Skeleton className="h-[350px] w-full rounded-xl" />;
  }

  if (isError || !chartData || chartData.length === 0) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <div className="space-y-1">
          <p className="text-foreground font-medium">No data available</p>
          <p className="text-muted-foreground text-sm">
            Complete some tasks to see your productivity trend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5624B2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5624B2" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              opacity={0.1}
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fontSize: 12, fill: "#6B7280" }}
            />

            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#5624B2",
                strokeWidth: 1,
                strokeDasharray: "5 5",
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#5624B2"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              activeDot={{
                r: 6,
                fill: "#5624B2",
                stroke: "white",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductivityChart;
