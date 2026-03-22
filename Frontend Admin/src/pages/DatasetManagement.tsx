import { Card, Button, Badge } from "../components/ui-components";
import { Upload, RefreshCw, Eye, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useDatasetList, useDatasetStats } from "../hooks/useApi";
import { useToast } from "../components/Toast";
import { apiClient } from "../api/client";

export function DatasetManagement() {
  const { showToast } = useToast();
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "validation" | "versions">("overview");
  const [datasets, setDatasets] = useState<Array<{
    id: number;
    name: string;
    source: string;
    version: string;
    status: string;
    lastUpdated: string;
    rows: number;
  }>>([]);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: datasetList, loading: datasetListLoading, refetch: refetchList } = useDatasetList();
  const { data: datasetStats, loading: datasetStatsLoading } = useDatasetStats();

  // Transform API data to table format
  useEffect(() => {
    if (datasetList?.datasets && datasetList.datasets.length > 0) {
      const transformed = datasetList.datasets.map((ds: any, idx: number) => ({
        id: idx + 1,
        name: ds.dataset_name,
        source: "API",
        version: "1.0.0",
        status: "active",
        lastUpdated: ds.last_updated,
        rows: ds.total_records,
      }));
      setDatasets(transformed);
    }
  }, [datasetList]);

  // Handler for Upload Dataset button
  const handleUploadDataset = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      try {
        await apiClient.uploadDataset(file);
        showToast(`Dataset "${file.name}" uploaded successfully!`, 'success');
        refetchList();
      } catch (error) {
        showToast(`Failed to upload dataset: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  // Handler for View Dataset button
  const handleViewDataset = (datasetId: number) => {
    const dataset = datasets.find(d => d.id === datasetId);
    setSelectedDataset(datasetId);
    showToast(`Viewing details for "${dataset?.name}"`, 'info');
  };

  // Handler for Refresh Dataset button
  const handleRefreshDataset = async (datasetId: number) => {
    setRefreshing(true);
    try {
      const dataset = datasets.find(d => d.id === datasetId);
      const result = await apiClient.refreshDataset();
      showToast(`Dataset "${dataset?.name}" refreshed successfully at ${result.refreshed_at}!`, 'success');
      refetchList();
    } catch (error) {
      showToast(`Failed to refresh dataset: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Handler for Batch Operations
  const handleRefreshAll = async () => {
    showToast('Refreshing all datasets... This may take a few minutes.', 'info');
    try {
      const result = await apiClient.refreshDataset();
      showToast(`All ${datasets.length} datasets refreshed successfully! (${result.total_records.toLocaleString()} records)`, 'success');
      refetchList();
    } catch (error) {
      showToast(`Failed to refresh all datasets: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleRunValidation = async () => {
    showToast('Running data validation... Please wait.', 'info');
    try {
      const result = await apiClient.validateDataset();
      if (result.status === 'passed') {
        showToast('Validation complete! All datasets passed quality checks.', 'success');
      } else {
        showToast(`Validation failed: ${result.errors.join('; ')}`, 'error');
      }
    } catch (error) {
      showToast(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleSimulateBatch = async () => {
    showToast('Simulating batch processing with all data...', 'info');
    try {
      const result = await apiClient.simulateDatasetBatch();
      showToast(
        `Batch simulation complete! ${result.processed_records.toLocaleString()} processed, ${result.error_count} errors`,
        'success'
      );
    } catch (error) {
      showToast(`Batch simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px]">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[#f8fafc] mb-3">Dataset Management</h1>
          <p className="text-[#94a3b8] text-base">Manage and monitor your AI training datasets</p>
        </div>
        <Button 
          variant="primary"
          onClick={handleUploadDataset}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Dataset'}
        </Button>
      </div>

      {/* Dataset List */}
      <Card title="Active Datasets">
        <div className="overflow-x-auto -mx-8 -mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#252d3f]">
                <th className="text-left py-4 px-8 text-sm font-semibold text-[#94a3b8]">Dataset Name</th>
                <th className="text-left py-4 px-8 text-sm font-semibold text-[#94a3b8]">Source</th>
                <th className="text-left py-4 px-8 text-sm font-semibold text-[#94a3b8]">Version</th>
                <th className="text-left py-4 px-8 text-sm font-semibold text-[#94a3b8]">Status</th>
                <th className="text-left py-4 px-8 text-sm font-semibold text-[#94a3b8]">Rows</th>
                <th className="text-left py-4 px-8 text-sm font-semibold text-[#94a3b8]">Last Updated</th>
                <th className="text-left py-4 px-8 text-sm font-semibold text-[#94a3b8]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasetListLoading ? (
                <tr>
                  <td colSpan={7} className="py-6 px-8 text-center text-[#94a3b8]">
                    Loading datasets...
                  </td>
                </tr>
              ) : datasets.length > 0 ? (
                datasets.map((dataset) => (
                  <tr
                    key={dataset.id}
                    className="border-b border-[#252d3f] last:border-0 hover:bg-[#1a1f2e] transition-all cursor-pointer"
                    onClick={() => setSelectedDataset(dataset.id)}
                  >
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#3b82f6]" />
                        <span className="text-sm text-[#f8fafc] font-medium">{dataset.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-8 text-sm text-[#94a3b8]">{dataset.source}</td>
                    <td className="py-4 px-8 text-sm text-[#94a3b8] font-mono">{dataset.version}</td>
                    <td className="py-4 px-8">
                      <Badge variant={
                        dataset.status === "active" ? "success" :
                        dataset.status === "processing" ? "info" : "warning"
                      }>
                        {dataset.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-8 text-sm text-[#94a3b8] font-mono">{dataset.rows.toLocaleString()}</td>
                    <td className="py-4 px-8 text-sm text-[#64748b]">{dataset.lastUpdated}</td>
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 hover:bg-[#252d3f] rounded-lg transition-all"
                          onClick={() => handleViewDataset(dataset.id)}
                          title="View dataset details"
                        >
                          <Eye className="w-4 h-4 text-[#94a3b8]" />
                        </button>
                        <button 
                          className="p-2 hover:bg-[#252d3f] rounded-lg transition-all"
                          onClick={() => handleRefreshDataset(dataset.id)}
                          disabled={refreshing}
                          title="Refresh this dataset"
                        >
                          <RefreshCw className={`w-4 h-4 text-[#94a3b8] ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 px-8 text-center text-[#94a3b8]">
                    No datasets available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dataset Detail View */}
      {selectedDataset && (
        <Card title={`Dataset Details: ${datasets.find(d => d.id === selectedDataset)?.name}`}>
          {/* Tabs */}
          <div className="border-b border-[#252d3f] -mx-8 px-8 mb-8">
            <div className="flex gap-8">
              {(["overview", "validation", "versions"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab
                      ? "border-[#3b82f6] text-[#f8fafc]"
                      : "border-transparent text-[#94a3b8] hover:text-[#cbd5e1]"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-sm text-[#94a3b8] font-medium mb-2">Total Records</div>
                <div className="text-3xl font-semibold text-[#f8fafc] tracking-tight">
                  {datasetStatsLoading ? "Loading" : (datasetStats?.total_records ?? 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#94a3b8] font-medium mb-2">Products</div>
                <div className="text-3xl font-semibold text-[#f8fafc] tracking-tight">
                  {datasetStatsLoading ? "Loading" : (datasetStats?.products.count ?? 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#94a3b8] font-medium mb-2">Platforms</div>
                <div className="text-3xl font-semibold text-[#f8fafc] tracking-tight">
                  {datasetStatsLoading ? "Loading" : (datasetStats?.platforms.count ?? 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#94a3b8] font-medium mb-2">Date Range</div>
                <div className="text-sm text-[#f8fafc] tracking-tight">
                  {datasetStatsLoading
                    ? "Loading"
                    : `${datasetStats?.date_range.min ?? "-"} → ${datasetStats?.date_range.max ?? "-"}`}
                </div>
              </div>
            </div>
          )}

          {activeTab === "validation" && (
            <div className="space-y-4">
              {datasetStatsLoading ? (
                <div className="py-6 text-center text-[#94a3b8]">Loading validation stats...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-5 bg-[#1a1f2e] border border-[#252d3f] rounded-xl">
                    <div>
                      <div className="text-sm font-semibold text-[#f8fafc]">Min Price</div>
                      <div className="text-sm text-[#94a3b8] mt-1">₹{datasetStats?.price_stats.min?.toFixed(2) ?? "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 bg-[#1a1f2e] border border-[#252d3f] rounded-xl">
                    <div>
                      <div className="text-sm font-semibold text-[#f8fafc]">Max Price</div>
                      <div className="text-sm text-[#94a3b8] mt-1">₹{datasetStats?.price_stats.max?.toFixed(2) ?? "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 bg-[#1a1f2e] border border-[#252d3f] rounded-xl">
                    <div>
                      <div className="text-sm font-semibold text-[#f8fafc]">Average Price</div>
                      <div className="text-sm text-[#94a3b8] mt-1">₹{datasetStats?.price_stats.mean?.toFixed(2) ?? "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 bg-[#1a1f2e] border border-[#252d3f] rounded-xl">
                    <div>
                      <div className="text-sm font-semibold text-[#f8fafc]">Std Deviation</div>
                      <div className="text-sm text-[#94a3b8] mt-1">₹{datasetStats?.price_stats.std?.toFixed(2) ?? "-"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "versions" && (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#252d3f]" />
              <div className="space-y-8 relative">
                <div className="flex items-start gap-6 pl-12">
                  <div className="absolute left-2.5 w-3 h-3 bg-[#3b82f6] rounded-full border-2 border-[#0f1419]" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#f8fafc]">Last Updated</div>
                    <div className="text-sm text-[#64748b] mt-1">
                      {datasets.find(d => d.id === selectedDataset)?.lastUpdated ?? "-"}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-6 pl-12">
                  <div className="absolute left-2.5 w-3 h-3 bg-[#3b82f6] rounded-full border-2 border-[#0f1419]" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#f8fafc]">Date Range</div>
                    <div className="text-sm text-[#64748b] mt-1">
                      {datasetStatsLoading
                        ? "Loading"
                        : `${datasetStats?.date_range.min ?? "-"} → ${datasetStats?.date_range.max ?? "-"}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Batch Operations */}
      <Card title="Batch Operations">
        <div className="flex gap-4">
          <Button 
            variant="secondary"
            onClick={handleRefreshAll}
            disabled={uploading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All Datasets
          </Button>
          <Button 
            variant="secondary"
            onClick={handleRunValidation}
            disabled={uploading}
          >
            Run Validation
          </Button>
          <Button 
            variant="secondary"
            onClick={handleSimulateBatch}
            disabled={uploading}
          >
            Simulate Batch
          </Button>
        </div>
      </Card>
    </div>
  );
}