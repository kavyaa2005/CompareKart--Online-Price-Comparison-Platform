import { Card, Button, Badge } from "../components/ui-components";
import { TrendingUp, TrendingDown, DollarSign, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { usePriceTrend, usePrediction, usePlatformComparison } from "../hooks/useApi";
import { useToast } from "../components/Toast";
import { apiClient } from "../api/client";
import { useLocation } from "react-router";

export function PriceIntelligence() {
  const { showToast } = useToast();
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState("Bath Towel Premium");
  const [approvedProducts, setApprovedProducts] = useState<string[]>([]);
  const [loadingApprovedProducts, setLoadingApprovedProducts] = useState(true);
  const [platformAData, setPlatformAData] = useState<any[]>([]);
  const [platformBData, setPlatformBData] = useState<any[]>([]);
  const [avgPriceDiff, setAvgPriceDiff] = useState(0);
  const [volatility, setVolatility] = useState(0);
  const [dealCount, setDealCount] = useState(0);
  const [alertThreshold, setAlertThreshold] = useState(10);
  const [checkFrequency, setCheckFrequency] = useState("Every hour");
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Fetch price trends
  const { data: trendA, loading: loadingA, error: errorA } = usePriceTrend(selectedProduct, "Amazon");
  const { data: trendB, loading: loadingB, error: errorB } = usePriceTrend(selectedProduct, "Flipkart");
  const { data: prediction, error: predictionError } = usePrediction(selectedProduct, "Amazon");
  const { data: comparison, error: comparisonError } = usePlatformComparison(selectedProduct);
  const predictionConfidence =
    typeof prediction?.confidence === "number"
      ? prediction.confidence <= 1
        ? prediction.confidence * 100
        : prediction.confidence
      : null;

  const computeTrendChangePct = (history?: Array<{ price: number }>) => {
    if (!history || history.length < 2) return null;
    const first = history[0]?.price;
    const last = history[history.length - 1]?.price;
    if (!first || !last) return null;
    return ((last - first) / first) * 100;
  };

  const trendAChangePct = computeTrendChangePct(trendA?.history as Array<{ price: number }> | undefined);
  const trendBChangePct = computeTrendChangePct(trendB?.history as Array<{ price: number }> | undefined);

  useEffect(() => {
    let mounted = true;
    const loadApprovedProducts = async () => {
      try {
        const response = await apiClient.getApprovedProducts();
        if (!mounted) return;
        const products = Array.isArray(response?.products) ? response.products : [];
        setApprovedProducts(products);
        if (products.length > 0) {
          setSelectedProduct((current) => (products.includes(current) ? current : products[0]));
        }
      } catch {
        if (mounted) {
          setApprovedProducts([]);
        }
      } finally {
        if (mounted) {
          setLoadingApprovedProducts(false);
        }
      }
    };

    void loadApprovedProducts();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadAlertSettings = async () => {
      try {
        const response = await apiClient.getAdminSettings();
        if (!mounted) return;
        const settings = response?.settings ?? {};
        if (typeof settings.price_alert_threshold === "number") {
          setAlertThreshold(settings.price_alert_threshold);
        }
        if (typeof settings.price_check_frequency === "string") {
          setCheckFrequency(settings.price_check_frequency);
        }
      } catch {
        // Keep defaults when settings are unavailable.
      }
    };

    void loadAlertSettings();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productFromQuery = params.get("product");
    if (productFromQuery && productFromQuery.trim()) {
      setSelectedProduct(productFromQuery.trim());
    }
  }, [location.search]);

  // Transform API data to chart format
  useEffect(() => {
    if (trendA?.history && Array.isArray(trendA.history)) {
      const chartData = trendA.history.map((h: any) => ({
        date: h.date.substring(5),
        price: h.price,
      }));
      setPlatformAData(chartData.length > 0 ? chartData : []);
    }
  }, [trendA]);

  useEffect(() => {
    if (trendB?.history && Array.isArray(trendB.history)) {
      const chartData = trendB.history.map((h: any) => ({
        date: h.date.substring(5),
        price: h.price,
      }));
      setPlatformBData(chartData.length > 0 ? chartData : []);
    }
  }, [trendB]);

  // Calculate metrics from API data
  useEffect(() => {
    if (trendA && trendB) {
      // Calculate average price difference
      const priceA = trendA.current_price || 0;
      const priceB = trendB.current_price || 0;
      setAvgPriceDiff(Math.abs(priceA - priceB));
      
      // Calculate volatility (price variance in trend)
      if (trendA.history && trendA.history.length > 0) {
        const prices = trendA.history.map((h: any) => h.price);
        const avg = prices.reduce((a: number, b: number) => a + b) / prices.length;
        const variance = prices.reduce((sum: number, p: number) => sum + Math.pow(p - avg, 2), 0) / prices.length;
        const stdDev = Math.sqrt(variance);
        setVolatility(Number(((stdDev / avg) * 100).toFixed(1)));
      }
    }
    
    // Calculate deal count from comparison data
    if (comparison && comparison.comparison) {
      setDealCount(comparison.best_deal ? 1 : 0);
    }
  }, [trendA, trendB, comparison]);

  // Handler for View Details button
  const handleViewDetails = () => {
    const entries = comparison?.comparison ? Object.entries(comparison.comparison) : [];
    if (entries.length === 0) {
      showToast(`No platform comparison data available yet for ${selectedProduct}`, 'warning');
      return;
    }

    const bestPlatform = comparison?.best_deal;
    const bestPrice =
      bestPlatform && comparison?.comparison?.[bestPlatform]
        ? Math.round(comparison.comparison[bestPlatform].current_price || 0)
        : null;

    showToast(
      bestPlatform && bestPrice !== null
        ? `${selectedProduct}: best current deal is on ${bestPlatform} at ₹${bestPrice}`
        : `Loaded platform comparison for ${selectedProduct}`,
      'info'
    );
  };

  // Handler for How is this calculated button
  const handleHowCalculated = () => {
    const trendPoints = Math.max(platformAData.length, platformBData.length);
    const confidenceText =
      predictionConfidence !== null
        ? `${predictionConfidence.toFixed(1)}% confidence`
        : 'confidence unavailable';

    showToast(
      `Forecast uses ${trendPoints} trend points with ${confidenceText}.`,
      'info'
    );
  };

  // Handler for Save Alert Settings button
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await apiClient.updateAdminSettings({
        settings: {
          price_alert_threshold: alertThreshold,
          price_check_frequency: checkFrequency,
          price_alert_settings_updated_at: new Date().toISOString(),
        },
      });

      showToast(
        `Alert settings saved! Threshold: ${alertThreshold}%, Check frequency: ${checkFrequency}`,
        'success'
      );
    } catch (error) {
      showToast('Failed to save alert settings. Please try again.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[#f3f4f6] mb-2">Price Intelligence Monitoring</h1>
        <p className="text-[#9ca3af]">Track and analyze price trends across platforms</p>
        {(errorA || errorB || predictionError || comparisonError) && (
          <p className="text-sm text-red-400 mt-2">
            Some data failed to load. Ensure the selected product exists in dataset and API is running.
          </p>
        )}
      </div>

      <Card title="Approved Products For Compare">
        {loadingApprovedProducts ? (
          <div className="text-sm text-[#9ca3af]">Loading approved products...</div>
        ) : approvedProducts.length === 0 ? (
          <div className="text-sm text-[#9ca3af]">
            No products approved yet. Approve matches from Product Matching to populate compare view.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a2332] border border-[#243447] rounded-lg text-sm text-[#f3f4f6] focus:outline-none focus:border-[#3b82f6]"
              >
                {approvedProducts.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-[#9ca3af]">
              Only products approved in Product Matching appear here.
            </div>
          </div>
        )}
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9ca3af]">Avg Price Diff</span>
            <DollarSign className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="text-2xl font-semibold text-[#f3f4f6]">₹{Math.round(avgPriceDiff)}</div>
          <div className="text-xs text-[#10b981] mt-1">Real-time comparison</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9ca3af]">Price Volatility</span>
            <TrendingUp className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl font-semibold text-[#f3f4f6]">{volatility.toFixed(1)}%</div>
          <div className="text-xs text-[#f59e0b] mt-1">{volatility > 10 ? "High volatility" : "Stable market"}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9ca3af]">Best Deals Found</span>
            <TrendingDown className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-2xl font-semibold text-[#f3f4f6]">{dealCount}</div>
          <div className="text-xs text-[#10b981] mt-1">Updated today</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9ca3af]">Prediction Confidence</span>
            <Info className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <div className="text-2xl font-semibold text-[#f3f4f6]">
            {predictionConfidence !== null ? `${predictionConfidence.toFixed(1)}%` : "-"}
          </div>
          <div className="text-xs text-[#10b981] mt-1">High confidence model</div>
        </Card>
      </div>

      {/* Buy/Wait Recommendation */}
      <Card title="AI Recommendation" className="border-l-4 border-[#8b5cf6]">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#8b5cf6]/10 rounded-lg">
            <span className="text-3xl">{prediction?.recommendation === "BUY NOW" ? "💡" : "⏸️"}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-[#f3f4f6]">{prediction?.recommendation ?? "-"}</h3>
              <Badge variant="success">
                High Confidence: {predictionConfidence !== null ? `${predictionConfidence.toFixed(0)}%` : "-"}
              </Badge>
            </div>
            <p className="text-sm text-[#9ca3af] mb-3">
              {predictionError ? (
                `Prediction unavailable for this product/platform.`
              ) : typeof prediction?.price_change_percentage === "number" ? (
                 `Current price: ₹${Math.round(prediction.current_price)}. Predicted price: ₹${Math.round(prediction.predicted_price)}. Expected change: ${prediction.price_change_percentage > 0 ? '+' : ''}${prediction.price_change_percentage.toFixed(1)}%.`
              ) : (
                 `Loading prediction analysis...`
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleViewDetails}>View Details</Button>
              <Button variant="ghost" size="sm" onClick={handleHowCalculated}>
                <Info className="w-3 h-3 mr-1 inline" />
                How is this calculated?
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Price Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform A Trends */}
        <Card title="Platform A - Price Trends">
          {platformAData && platformAData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={platformAData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243447" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #243447",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                  }}
                />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            ) : errorA ? (
               <div className="h-[300px] flex items-center justify-center text-red-400">{errorA.message}</div>
            ) : !loadingA ? (
               <div className="h-[300px] flex items-center justify-center text-[#9ca3af]">No trend data for {selectedProduct} on Amazon</div>
          ) : (
             <div className="h-[300px] flex items-center justify-center text-[#9ca3af]">Loading price trends...</div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-[#9ca3af]">Current Average</div>
                 <div className="text-xl font-semibold text-[#3b82f6]">{typeof trendA?.current_price === "number" ? `₹${Math.round(trendA.current_price)}` : "-"}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#9ca3af]">Trend</div>
                 <div className={`text-xl font-semibold flex items-center ${(trendAChangePct || 0) < 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                   {(trendAChangePct || 0) < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                   {typeof trendAChangePct === "number" ? `${trendAChangePct > 0 ? '+' : ''}${trendAChangePct.toFixed(1)}%` : "N/A"}
               </div>
            </div>
          </div>
        </Card>

        {/* Platform B Trends */}
        <Card title="Platform B - Price Trends">
          {platformBData && platformBData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={platformBData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243447" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #243447",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                  }}
                />
                <Line type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            ) : errorB ? (
               <div className="h-[300px] flex items-center justify-center text-red-400">{errorB.message}</div>
            ) : !loadingB ? (
               <div className="h-[300px] flex items-center justify-center text-[#9ca3af]">No trend data for {selectedProduct} on Flipkart</div>
          ) : (
             <div className="h-[300px] flex items-center justify-center text-[#9ca3af]">Loading price trends...</div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-[#9ca3af]">Current Average</div>
                 <div className="text-xl font-semibold text-[#8b5cf6]">{typeof trendB?.current_price === "number" ? `₹${Math.round(trendB.current_price)}` : "-"}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#9ca3af]">Trend</div>
                 <div className={`text-xl font-semibold flex items-center ${(trendBChangePct || 0) < 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                   {(trendBChangePct || 0) < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                   {typeof trendBChangePct === "number" ? `${trendBChangePct > 0 ? '+' : ''}${trendBChangePct.toFixed(1)}%` : "N/A"}
               </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Price Fluctuation Heatmap */}
      <Card title="Global Price Fluctuation Overview">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a2332]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#9ca3af]">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#9ca3af]">Platform</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#9ca3af]">Current Price</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#9ca3af]">Discount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#9ca3af]">Best Deal</th>
              </tr>
            </thead>
            <tbody>
               {comparison && comparison.comparison ? Object.entries(comparison.comparison).map(([platform, data]: [string, any], idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#1a2332] hover:bg-[#1a2332] transition-colors"
                >
                   <td className="py-3 px-4 text-sm text-[#f3f4f6] font-medium">{selectedProduct}</td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-[#9ca3af]">{platform}</span>
                  </td>
                  <td className="py-3 px-4">
                     <span className={`text-sm font-semibold ${platform === comparison.best_deal ? "text-[#10b981]" : "text-[#9ca3af]"}`}>
                       ₹{Math.round(data.current_price || 0)}
                     </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-[#f3f4f6]">{typeof data.discount === "number" ? `${data.discount.toFixed(1)}%` : "-"}</span>
                  </td>
                  <td className="py-3 px-4">
                     <Badge variant={platform === comparison.best_deal ? "success" : "default"}>{platform === comparison.best_deal ? "Best" : "-"}</Badge>
                  </td>
                </tr>
               )) : (
                 <tr>
                   <td colSpan={5} className="py-3 px-4 text-center text-[#9ca3af]">
                     Loading comparison data...
                   </td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Price Alert Settings */}
      <Card title="Price Alert Configuration">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Alert Threshold</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Math.max(1, parseInt(e.target.value) || 10))}
                className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#243447] rounded-lg text-sm text-[#f3f4f6] focus:outline-none focus:border-[#3b82f6]"
              />
              <span className="text-sm text-[#9ca3af]">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Check Frequency</label>
            <select 
              value={checkFrequency}
              onChange={(e) => setCheckFrequency(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a2332] border border-[#243447] rounded-lg text-sm text-[#f3f4f6] focus:outline-none focus:border-[#3b82f6]"
            >
              <option>Every hour</option>
              <option>Every 6 hours</option>
              <option>Daily</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              variant="primary" 
              className="w-full" 
              onClick={handleSaveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
