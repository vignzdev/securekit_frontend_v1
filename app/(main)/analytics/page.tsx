"use client";

import { useState, useEffect, useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import {
  getBlocksChallengesOverTime,
  type BlocksChallengesDataPoint,
} from "@/app/api/dashboard";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const description = "An interactive line chart";

const chartConfig = {
  allow: {
    label: "Allowed",
    color: "hsl(var(--chart-1))",
  },
  challenge: {
    label: "Challenged",
    color: "hsl(var(--chart-2))",
  },
  block: {
    label: "Blocked",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const { user } = useUser();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("90d");
  const [checkType, setCheckType] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [chartData, setChartData] = useState<BlocksChallengesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<
    "block" | "challenge" | "allow"
  >("block");

  const chartTotals = useMemo(
    () => ({
      block: chartData.reduce((acc, curr) => acc + curr.block, 0),
      challenge: chartData.reduce((acc, curr) => acc + curr.challenge, 0),
      allow: chartData.reduce((acc, curr) => acc + curr.allow, 0),
    }),
    [chartData]
  );

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, checkType, groupBy, user?.id]);

  const fetchAnalyticsData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();

      if (timeRange === "7d") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === "30d") {
        startDate.setDate(startDate.getDate() - 30);
      } else {
        startDate.setDate(startDate.getDate() - 90);
      }

      const response = await getBlocksChallengesOverTime({
        user_id: user.id,
        check_type: checkType === "all" ? undefined : checkType,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        group_by: groupBy,
      });

      if (response.success && response.data.data) {
        setChartData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = chartData.map((item) => ({
    date: item.period,
    allow: item.allow,
    challenge: item.challenge,
    block: item.block,
    total: item.total,
  }));

  const getDateFormatter = () => {
    if (groupBy === "month") {
      return (value: string) => {
        const date = new Date(value);
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      };
    } else if (groupBy === "week") {
      return (value: string) => {
        const date = new Date(value);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      };
    }
    return (value: string) => {
      const date = new Date(value);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Line Chart - Interactive */}
      <Card className="py-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Blocks & Challenges Over Time</CardTitle>
            <CardDescription>
              Analytics showing allowed, challenged, and blocked requests
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={checkType} onValueChange={setCheckType}>
              <SelectTrigger className="w-[140px] rounded-lg">
                <SelectValue placeholder="Check Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="rounded-lg">
                  All Types
                </SelectItem>
                <SelectItem value="ip" className="rounded-lg">
                  IP Address
                </SelectItem>
                <SelectItem value="email" className="rounded-lg">
                  Email
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={groupBy}
              onValueChange={(value) =>
                setGroupBy(value as "day" | "week" | "month")
              }
            >
              <SelectTrigger className="w-[120px] rounded-lg">
                <SelectValue placeholder="Group By" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="day" className="rounded-lg">
                  Day
                </SelectItem>
                <SelectItem value="week" className="rounded-lg">
                  Week
                </SelectItem>
                <SelectItem value="month" className="rounded-lg">
                  Month
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={timeRange}
              onValueChange={(value) =>
                setTimeRange(value as "7d" | "30d" | "90d")
              }
            >
              <SelectTrigger
                className="w-[160px] rounded-lg"
                aria-label="Select time range"
              >
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">
                  Last 3 months
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Last 30 days
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Last 7 days
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
          <div className="flex">
            {(["block", "challenge", "allow"] as const).map((key) => {
              return (
                <button
                  key={key}
                  data-active={activeChart === key}
                  className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                  onClick={() => setActiveChart(key)}
                >
                  <span className="text-muted-foreground text-xs">
                    {chartConfig[key].label}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-3xl">
                    {chartTotals[key].toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">Loading analytics...</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">No data available</div>
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={filteredData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={getDateFormatter()}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />
                <Line
                  dataKey={activeChart}
                  type="monotone"
                  stroke="#006cec"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
