import React, { useMemo, useState, useEffect } from 'react';
import { Camera, Mail, MapPin, Phone, Save, ShoppingBag, Sparkles, Star, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { useUserProfile, useUpdateProfile, useUserDashboard } from '../hooks/useUserApi';

export function Profile() {
  const { data: apiProfile, loading: profileLoading } = useUserProfile();
  const { updateProfile, loading: updateLoading, error: updateError } = useUpdateProfile();
  const { data: dashboardData, loading: dashboardLoading } = useUserDashboard();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Load profile from API on mount
  useEffect(() => {
    if (apiProfile) {
      setName(apiProfile.name || '');
      setEmail(apiProfile.email || '');
      setPhone(apiProfile.phone || '');
      setCity(apiProfile.city || '');
      setBio(apiProfile.bio || '');
    }
  }, [apiProfile]);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!name.trim()) errors.push('Full name is required');
    if (!email.trim()) errors.push('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email format');
    if (phone && !/^\d{10,}$/.test(phone.replace(/\D/g, ''))) errors.push('Phone must contain at least 10 digits');
    if (!city.trim()) errors.push('Location is required');
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    
    setSuccessMessage('');
    const success = await updateProfile({
      name,
      email,
      phone,
      city,
      bio,
    });
    
    if (success) {
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const profileStats = useMemo(() => ({
    trackedProducts: dashboardData?.totalSearches || 0,
    buyNowCount: dashboardData?.totalPredictions || 0,
    activeAlerts: dashboardData?.activeAlerts || 0,
    averageConfidence: dashboardData?.averageConfidence || dashboardData?.confidenceScore || 0,
    savedThisMonth: dashboardData?.savedThisMonth || dashboardData?.totalSavings || 0,
  }), [dashboardData]);

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Your Profile
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage your account details and shopping intelligence snapshot
          </p>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={updateLoading || profileLoading || dashboardLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--accent)',
            opacity: updateLoading || profileLoading || dashboardLoading ? 0.6 : 1,
            cursor: updateLoading || profileLoading || dashboardLoading ? 'not-allowed' : 'pointer',
          }}
        >
          <Save className="h-4 w-4" />
          {updateLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

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

      {/* API Error */}
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
            Failed to update profile. Please try again.
          </span>
        </div>
      )}

      {/* Loading State */}
      {profileLoading && (
        <div className="rounded-lg border p-4 mb-6 text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="relative mx-auto mb-5 h-24 w-24">
            <div
              className="h-24 w-24 rounded-full"
              style={{
                background: 'var(--gradient-primary)',
              }}
            />
            <button
              className="absolute bottom-0 right-0 rounded-full p-2 text-white"
              style={{ backgroundColor: 'var(--secondary)' }}
              aria-label="Upload profile image"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {name}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Smart Shopper
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--background)' }}>
              <Mail className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{email}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--background)' }}>
              <Phone className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{phone}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--background)' }}>
              <MapPin className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{city}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--background)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tracked</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {profileStats.trackedProducts}
              </p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--background)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Buy Now</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--success)' }}>
                {profileStats.buyNowCount}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className="rounded-2xl border p-6"
            style={{
              backgroundColor: 'var(--card-background)',
              borderColor: 'var(--border)',
            }}
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Personal Details
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs" style={{ color: 'var(--text-muted)' }}>
                  Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setValidationErrors((prev) => prev.filter((e) => !e.includes('name')));
                  }}
                  className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: validationErrors.some((e) => e.includes('name')) ? 'var(--danger)' : 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs" style={{ color: 'var(--text-muted)' }}>
                  Email <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setValidationErrors((prev) => prev.filter((e) => !e.includes('email')));
                  }}
                  className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: validationErrors.some((e) => e.includes('email')) ? 'var(--danger)' : 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs" style={{ color: 'var(--text-muted)' }}>
                  Phone
                </label>
                <input
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setValidationErrors((prev) => prev.filter((e) => !e.includes('phone')));
                  }}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: validationErrors.some((e) => e.includes('phone')) ? 'var(--danger)' : 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs" style={{ color: 'var(--text-muted)' }}>
                  Location <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                    setValidationErrors((prev) => prev.filter((e) => !e.includes('Location')));
                  }}
                  className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: validationErrors.some((e) => e.includes('Location')) ? 'var(--danger)' : 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-xs" style={{ color: 'var(--text-muted)' }}>
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={4}
                placeholder="Tell us about your shopping preferences..."
                className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--gradient-success)' }}>
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Alerts</p>
              <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {profileStats.activeAlerts}
              </p>
            </div>
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--gradient-primary)' }}>
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Confidence</p>
              <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {profileStats.averageConfidence}%
              </p>
            </div>
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--gradient-warning)' }}>
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Saved This Month</p>
              <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                ₹{profileStats.savedThisMonth.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Profile Strength
            </h3>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5"
                  style={{ color: star <= 4 ? 'var(--warning)' : 'var(--border)' }}
                  fill={star <= 4 ? 'var(--warning)' : 'none'}
                />
              ))}
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                80% complete
              </span>
            </div>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Add your shopping interests and preferred brands in Settings to reach 100% profile completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
