import { Card, Badge, Button } from "../components/ui-components";
import { Search, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { useSystemLogs } from "../hooks/useApi";
import { useToast } from "../components/Toast";

function getSeverityVariant(level: string) {
  const normalized = level.toLowerCase();
  if (normalized === "error") return "danger";
  if (normalized === "warning") return "warning";
  return "info";
}

export function SystemLogs() {
  const { showToast } = useToast();
  const { data, loading } = useSystemLogs(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  const filteredLogs = useMemo(() => {
    const logs = data?.logs ?? [];
    if (!searchQuery) {
      return logs;
    }
    const q = searchQuery.toLowerCase();
    return logs.filter((log) =>
      log.activity.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.level.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  // Handler for export logs
  const handleExportLogs = async () => {
    setExporting(true);
    try {
      // Create CSV content
      const csvHeader = 'Timestamp,Level,Activity,Details\n';
      const csvContent = filteredLogs
        .map(log => 
          `"${log.timestamp}","${log.level}","${log.activity}","${log.details.replace(/"/g, '""')}"`
        )
        .join('\n');

      const csv = csvHeader + csvContent;

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      showToast(`Exported ${filteredLogs.length} log entries to CSV`, 'success');
    } catch (error) {
      showToast('Failed to export logs', 'error');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px]">
      <div className="mb-8">
        <h1 className="text-[#f8fafc] mb-3">System Logs</h1>
        <p className="text-[#94a3b8] text-base">Track system activity and platform events</p>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-[#94a3b8]">
            {loading ? "Loading logs..." : `Showing ${filteredLogs.length} log entries`}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportLogs}
              disabled={exporting || filteredLogs.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <div className="relative">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card title="System Event Logs">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-[#64748b]">No logs available</div>
        ) : (
          <div className="overflow-x-auto -mx-8 -mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252d3f]">
                  <th className="text-left py-4 px-8 text-sm font-semibold text-[#94a3b8]">Timestamp</th>
                  <th className="text-left py-4 px-8 text-sm font-semibold text-[#94a3b8]">Level</th>
                  <th className="text-left py-4 px-8 text-sm font-semibold text-[#94a3b8]">Activity</th>
                  <th className="text-left py-4 px-8 text-sm font-semibold text-[#94a3b8]">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={`${log.timestamp}-${idx}`} className="border-b border-[#252d3f] last:border-0">
                    <td className="py-4 px-8 text-sm text-[#f8fafc] font-mono">{log.timestamp}</td>
                    <td className="py-4 px-8">
                      <Badge variant={getSeverityVariant(log.level)}>{log.level}</Badge>
                    </td>
                    <td className="py-4 px-8 text-sm text-[#f8fafc]">{log.activity}</td>
                    <td className="py-4 px-8 text-sm text-[#94a3b8] max-w-xl truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}