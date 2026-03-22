import { Card, Button, Badge } from "../components/ui-components";
import { apiClient } from "../api/client";
import { 
  User, 
  Globe, 
  Database, 
  Brain, 
  Bell, 
  Shield, 
  FileCheck,
  Upload,
  CheckCircle,
  Info,
  AlertTriangle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../components/Toast";
import { useNavigate } from "react-router";

type SettingsCategory = 
  | "profile"
  | "platform"
  | "dataset"
  | "ai"
  | "notifications"
  | "security"
  | "compliance";

const categories = [
  { id: "profile" as const, name: "Profile & Account", icon: User },
  { id: "platform" as const, name: "Platform Preferences", icon: Globe },
  { id: "dataset" as const, name: "Dataset Settings", icon: Database },
  { id: "ai" as const, name: "AI & Model Controls", icon: Brain },
  { id: "notifications" as const, name: "Notifications", icon: Bell },
  { id: "security" as const, name: "Security & Access", icon: Shield },
  { id: "compliance" as const, name: "Compliance & Privacy", icon: FileCheck },
];

export function Settings() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [theme, setTheme] = useState("Dark (Current)");
  const [timezone, setTimezone] = useState("UTC-8 (Pacific Time)");
  const [currency, setCurrency] = useState("USD ($)");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [datasetVersion, setDatasetVersion] = useState("Latest (Recommended)");
  const [batchFrequency, setBatchFrequency] = useState("Daily");
  const [notificationMethod, setNotificationMethod] = useState("Email & In-Dashboard");
  const [sessionTimeout, setSessionTimeout] = useState("15 minutes");
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("profile");
  const [pricePredictions, setPricePredictions] = useState(true);
  const [recommendations, setRecommendations] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [autoRetraining, setAutoRetraining] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [validationLevel, setValidationLevel] = useState("medium");
  const [priceDriftAlerts, setPriceDriftAlerts] = useState(true);
  const [performanceAlerts, setPerformanceAlerts] = useState(true);
  const [trustAlerts, setTrustAlerts] = useState(true);
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        try {
          await apiClient.getDbSetupStatus();
        } catch {
          // ignore db status check errors to avoid interrupting settings load
        }

        const response = await apiClient.getAdminSettings();
        const settings = response?.settings || {};
        if (!mounted) return;

        if (typeof settings.theme === "string") setTheme(settings.theme);
        if (typeof settings.timezone === "string") setTimezone(settings.timezone);
        if (typeof settings.currency === "string") setCurrency(settings.currency);
        if (typeof settings.date_format === "string") setDateFormat(settings.date_format);
        if (typeof settings.dataset_default_version === "string") setDatasetVersion(settings.dataset_default_version);
        if (typeof settings.batch_frequency === "string") setBatchFrequency(settings.batch_frequency);
        if (typeof settings.notification_method === "string") setNotificationMethod(settings.notification_method);
        if (typeof settings.session_timeout === "string") setSessionTimeout(settings.session_timeout);
        if (typeof settings.price_predictions === "boolean") setPricePredictions(settings.price_predictions);
        if (typeof settings.recommendations === "boolean") setRecommendations(settings.recommendations);
        if (typeof settings.confidence_threshold === "number") setConfidenceThreshold(Math.max(50, Math.min(100, Math.round(settings.confidence_threshold))));
        if (typeof settings.auto_retraining === "boolean") setAutoRetraining(settings.auto_retraining);
        if (typeof settings.auto_refresh === "boolean") setAutoRefresh(settings.auto_refresh);
        if (typeof settings.validation_level === "string") setValidationLevel(settings.validation_level);
        if (typeof settings.price_drift_alerts === "boolean") setPriceDriftAlerts(settings.price_drift_alerts);
        if (typeof settings.performance_alerts === "boolean") setPerformanceAlerts(settings.performance_alerts);
        if (typeof settings.trust_alerts === "boolean") setTrustAlerts(settings.trust_alerts);
      } catch {
        // Keep existing defaults when API is unavailable.
      }
    };

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const saveProfileSettings = () => {
    setSavingCategory('profile');
    void apiClient.updateAdminSettings({
      settings: {
        profile_updated_at: new Date().toISOString(),
      },
    }).then(() => {
      showToast('Profile settings saved successfully!', 'success');
    }).catch((err) => {
      showToast(`Failed to save profile settings: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }).finally(() => {
      setSavingCategory(null);
    });
  };

  const savePlatformSettings = () => {
    setSavingCategory('platform');
    void apiClient.updateAdminSettings({
      settings: {
        theme,
        timezone,
        currency,
        date_format: dateFormat,
      },
    }).then(() => {
      showToast('Platform preferences saved! Theme, timezone, and currency updated.', 'success');
    }).catch((err) => {
      showToast(`Failed to save platform settings: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }).finally(() => {
      setSavingCategory(null);
    });
  };

  const saveDatasetSettings = () => {
    setSavingCategory('dataset');
    void apiClient.updateAdminSettings({
      settings: {
        dataset_default_version: datasetVersion,
        batch_frequency: batchFrequency,
        auto_refresh: autoRefresh,
        validation_level: validationLevel,
      },
    }).then(() => {
      showToast('Dataset settings saved! Refresh frequency and validation level updated.', 'success');
    }).catch((err) => {
      showToast(`Failed to save dataset settings: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }).finally(() => {
      setSavingCategory(null);
    });
  };

  const saveAiSettings = () => {
    setSavingCategory('ai');
    void apiClient.updateAdminSettings({
      settings: {
        price_predictions: pricePredictions,
        recommendations,
        auto_retraining: autoRetraining,
        confidence_threshold: confidenceThreshold,
      },
    }).then(() => {
      showToast('AI model settings updated! Confidence threshold and prediction settings applied.', 'success');
    }).catch((err) => {
      showToast(`Failed to save AI settings: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }).finally(() => {
      setSavingCategory(null);
    });
  };

  const saveNotificationSettings = () => {
    setSavingCategory('notifications');
    void apiClient.updateAdminSettings({
      settings: {
        price_drift_alerts: priceDriftAlerts,
        performance_alerts: performanceAlerts,
        trust_alerts: trustAlerts,
        notification_method: notificationMethod,
      },
    }).then(() => {
      showToast('Notification settings saved! Alert preferences updated.', 'success');
    }).catch((err) => {
      showToast(`Failed to save notification settings: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }).finally(() => {
      setSavingCategory(null);
    });
  };

  const saveSecuritySettings = () => {
    setSavingCategory('security');
    void apiClient.updateAdminSettings({
      settings: {
        session_timeout: sessionTimeout,
      },
    }).then(() => {
      showToast('Security settings saved! Session timeout updated.', 'success');
      navigate('/logs');
    }).catch((err) => {
      showToast(`Failed to save security settings: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }).finally(() => {
      setSavingCategory(null);
    });
  };

  const saveComplianceView = () => {
    setSavingCategory('compliance');
    void apiClient.updateAdminSettings({
      settings: {
        compliance_viewed_at: new Date().toISOString(),
      },
    }).then(() => {
      showToast('Compliance settings acknowledged!', 'success');
      navigate('/logs');
    }).catch((err) => {
      showToast(`Failed to save compliance settings: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }).finally(() => {
      setSavingCategory(null);
    });
  };

  return (
    <div className="space-y-8 max-w-[1600px]">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[#f8fafc] mb-3">Settings</h1>
        <p className="text-[#94a3b8] text-base">Manage system preferences, AI behavior, and platform configuration</p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Categories Menu */}
        <div className="lg:col-span-1">
          <Card className="p-0">
            <div className="p-6 border-b border-[#252d3f]">
              <h3 className="text-sm font-semibold text-[#f8fafc]">Settings Categories</h3>
            </div>
            <nav className="p-3">
              <div className="space-y-1">
                {categories.map((category) => {
                  const isActive = activeCategory === category.id;
                  const Icon = category.icon;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#3b82f6]/10 text-[#3b82f6] border-l-2 border-[#3b82f6]"
                          : "text-[#94a3b8] hover:bg-[#1a1f2e] hover:text-[#cbd5e1]"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span className="truncate text-left">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </Card>
        </div>

        {/* Right Column - Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile & Account */}
          {activeCategory === "profile" && (
            <Card title="Profile & Account">
              <div className="space-y-8">
                {/* Avatar Section */}
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-xl flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                    AU
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-[#f8fafc] mb-2">Profile Picture</h4>
                    <p className="text-sm text-[#64748b] mb-4">Update your profile picture to personalize your account</p>
                    <Button variant="secondary" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Avatar
                    </Button>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value="Admin User"
                      readOnly
                      className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#64748b] cursor-not-allowed"
                    />
                    <p className="text-xs text-[#64748b] mt-1.5">Contact support to change your name</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value="System Administrator"
                      readOnly
                      className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#64748b] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value="ad***@company.com"
                      readOnly
                      className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#64748b] cursor-not-allowed"
                    />
                    <p className="text-xs text-[#64748b] mt-1.5">Email is masked for security</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      User ID
                    </label>
                    <input
                      type="text"
                      value="USR-2024-001"
                      readOnly
                      className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#64748b] font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#252d3f]">
                  <Button 
                    variant="primary" 
                    onClick={saveProfileSettings}
                    disabled={savingCategory === 'profile'}
                  >
                    {savingCategory === 'profile' ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Platform Preferences */}
          {activeCategory === "platform" && (
            <Card title="Platform Preferences">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      Theme
                    </label>
                    <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#f8fafc] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all">
                      <option>Dark (Current)</option>
                      <option>System Default</option>
                    </select>
                    <p className="text-xs text-[#64748b] mt-1.5">Choose your preferred color theme</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      Timezone
                    </label>
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#f8fafc] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all">
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+1 (CET)</option>
                    </select>
                    <p className="text-xs text-[#64748b] mt-1.5">All timestamps will be displayed in this timezone</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      Default Currency
                    </label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#f8fafc] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>JPY (¥)</option>
                    </select>
                    <p className="text-xs text-[#64748b] mt-1.5">Primary currency for price intelligence</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      Date Format
                    </label>
                    <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#f8fafc] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                    <p className="text-xs text-[#64748b] mt-1.5">How dates are displayed across the platform</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#252d3f]">
                  <Button 
                    variant="primary" 
                    onClick={savePlatformSettings}
                    disabled={savingCategory === 'platform'}
                  >
                    {savingCategory === 'platform' ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Dataset Settings */}
          {activeCategory === "dataset" && (
            <Card title="Dataset Settings">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      Default Dataset Version
                    </label>
                    <select value={datasetVersion} onChange={(e) => setDatasetVersion(e.target.value)} className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#f8fafc] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all">
                      <option>Latest (Recommended)</option>
                      <option>Processed</option>
                      <option>Cleaned</option>
                      <option>Raw</option>
                    </select>
                    <p className="text-xs text-[#64748b] mt-1.5">Default version for new model training</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                      Batch Simulation Frequency
                    </label>
                    <select value={batchFrequency} onChange={(e) => setBatchFrequency(e.target.value)} className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#f8fafc] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Manual Only</option>
                    </select>
                    <p className="text-xs text-[#64748b] mt-1.5">How often to run batch simulations</p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#94a3b8]">Auto-Refresh Datasets</span>
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autoRefresh ? "bg-[#3b82f6]" : "bg-[#252d3f]"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoRefresh ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </label>
                  <p className="text-xs text-[#64748b]">Automatically refresh datasets from external sources</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-3">
                    Validation Strictness Level
                  </label>
                  <div className="flex gap-3">
                    {["low", "medium", "high"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setValidationLevel(level)}
                        className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          validationLevel === level
                            ? "bg-[#3b82f6] text-white shadow-sm"
                            : "bg-[#1a1f2e] text-[#94a3b8] border border-[#252d3f] hover:border-[#3b82f6]"
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#64748b] mt-2">Higher strictness catches more errors but may reject valid data</p>
                </div>

                <div className="pt-4 border-t border-[#252d3f]">
                  <Button 
                    variant="primary" 
                    onClick={saveDatasetSettings}
                    disabled={savingCategory === 'dataset'}
                  >
                    {savingCategory === 'dataset' ? 'Saving...' : 'Save Dataset Settings'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* AI & Model Controls */}
          {activeCategory === "ai" && (
            <Card title="AI & Model Controls" className="border-l-4 border-[#8b5cf6]">
              <div className="space-y-8">
                {/* Warning Banner */}
                <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-[#8b5cf6] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-[#8b5cf6] mb-1">AI Control Settings</div>
                      <div className="text-sm text-[#94a3b8] leading-relaxed">
                        Changes to AI settings will affect price predictions and recommendations. 
                        Disabling features may impact system accuracy.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggle Controls */}
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-[#f8fafc] block mb-1">Enable Price Predictions</span>
                        <span className="text-xs text-[#64748b]">Allow AI to generate price predictions</span>
                      </div>
                      <button
                        onClick={() => setPricePredictions(!pricePredictions)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          pricePredictions ? "bg-[#8b5cf6]" : "bg-[#252d3f]"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pricePredictions ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-[#f8fafc] block mb-1">Enable Recommendations</span>
                        <span className="text-xs text-[#64748b]">Allow AI to provide pricing recommendations</span>
                      </div>
                      <button
                        onClick={() => setRecommendations(!recommendations)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          recommendations ? "bg-[#8b5cf6]" : "bg-[#252d3f]"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            recommendations ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-[#f8fafc] block mb-1">Auto-Retraining</span>
                        <span className="text-xs text-[#64748b]">Automatically retrain models when new data is available</span>
                      </div>
                      <button
                        onClick={() => setAutoRetraining(!autoRetraining)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          autoRetraining ? "bg-[#8b5cf6]" : "bg-[#252d3f]"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            autoRetraining ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>

                {/* Confidence Threshold Slider */}
                <div>
                  <label className="block text-sm font-medium text-[#f8fafc] mb-3">
                    Confidence Threshold: {confidenceThreshold}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-[#1a1f2e] rounded-lg appearance-none cursor-pointer accent-[#8b5cf6]"
                  />
                  <div className="flex justify-between text-xs text-[#64748b] mt-2">
                    <span>50% (Permissive)</span>
                    <span>100% (Strict)</span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-2">
                    Only predictions above this confidence level will be used
                  </p>
                </div>

                <div className="pt-4 border-t border-[#252d3f]">
                  <Button 
                    variant="primary" 
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed]" 
                    onClick={saveAiSettings}
                    disabled={savingCategory === 'ai'}
                  >
                    {savingCategory === 'ai' ? 'Saving...' : 'Save AI Settings'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications */}
          {activeCategory === "notifications" && (
            <Card title="Notification Preferences">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-[#f8fafc] block mb-1">Price Drift Alerts</span>
                        <span className="text-xs text-[#64748b]">Get notified when price drift is detected</span>
                      </div>
                      <button
                        onClick={() => setPriceDriftAlerts(!priceDriftAlerts)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          priceDriftAlerts ? "bg-[#3b82f6]" : "bg-[#252d3f]"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            priceDriftAlerts ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-[#f8fafc] block mb-1">Model Performance Alerts</span>
                        <span className="text-xs text-[#64748b]">Get notified about model accuracy changes</span>
                      </div>
                      <button
                        onClick={() => setPerformanceAlerts(!performanceAlerts)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          performanceAlerts ? "bg-[#3b82f6]" : "bg-[#252d3f]"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            performanceAlerts ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-[#f8fafc] block mb-1">Trust Issue Alerts</span>
                        <span className="text-xs text-[#64748b]">Get notified about fake reviews and trust violations</span>
                      </div>
                      <button
                        onClick={() => setTrustAlerts(!trustAlerts)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          trustAlerts ? "bg-[#3b82f6]" : "bg-[#252d3f]"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            trustAlerts ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                    Notification Delivery Method
                  </label>
                  <select value={notificationMethod} onChange={(e) => setNotificationMethod(e.target.value)} className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#f8fafc] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all">
                    <option>Email & In-Dashboard</option>
                    <option>Email Only</option>
                    <option>In-Dashboard Only</option>
                  </select>
                  <p className="text-xs text-[#64748b] mt-1.5">How you receive notifications</p>
                </div>

                <div className="pt-4 border-t border-[#252d3f]">
                  <Button 
                    variant="primary" 
                    onClick={saveNotificationSettings}
                    disabled={savingCategory === 'notifications'}
                  >
                    {savingCategory === 'notifications' ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Security & Access */}
          {activeCategory === "security" && (
            <Card title="Security & Access">
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                    Role-Based Access
                  </label>
                  <div className="bg-[#1a1f2e] border border-[#252d3f] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#f8fafc] font-medium">System Administrator</span>
                      <Badge variant="success">Full Access</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748b] mt-1.5">Your current access level (read-only)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                    Session Timeout
                  </label>
                  <select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#f8fafc] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>Never</option>
                  </select>
                  <p className="text-xs text-[#64748b] mt-1.5">Automatically log out after period of inactivity</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                    API Access Status
                  </label>
                  <div className="bg-[#1a1f2e] border border-[#252d3f] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#f8fafc]">API Access</span>
                      <Badge variant="danger">Disabled</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748b] mt-1.5">Contact support to enable API access</p>
                </div>

                <div className="pt-4 border-t border-[#252d3f]">
                  <Button 
                    variant="secondary" 
                    onClick={saveSecuritySettings}
                    disabled={savingCategory === 'security'}
                  >
                    {savingCategory === 'security' ? 'Loading...' : 'View Access Logs'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Compliance & Privacy */}
          {activeCategory === "compliance" && (
            <Card title="Compliance & Privacy">
              <div className="space-y-8">
                {/* Compliance Status Items */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#10b981] mb-1">Dataset License Acknowledged</div>
                      <div className="text-sm text-[#94a3b8]">All datasets comply with CC0 1.0 Universal license</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#10b981] mb-1">AI Usage Disclaimer Active</div>
                      <div className="text-sm text-[#94a3b8]">Users are informed about AI-powered features</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#10b981] mb-1">Data Retention Policy</div>
                      <div className="text-sm text-[#94a3b8]">Logs retained for 90 days, audit trails for 2 years</div>
                    </div>
                  </div>
                </div>

                {/* Privacy Information */}
                <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <Info className="w-5 h-5 text-[#3b82f6] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-[#3b82f6] mb-2">Privacy & Compliance</div>
                      <div className="text-sm text-[#94a3b8] leading-relaxed">
                        This platform follows enterprise data protection standards. All AI decisions 
                        are logged for transparency and audit purposes. Personal data is handled in 
                        compliance with applicable regulations.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#252d3f]">
                  <Button 
                    variant="secondary" 
                    onClick={saveComplianceView}
                    disabled={savingCategory === 'compliance'}
                  >
                    {savingCategory === 'compliance' ? 'Loading...' : 'View Full Compliance Report'}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
