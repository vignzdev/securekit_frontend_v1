"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getTimelineData,
  type TimelineItem,
  type TilesData,
} from "@/app/api/dashboard";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const { user } = useUser();
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [tilesData, setTilesData] = useState<TilesData | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "email" | "ip">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endDateObj = endDate ? new Date(endDate) : new Date();
        const startDateObj = startDate ? new Date(startDate) : new Date();
        if (!startDate) {
          startDateObj.setDate(startDateObj.getDate() - 30); // Default to last 30 days
        }

        const timeline = await getTimelineData({
          check_type: filterType === "all" ? undefined : filterType,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
          start_date: startDateObj.toISOString().split("T")[0],
          end_date: endDateObj.toISOString().split("T")[0],
        });

        if (timeline.success && timeline.data) {
          setTimelineData(timeline.data.data || []);
          setTotalCount(timeline.data.total || 0);
          // Get tiles from response (could be in data.tiles or root tiles)
          const tiles = timeline.data.tiles || timeline.tiles;
          if (tiles) {
            setTilesData(tiles);
          }
        }
      } catch (error) {
        console.error("Failed to fetch timeline data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterType, currentPage, itemsPerPage, startDate, endDate]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, startDate, endDate]);

  const getRiskLevel = (riskScore: number): "Low" | "Medium" | "High" => {
    if (riskScore >= 70) return "High";
    if (riskScore >= 30) return "Medium";
    return "Low";
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  const getStatusBadgeColor = (result: string, isBlocked: boolean) => {
    if (isBlocked) {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    }
    if (result === "clean" || result === "allow") {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Use tiles data from API, fallback to calculated if not available
  const stats = tilesData
    ? {
        total_requests: tilesData.totalRequests,
        high_risk_count: tilesData.totalHighRisk,
        medium_risk_count: tilesData.totalMediumRisk,
        api_key_count: tilesData.apiCount,
      }
    : {
        total_requests: 0,
        high_risk_count: 0,
        medium_risk_count: 0,
        api_key_count: 0,
      };

  // Map timeline data to activities format
  const allActivities = timelineData.map((item) => ({
    id: item.id,
    query_type: item.check_type,
    query_value: item.checked_value,
    result: item.action,
    is_blocked: item.action === "block",
    is_disposable: false,
    is_vpn: false,
    is_tor: false,
    is_proxy: false,
    risk_score: item.score,
    created_at: item.created_at,
    api_key_name: item.api_key?.name,
  }));

  // Use timeline data directly (already filtered and paginated by API)
  const recentActivities = allActivities;

  // Pagination calculations based on total from API
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  // Store timeline items for API key access
  const timelineMap = new Map(
    timelineData.map((item) => [String(item.id), item])
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome,{" "}
          {user?.name
            ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
            : "Guest"}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your API activity and security status.
        </p>
      </div>

      {/* Stats Tiles - Matching Screenshot Design */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Requests */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Requests
                </span>
              </div>
              <div className="text-3xl font-bold">
                {stats.total_requests.toLocaleString()}
              </div>
            </div>

            {/* High Risk */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  High Risk
                </span>
              </div>
              <div className="text-3xl font-bold">
                {stats.high_risk_count.toLocaleString()}
              </div>
            </div>

            {/* Medium Risk */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Medium Risk
                </span>
              </div>
              <div className="text-3xl font-bold">
                {stats.medium_risk_count.toLocaleString()}
              </div>
            </div>

            {/* API Count */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  API Count
                </span>
              </div>
              <div className="text-3xl font-bold">
                {stats.api_key_count.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Recent Activity</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
                placeholder="End Date"
              />
              <Select
                value={filterType}
                onValueChange={(value) =>
                  setFilterType(value as "all" | "email" | "ip")
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="ip">IP Address</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {recentActivities.length === 0 && filterType !== "all"
                        ? `No ${filterType} activities found`
                        : "No recent activities"}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recentActivities.map((activity) => {
                  const riskLevel = getRiskLevel(activity.risk_score);
                  const timelineItem = timelineMap.get(String(activity.id));
                  return (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium capitalize">
                        {activity.query_type}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {activity.query_value}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(
                            activity.result,
                            activity.is_blocked
                          )}`}
                        >
                          {activity.is_blocked
                            ? "Blocked"
                            : activity.result === "allow"
                            ? "Allowed"
                            : activity.result}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getRiskBadgeColor(
                            riskLevel
                          )}`}
                        >
                          {riskLevel} ({activity.risk_score})
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {timelineItem?.api_key?.name || "N/A"}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {startIndex + 1} to {endIndex} of {totalCount} entries
                {filterType !== "all" && ` (filtered by ${filterType})`}
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-9"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
