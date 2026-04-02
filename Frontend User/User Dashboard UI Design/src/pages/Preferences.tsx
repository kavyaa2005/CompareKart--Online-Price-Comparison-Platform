import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import { useUserPreferences, useUpdatePreferences } from '../hooks/useUserApi';

// Default categories and platforms - will be replaced with API data if available
const DEFAULT_CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty', 'Toys', 'Food'];
const DEFAULT_PLATFORMS = ['Amazon', 'Flipkart', 'Myntra', 'Snapdeal', 'Meesho', 'eBay', 'Ajio', 'WalMart'];

export function Preferences() {
  const { data: apiPreferences, loading: preferencesLoading } = useUserPreferences();
  const { updatePreferences, loading: updateLoading, error: updateError } = useUpdatePreferences();
  
  // Get categories/platforms from API if available, else use defaults
  const { categories: apiCategories = DEFAULT_CATEGORIES, platforms: apiPlatforms = DEFAULT_PLATFORMS } = useMemo(
    () => ({
      categories: apiPreferences?.availableCategories || DEFAULT_CATEGORIES,
      platforms: apiPreferences?.availablePlatforms || DEFAULT_PLATFORMS,
    }),
    [apiPreferences]
  );
  
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(50000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load preferences from API on mount
  useEffect(() => {
    if (apiPreferences) {
      setBudgetMin(apiPreferences.budgetMin || 0);
      setBudgetMax(apiPreferences.budgetMax || 50000);
      setSelectedCategories(apiPreferences.categories || []);
      setSelectedPlatforms(apiPreferences.platforms || []);
      setEmailNotifications(apiPreferences.emailNotifications !== false);
      setPushNotifications(apiPreferences.pushNotifications !== false);
    }
  }, [apiPreferences]);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (budgetMin < 0) errors.push('Minimum budget cannot be negative');
    if (budgetMax < 0) errors.push('Maximum budget cannot be negative');
    if (budgetMin >= budgetMax) errors.push('Minimum budget must be less than maximum budget');
    if (selectedCategories.length === 0) errors.push('Select at least one category');
    if (selectedPlatforms.length === 0) errors.push('Select at least one platform');
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
    setValidationErrors((prev) => prev.filter((e) => !e.includes('category')));
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
    setValidationErrors((prev) => prev.filter((e) => !e.includes('platform')));
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSuccessMessage('');
    const success = await updatePreferences({
      budgetMin,
      budgetMax,
      categories: selectedCategories,
      platforms: selectedPlatforms,
      emailNotifications,
      pushNotifications,
    });
    
    if (success) {
      setSuccessMessage('Preferences saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Preferences
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Customize your price tracking experience
        </p>
      </div>

      <div className="max-w-3xl">
        {/* Success Message */}
        {successMessage && (
          <div
            className="rounded-lg border p-4 mb-6 flex items-center gap-3"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderColor: 'var(--success)',
            }}
          >
            <CheckCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>
              {successMessage}
            </span>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div
            className="rounded-lg border p-4 mb-6"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'var(--danger)',
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
              <ul className="text-sm space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} style={{ color: 'var(--danger)' }}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* API Update Error */}
        {updateError && (
          <div
            className="rounded-lg border p-4 mb-6 flex items-center gap-3"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'var(--danger)',
            }}
          >
            <AlertCircle className="w-5 h-5" style={{ color: 'var(--danger)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
              Failed to save preferences. Please try again.
            </span>
          </div>
        )}

        {/* Loading State */}
        {preferencesLoading && (
          <div className="rounded-lg border p-4 mb-6 text-center" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading preferences...</p>
          </div>
        )}

        {/* Budget Range */}
        <div
          className="rounded-lg border p-6 mb-6"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--border)',
          }}
        >
          <h3
            className="text-sm font-semibold mb-4 uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Budget Range
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                Minimum (₹)
              </label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => {
                  setBudgetMin(Number(e.target.value));
                  setValidationErrors((prev) => prev.filter((e) => !e.includes('budget')));
                }}
                className="w-full px-4 py-2 text-sm rounded-lg border outline-none"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                Maximum (₹)
              </label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => {
                  setBudgetMax(Number(e.target.value));
                  setValidationErrors((prev) => prev.filter((e) => !e.includes('budget')));
                }}
                className="w-full px-4 py-2 text-sm rounded-lg border outline-none"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
          <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            Current range: ₹{budgetMin.toLocaleString('en-IN')} - ₹{budgetMax.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Preferred Categories */}
        <div
          className="rounded-lg border p-6 mb-6"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--border)',
          }}
        >
          <h3
            className="text-sm font-semibold mb-4 uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Preferred Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {apiCategories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className="px-3 py-2 text-sm rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: selectedCategories.includes(category)
                    ? 'var(--accent)'
                    : 'var(--background)',
                  color: selectedCategories.includes(category) ? 'white' : 'var(--text-primary)',
                  border: `1px solid ${
                    selectedCategories.includes(category) ? 'var(--accent)' : 'var(--border)'
                  }`,
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Platforms */}
        <div
          className="rounded-lg border p-6 mb-6"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--border)',
          }}
        >
          <h3
            className="text-sm font-semibold mb-4 uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Preferred Platforms
          </h3>
          <div className="flex flex-wrap gap-2">
            {apiPlatforms.map((platform) => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className="px-3 py-2 text-sm rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: selectedPlatforms.includes(platform)
                    ? 'var(--accent)'
                    : 'var(--background)',
                  color: selectedPlatforms.includes(platform) ? 'white' : 'var(--text-primary)',
                  border: `1px solid ${
                    selectedPlatforms.includes(platform) ? 'var(--accent)' : 'var(--border)'
                  }`,
                }}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div
          className="rounded-lg border p-6 mb-6"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--border)',
          }}
        >
          <h3
            className="text-sm font-semibold mb-4 uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Notification Method
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border transition-all" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Email Notifications
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Receive price alerts via email
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 rounded cursor-pointer"
                style={{ accentColor: 'var(--accent)' }}
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border transition-all" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Push Notifications
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Receive instant alerts on your device
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="w-5 h-5 rounded cursor-pointer"
                style={{ accentColor: 'var(--accent)' }}
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={updateLoading || preferencesLoading}
          className="w-full py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity text-white flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--accent)',
            opacity: updateLoading || preferencesLoading ? 0.6 : 1,
            cursor: updateLoading || preferencesLoading ? 'not-allowed' : 'pointer',
          }}
        >
          <Save className="w-4 h-4" />
          {updateLoading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
