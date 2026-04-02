import { Card, Button, Badge } from "../components/ui-components";
import { CheckCircle, XCircle, Edit, Flag, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useMatchingPairs, useMatchingStats } from "../hooks/useApi";
import { apiClient } from "../api/client";
import { useToast } from "../components/Toast";
import { useNavigate } from "react-router";

export function ProductMatching() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { data: pairsData, loading, error, refetch: refetchPairs } = useMatchingPairs();
  const { data: statsData, refetch: refetchStats } = useMatchingStats();
  const [selectedPairId, setSelectedPairId] = useState<number | null>(null);
  const [matchStatus, setMatchStatus] = useState<Record<number, string>>({});

  const productPairs = pairsData?.pairs ?? [];
  const selectedPair = productPairs.find((p: any) => p.id === selectedPairId) ?? productPairs[0] ?? null;

  const handleAction = async (id: number, action: string) => {
    // Optimistic UI: update immediately without waiting for server
    setMatchStatus({ ...matchStatus, [id]: action });
    
    // Show success message based on action
    const messages: Record<string, string> = {
      approved: `✓ Product match APPROVED for "${selectedPair?.productA.name}"`,
      rejected: `✗ Product match REJECTED. Will be excluded from matching.`,
      flagged: `⚠ Match flagged for manual review by team.`
    };
    
    showToast(messages[action] || `Match ${action} successfully`, 'success');
    
    try {
      // Make API call without blocking UI
      await apiClient.matchingAction(id, action);
      
      // Soft refresh: only re-fetch if needed (in background, no loading state)
      setTimeout(() => {
        refetchStats();
        refetchPairs();
      }, 500);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error occurred';
      showToast(`Failed to ${action} match: ${errorMsg}`, 'error');
      console.error("Action failed", e);
      
      // Clear optimistic update on error
      const newStatus = { ...matchStatus };
      delete newStatus[id];
      setMatchStatus(newStatus);
    }
  };

  const handleEditMatch = (pair: any) => {
    const productName = pair?.productA?.name;
    if (!productName) {
      showToast("Unable to open match details for editing.", "error");
      return;
    }

    navigate(`/pricing?product=${encodeURIComponent(productName)}`);
    showToast(`Opened pricing details for ${productName}`, "info");
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-[1600px]">
        <div className="mb-8">
          <h1 className="text-[#f8fafc] mb-3">Product Matching Oversight</h1>
          <p className="text-[#94a3b8] text-base">Review and approve AI-generated product matches</p>
        </div>
        <Card>
          <div className="flex items-center justify-center py-16 gap-3 text-[#94a3b8]">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading match pairs...
          </div>
        </Card>
      </div>
    );
  }

  if (error || productPairs.length === 0) {
    return (
      <div className="space-y-8 max-w-[1600px]">
        <div className="mb-8">
          <h1 className="text-[#f8fafc] mb-3">Product Matching Oversight</h1>
          <p className="text-[#94a3b8] text-base">Review and approve AI-generated product matches</p>
        </div>
        <Card>
          <div className="text-center py-16 text-[#64748b]">
            {error ? `Error: ${error.message}` : "No product match data available"}
          </div>
        </Card>
      </div>
    );
  }

  // Calculate avg confidence from loaded pairs
  const avgConfidence = (productPairs.reduce((s: number, p: any) => s + p.confidence, 0) / productPairs.length).toFixed(1);

  return (
    <div className="space-y-8 max-w-[1600px]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#f8fafc] mb-3">Product Matching Oversight</h1>
          <p className="text-[#94a3b8] text-base">Review and approve AI-generated product matches across platforms</p>
        </div>
        <Button variant="secondary" onClick={() => { refetchPairs(); refetchStats(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm text-[#94a3b8] font-medium mb-2">Total Pairs</div>
          <div className="text-3xl font-semibold text-[#f8fafc] tracking-tight">{statsData?.total_pairs ?? productPairs.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-[#94a3b8] font-medium mb-2">Pending Review</div>
          <div className="text-3xl font-semibold text-[#f59e0b] tracking-tight">{statsData?.pending ?? productPairs.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-[#94a3b8] font-medium mb-2">Approved</div>
          <div className="text-3xl font-semibold text-[#10b981] tracking-tight">{statsData?.approved ?? 0}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-[#94a3b8] font-medium mb-2">Avg Confidence</div>
          <div className="text-3xl font-semibold text-[#f8fafc] tracking-tight">{avgConfidence}%</div>
        </Card>
      </div>

      {/* Split View */}
      {selectedPair && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product A */}
          <Card title={selectedPair.productA.platform} className="border-l-4 border-[#3b82f6]">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#f8fafc] mb-3">{selectedPair.productA.name}</h3>
                <div className="text-3xl font-bold text-[#3b82f6] tracking-tight">{selectedPair.productA.price}</div>
              </div>
              <div className="space-y-3 pt-4 border-t border-[#252d3f]">
                <div className="text-sm text-[#94a3b8] font-semibold mb-3">Details</div>
                {Object.entries(selectedPair.productA.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-[#64748b] capitalize font-medium">{key}:</span>
                    <span className="text-[#f8fafc]">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Match Confidence */}
          <div className="flex flex-col items-center justify-center space-y-8">
            <Card className="w-full p-8">
              <div className="text-center">
                <div className="text-sm text-[#94a3b8] font-medium mb-4">Match Confidence</div>
                <div className="relative inline-flex items-center justify-center w-40 h-40 mb-6">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="#1a1f2e" strokeWidth="10" fill="none" />
                    <circle
                      cx="80" cy="80" r="70"
                      stroke={selectedPair.confidence >= 90 ? "#10b981" : selectedPair.confidence >= 80 ? "#3b82f6" : "#f59e0b"}
                      strokeWidth="10" fill="none"
                      strokeDasharray={`${(selectedPair.confidence / 100) * 439.8} 439.8`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-[#f8fafc]">{selectedPair.confidence}%</span>
                  </div>
                </div>
                <Badge variant={selectedPair.confidence >= 95 ? "success" : selectedPair.confidence >= 85 ? "info" : "warning"}>
                  {selectedPair.confidence >= 95 ? "High Confidence" : selectedPair.confidence >= 85 ? "Good Match" : "Review Needed"}
                </Badge>
              </div>
            </Card>

            <div className="flex items-center justify-center py-2">
              <ChevronRight className="w-8 h-8 text-[#3b82f6]" />
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3">
              <Button
                variant="success"
                className="w-full"
                onClick={() => handleAction(selectedPair.id, "approved")}
                disabled={matchStatus[selectedPair.id] !== undefined}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {matchStatus[selectedPair.id] === "approved" ? "✓ Approved" : "Approve Match"}
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => handleAction(selectedPair.id, "rejected")}
                disabled={matchStatus[selectedPair.id] !== undefined}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {matchStatus[selectedPair.id] === "rejected" ? "✓ Rejected" : "Reject Match"}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleEditMatch(selectedPair)}
                disabled={matchStatus[selectedPair.id] !== undefined}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Match
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => handleAction(selectedPair.id, "flagged")}
                disabled={matchStatus[selectedPair.id] !== undefined}
              >
                <Flag className="w-4 h-4 mr-2" />
                {matchStatus[selectedPair.id] === "flagged" ? "✓ Flagged" : "Flag for Review"}
              </Button>
            </div>
          </div>

          {/* Product B */}
          <Card title={selectedPair.productB.platform} className="border-l-4 border-[#8b5cf6]">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#f8fafc] mb-3">{selectedPair.productB.name}</h3>
                <div className="text-3xl font-bold text-[#8b5cf6] tracking-tight">{selectedPair.productB.price}</div>
              </div>
              <div className="space-y-3 pt-4 border-t border-[#252d3f]">
                <div className="text-sm text-[#94a3b8] font-semibold mb-3">Details</div>
                {Object.entries(selectedPair.productB.specs).map(([key, value]) => {
                  const matches = selectedPair.productA.specs[key as keyof typeof selectedPair.productA.specs] === value;
                  return (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-[#64748b] capitalize font-medium">{key}:</span>
                      <span className={matches ? "text-[#10b981] font-medium" : "text-[#f59e0b] font-medium"}>
                        {value as string} {matches ? "✓" : "⚠"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Queue List */}
      <Card title={`Match Queue (${productPairs.length} pairs)`}>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {productPairs.map((pair: any) => (
            <div
              key={pair.id}
              onClick={() => setSelectedPairId(pair.id)}
              className={`flex items-center justify-between p-5 rounded-xl cursor-pointer transition-all ${
                selectedPair?.id === pair.id
                  ? "bg-[#1a1f2e] border border-[#3b82f6] shadow-sm"
                  : "hover:bg-[#1a1f2e] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm font-medium text-[#f8fafc]">{pair.productA.name}</div>
                  <div className="text-sm text-[#64748b] mt-1">{pair.productA.platform} ↔ {pair.productB.platform}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-base font-semibold text-[#f8fafc]">{pair.confidence}%</div>
                  <div className="text-xs text-[#64748b] mt-0.5">confidence</div>
                </div>
                {matchStatus[pair.id] ? (
                  <Badge variant={matchStatus[pair.id] === "approved" ? "success" : matchStatus[pair.id] === "rejected" ? "danger" : "warning"}>
                    {matchStatus[pair.id]}
                  </Badge>
                ) : (
                  <Badge variant="default">pending</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Human-in-the-Loop Note */}
      <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🤝</div>
          <div>
            <div className="text-base font-semibold text-[#3b82f6] mb-2">Human-in-the-Loop AI Control</div>
            <div className="text-sm text-[#94a3b8] leading-relaxed">
              All AI-generated product matches require human approval before being used in price intelligence.
              Your oversight ensures accuracy and builds trust in the system.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}