import { Database, Brain, Target, AlertTriangle, Shield, TrendingUp } from "lucide-react";
import { KPICard, Card, ProgressBar } from "../components/ui-components";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useDashboardStats } from "../hooks/useApi";
import { useState, useEffect } from "react";
import { useSystemLogs } from "../hooks/useApi";

export function HomePage() {
  const { data: dashboardData, loading, error } = useDashboardStats();
  const { data: logsData } = useSystemLogs(8);
  const [accuracyData, setAccuracyData] = useState<any[]>([]);
  const [predictionVolumeData, setPredictionVolumeData] = useState<any[]>([]);

  // Transform API data to chart format
  useEffect(() => {
    if (dashboardData) {
      // Map accuracy trend to chart format
      if (dashboardData.recent_accuracy_trend && dashboardData.recent_accuracy_trend.length > 0) {
        const accuracy = dashboardData.recent_accuracy_trend.map((item: any) => ({
          time: item.date.split('-')[2], // Extract day
          accuracy: Math.round(item.accuracy * 100) / 100,
        }));
        setAccuracyData(accuracy);
      }

      // Map prediction volume to chart format
      if (dashboardData.prediction_volume_trend && dashboardData.prediction_volume_trend.length > 0) {
        const volume = dashboardData.prediction_volume_trend.map((item: any) => ({
          date: item.date.split('-')[2], // Extract day
          predictions: item.volume,
        }));
        setPredictionVolumeData(volume.slice(0, 7));
      }
    }
  }, [dashboardData]);

  const apiHealthLabel = dashboardData ? "Active" : "Unknown";
  const datasetFreshness = Math.min(100, dashboardData?.active_datasets ?? 0);
  const modelConfidence = Math.min(100, Math.round(dashboardData?.accuracy_percentage ?? 0));
  const predictionStability = Math.min(100, Math.round((dashboardData?.total_predictions ?? 0) / 100));

  const relativeTimeLabel = (timestamp?: string) => {
    if (!timestamp) return "just now";
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) return timestamp;

    const diffMs = Date.now() - parsed.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const recentActivities = (logsData?.logs ?? []).slice(0, 4).map((log) => ({
    time: relativeTimeLabel(log.timestamp),
    action: log.activity,
    detail: log.details,
    type: String(log.level || "INFO").toLowerCase(),
  }));

  // Display loading state
  if (loading) {
    return (
      <div className="space-y-8 max-w-[1600px]">
        <div className="mb-8">
          <h1 className="text-[#f8fafc] mb-3">Dashboard</h1>
          <p className="text-[#94a3b8] text-base">Loading data...</p>
        </div>
        <div className="text-[#94a3b8]">Fetching real-time data from API...</div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="space-y-8 max-w-[1600px]">
        <div className="mb-8">
          <h1 className="text-[#f8fafc] mb-3">Dashboard</h1>
          <p className="text-[#94a3b8] text-base">Error loading data</p>
        </div>
        <div className="text-red-400">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px]">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[#f8fafc] mb-3">Dashboard</h1>
        <p className="text-[#94a3b8] text-base">Overview of your AI Price Intelligence System</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KPICard
          title="Active Datasets"
          value={dashboardData?.active_datasets ?? 0}
          icon={Database}
          color="blue"
        />
        <KPICard
          title="Trained Models"
          value={dashboardData?.active_models ?? 0}
          icon={Brain}
          color="purple"
        />
        <KPICard
          title="Model Accuracy"
          value={`${(dashboardData?.accuracy_percentage ?? 0).toFixed(1)}%`}
          icon={Target}
          color="green"
        />
        <KPICard
          title="Total Predictions"
          value={dashboardData?.total_predictions ?? 0}
          icon={TrendingUp}
          color="blue"
        />
        <KPICard
          title="System Status"
          value={apiHealthLabel}
          icon={Shield}
          color="green"
        />
        <KPICard
          title="API Health"
          value={dashboardData ? "OK" : "N/A"}
          icon={Target}
          color="green"
        />
      </div>

      {/* System Health Section */}
      <Card title="System Health">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ProgressBar label="Dataset Freshness" value={datasetFreshness} color="green" />
          <ProgressBar label="Model Confidence" value={modelConfidence} color="blue" />
          <ProgressBar label="Prediction Stability" value={predictionStability} color="green" />
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Accuracy Over Time */}
        <Card title="Model Accuracy Over Time">
          {accuracyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={accuracyData}>
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#252d3f" />
              <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} domain={[85, 100]} tick={{ fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f1419",
                  border: "1px solid #252d3f",
                  borderRadius: "8px",
                  color: "#f8fafc",
                }}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#accuracyGradient)"
              />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-[#94a3b8]">No accuracy trend data</div>
          )}
        </Card>

        {/* Prediction Volume */}
        <Card title="Weekly Prediction Volume">
          {predictionVolumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={predictionVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252d3f" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} tick={{ fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f1419",
                  border: "1px solid #252d3f",
                  borderRadius: "8px",
                  color: "#f8fafc",
                }}
              />
              <Bar dataKey="predictions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-[#94a3b8]">No volume data</div>
          )}
        </Card>
      </div>

      {/* Recent Activities */}
      <Card title="Recent Activities">
        <div className="space-y-1">
          {recentActivities.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-lg hover:bg-[#1a1f2e] transition-all">
              <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                activity.type === "info" ? "bg-[#10b981]" : 
                activity.type === "warning" ? "bg-[#f59e0b]" : "bg-[#ef4444]"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#f8fafc]">{activity.action}</div>
                <div className="text-sm text-[#64748b] mt-1">{activity.detail}</div>
              </div>
              <div className="text-xs text-[#64748b] whitespace-nowrap">{activity.time}</div>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <div className="text-sm text-[#64748b] p-4">No activity yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}