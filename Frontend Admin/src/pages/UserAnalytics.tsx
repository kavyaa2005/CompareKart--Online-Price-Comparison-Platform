import { Card } from "../components/ui-components";
import { Search, TrendingUp, Bell, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useUserBehavior, useEngagementAnalytics } from "../hooks/useApi";

export function UserAnalytics() {
  const { data: userBehavior } = useUserBehavior();
  const { data: engagement } = useEngagementAnalytics();

  const userJourneyData = userBehavior ? [
    { stage: "Search", users: userBehavior.total_users },
    { stage: "Active", users: userBehavior.active_users },
    { stage: "Predictions", users: Math.round(userBehavior.active_users * userBehavior.predictions_per_user) },
  ] : [];

  const engagementTrend = engagement?.engagement_trend ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[#f3f4f6] mb-2">User Interaction Analytics</h1>
        <p className="text-[#9ca3af]">Aggregate behavior analytics and usage patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9ca3af]">Total Searches</span>
            <Search className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="text-2xl font-semibold text-[#f3f4f6]">{userBehavior?.total_users?.toLocaleString() ?? "-"}</div>
          <div className="text-xs text-[#9ca3af] mt-1">Updated from API</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9ca3af]">Product Comparisons</span>
            <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <div className="text-2xl font-semibold text-[#f3f4f6]">{engagement?.total_sessions?.toLocaleString() ?? "-"}</div>
          <div className="text-xs text-[#9ca3af] mt-1">Updated from API</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9ca3af]">Price Alerts Set</span>
            <Bell className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl font-semibold text-[#f3f4f6]">{userBehavior?.predictions_per_user?.toFixed(2) ?? "-"}</div>
          <div className="text-xs text-[#9ca3af] mt-1">Updated from API</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9ca3af]">Active Users</span>
            <Users className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-2xl font-semibold text-[#f3f4f6]">{userBehavior?.active_users?.toLocaleString() ?? "-"}</div>
          <div className="text-xs text-[#9ca3af] mt-1">Updated from API</div>
        </Card>
      </div>

      {/* Most Searched Products */}
      <Card title="Most Searched Products">
        <div className="space-y-3">
          {(userBehavior?.popular_products ?? []).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1a2332] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1a2332] rounded-full flex items-center justify-center text-sm font-semibold text-[#9ca3af]">
                  {idx + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#f3f4f6]">{item.name}</div>
                  <div className="text-xs text-[#6b7280]">{item.searches.toLocaleString()} searches</div>
                </div>
              </div>
              <div className="text-sm font-medium text-[#10b981]">Active</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Most Compared Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Most Compared Products">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(userBehavior?.popular_platforms ?? []).map((p) => ({
              product: p.platform,
              comparisons: p.queries,
            }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#243447" />
              <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis type="category" dataKey="product" stroke="#9ca3af" style={{ fontSize: '11px' }} width={150} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #243447",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                }}
              />
              <Bar dataKey="comparisons" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Price Alert Subscriptions */}
        <Card title="Engagement Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementTrend.map((item) => ({
              week: item.date,
              subscriptions: item.predictions,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243447" />
              <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #243447",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                }}
              />
              <Line type="monotone" dataKey="subscriptions" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* User Journey Funnel */}
      <Card title="User Journey Funnel">
        <div className="space-y-3">
          {userJourneyData.map((stage, idx) => {
            const base = userJourneyData[0]?.users ?? 0;
            const percentage = base > 0 ? (stage.users / base) * 100 : 0;
            const dropoffRate = idx > 0 && userJourneyData[idx - 1]?.users
              ? ((userJourneyData[idx - 1].users - stage.users) / userJourneyData[idx - 1].users * 100).toFixed(1)
              : null;

            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#3b82f6]/20 rounded-full flex items-center justify-center text-sm font-semibold text-[#3b82f6]">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium text-[#f3f4f6]">{stage.stage}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#f3f4f6]">{stage.users.toLocaleString()}</div>
                    <div className="text-xs text-[#6b7280]">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="h-12 bg-[#1a2332] rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center"
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 15 && (
                      <span className="text-sm font-medium text-white">
                        {stage.users.toLocaleString()} users
                      </span>
                    )}
                  </div>
                </div>
                {dropoffRate && (
                  <div className="text-xs text-[#ef4444] mt-1">
                    {dropoffRate}% drop-off from previous stage
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Behavior Insights */}
      <Card title="Behavior Insights">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-[#1a2332] rounded-lg">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-semibold text-[#f3f4f6] mb-1">{engagement?.avg_session_duration_minutes?.toFixed(2) ?? "-"} min</div>
            <div className="text-sm text-[#9ca3af]">Avg Session Duration</div>
            <div className="text-xs text-[#6b7280] mt-1">Updated from API</div>
          </div>
          <div className="text-center p-4 bg-[#1a2332] rounded-lg">
            <div className="text-3xl mb-2">🔍</div>
            <div className="text-2xl font-semibold text-[#f3f4f6] mb-1">{userBehavior?.predictions_per_user?.toFixed(2) ?? "-"}</div>
            <div className="text-sm text-[#9ca3af]">Products per Session</div>
            <div className="text-xs text-[#6b7280] mt-1">Updated from API</div>
          </div>
          <div className="text-center p-4 bg-[#1a2332] rounded-lg">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-semibold text-[#f3f4f6] mb-1">{engagement?.bounce_rate?.toFixed(2) ?? "-"}%</div>
            <div className="text-sm text-[#9ca3af]">Set Price Alert Rate</div>
            <div className="text-xs text-[#6b7280] mt-1">Updated from API</div>
          </div>
        </div>
      </Card>

      {/* Privacy Notice */}
      <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div>
            <div className="text-sm font-medium text-[#3b82f6] mb-1">Privacy-First Analytics</div>
            <div className="text-xs text-[#9ca3af]">
              All analytics data is aggregated and anonymized. No personally identifiable information (PII) 
              is collected or stored. We track behavior patterns, not individual users.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
