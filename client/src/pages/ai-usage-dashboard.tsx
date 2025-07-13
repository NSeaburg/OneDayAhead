import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Activity, DollarSign, Users, TrendingUp } from "lucide-react";

interface AiUsageStats {
  totalRequests: number;
  totalTokens: number;
  estimatedCost: number;
  topUsers: Array<{
    sessionId: string;
    requestCount: number;
    tokenCount: number;
  }>;
}

interface UsageData {
  today: AiUsageStats;
  yesterday: AiUsageStats;
  week: AiUsageStats;
  month: AiUsageStats;
}

export default function AiUsageDashboard() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/ai-usage", {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch usage data");
      }
      
      const data = await response.json();
      setUsageData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchUsageData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getCostAlertLevel = (cost: number) => {
    if (cost >= 100) return { level: "critical", color: "bg-red-100 text-red-800 border-red-200" };
    if (cost >= 50) return { level: "warning", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    return { level: "normal", color: "bg-green-100 text-green-800 border-green-200" };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">AI Usage Dashboard</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">AI Usage Dashboard</h1>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading usage data: {error}
          </AlertDescription>
        </Alert>
        <Button onClick={fetchUsageData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">AI Usage Dashboard</h1>
        <p>No data available</p>
      </div>
    );
  }

  const todayAlert = getCostAlertLevel(usageData.today.estimatedCost);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">AI Usage Dashboard</h1>
        <Button onClick={fetchUsageData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Cost Alerts */}
      {usageData.today.estimatedCost >= 50 && (
        <Alert className={`mb-6 ${todayAlert.color}`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {usageData.today.estimatedCost >= 100 
              ? `🚨 CRITICAL: Daily cost has reached ${formatCurrency(usageData.today.estimatedCost)} - Auto-disable threshold!`
              : `⚠️ WARNING: Daily cost has reached ${formatCurrency(usageData.today.estimatedCost)} - Approaching $50 threshold`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(usageData.today.totalRequests)}</div>
            <p className="text-xs text-muted-foreground">
              AI API calls today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tokens</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(usageData.today.totalTokens)}</div>
            <p className="text-xs text-muted-foreground">
              Estimated tokens consumed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(usageData.today.estimatedCost)}</div>
            <Badge className={todayAlert.color}>
              {todayAlert.level}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.today.topUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Users with AI activity today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>Comparison across time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Today</span>
                <div className="text-right">
                  <div className="font-medium">{formatNumber(usageData.today.totalRequests)} requests</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(usageData.today.estimatedCost)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Yesterday</span>
                <div className="text-right">
                  <div className="font-medium">{formatNumber(usageData.yesterday.totalRequests)} requests</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(usageData.yesterday.estimatedCost)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">This Week</span>
                <div className="text-right">
                  <div className="font-medium">{formatNumber(usageData.week.totalRequests)} requests</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(usageData.week.estimatedCost)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">This Month</span>
                <div className="text-right">
                  <div className="font-medium">{formatNumber(usageData.month.totalRequests)} requests</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(usageData.month.estimatedCost)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Users Today</CardTitle>
            <CardDescription>Highest usage by session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageData.today.topUsers.slice(0, 10).map((user, index) => (
                <div key={user.sessionId} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="text-sm font-mono">{user.sessionId.substring(0, 8)}...</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatNumber(user.requestCount)} req</div>
                    <div className="text-xs text-muted-foreground">{formatNumber(user.tokenCount)} tokens</div>
                  </div>
                </div>
              ))}
              {usageData.today.topUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">No usage data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limits Information */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rate Limits</CardTitle>
          <CardDescription>Current abuse prevention measures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <div className="text-sm text-muted-foreground">AI requests per minute</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">30</div>
              <div className="text-sm text-muted-foreground">AI requests per 10 minutes</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">100</div>
              <div className="text-sm text-muted-foreground">AI messages per day</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <div className="text-sm text-muted-foreground">Experiences per day</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}