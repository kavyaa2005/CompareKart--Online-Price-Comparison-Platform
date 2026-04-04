import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Product, mockAlerts, mockProducts } from '../data/mockData';

type Recommendation = 'BUY' | 'WAIT';

interface AuthUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

interface StoredAlert {
  id: string;
  productId: string;
  condition: string;
  targetPrice: number;
  status: 'Active' | 'Triggered';
  createdAt: string;
  triggeredAt?: string;
}

interface AlertsResponse {
  alerts: StoredAlert[];
}

interface WishlistResponse {
  productIds: string[];
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
}

interface UserPreferences {
  budgetMin: number;
  budgetMax: number;
  categories: string[];
  platforms: string[];
  emailNotifications: boolean;
  pushNotifications: boolean;
}

interface EffectiveUserSettingsResponse {
  settings: {
    default_platforms?: string[];
    default_categories?: string[];
    alerts_enabled?: boolean;
    user_email_notifications_enabled?: boolean;
    user_push_notifications_enabled?: boolean;
    user_panel_refresh_ms?: number;
    user_default_budget_max?: number;
  };
}

interface UserPanelContextValue {
  loading: boolean;
  error: string | null;
  products: Product[];
  alerts: Alert[];
  wishlistIds: string[];
  profile: UserProfile;
  preferences: UserPreferences;
  currentUser: AuthUser | null;
  refreshProducts: () => Promise<void>;
  setAlert: (productId: string, targetPrice: number) => void;
  toggleAlert: (alertId: string) => void;
  deleteAlert: (alertId: string) => void;
  addWishlist: (productId: string) => void;
  removeWishlist: (productId: string) => void;
  savePreferences: (next: UserPreferences) => void;
  saveProfile: (next: UserProfile) => void;
  logout: () => Promise<void>;
}

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK = String((import.meta as any)?.env?.VITE_USE_MOCK).toLowerCase() === 'true';
const TOKEN_KEY = 'user_panel_token';
const USER_PANEL_REFRESH_MS_DEFAULT = 30000;
const USER_PANEL_APPROVAL_SYNC_MS = 3000;

const MOCK_USER: AuthUser = {
  id: 0,
  username: 'demo_user',
  email: 'demo@example.com',
  full_name: 'Demo User',
  role: 'user',
};

const defaultProfile: UserProfile = {
  name: '',
  email: '',
  phone: '',
  city: '',
  bio: '',
};

const defaultPreferences: UserPreferences = {
  budgetMin: 0,
  budgetMax: 5000,
  categories: ['Electronics', 'Computers'],
  platforms: ['Amazon', 'Flipkart'],
  emailNotifications: true,
  pushNotifications: true,
};

const platformIconMap: Record<string, string> = {
  Amazon: '🛒',
  Flipkart: '🛍️',
  Walmart: '🏬',
  'Best Buy': '🏪',
  Target: '🎯',
  eBay: '📦',
};

const APPROVED_PRODUCT_IMAGE_MAP: Record<string, string> = {
  'bath towel premium': '/images/bath-towel-premium.jpg',
  'bed runner decorative': '/images/bed-runner-decorative.jpg',
  'bedsheet double king': '/images/bedsheet-double-king.jpg',
  'bluetooth speaker': '/images/bluetooth-speaker.jpg',
  'bluetooth speaker xyz': '/images/bluetooth-speaker-xyz.jpg',
  'body lotion pump': '/images/body-lotion-pump.jpg',
  'bookmark set': '/images/bookmark-set.jpg',
  'calendar 2026': '/images/calendar-2026.jpg',
  'card reader usb': '/images/card-reader-usb.jpg',
  'casual sneakers white': '/images/casual-sneakers-white.jpg',
};

const UserPanelContext = createContext<UserPanelContextValue | undefined>(undefined);

class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function toFriendlyErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Your session expired. Please login again.';
    if (err.status === 404) return 'Requested data was not found.';
    if (err.status && err.status >= 500) return 'Server is busy right now. Please try again shortly.';
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

function shouldRetryWrite(err: unknown): boolean {
  if (err instanceof ApiError) {
    // Retry only transient failures: network errors (status missing) or 5xx responses.
    return !err.status || err.status >= 500;
  }
  return false;
}

async function apiWriteRequest<T>(endpoint: string, token: string, options: RequestInit): Promise<T> {
  try {
    return await apiRequest<T>(endpoint, token, options);
  } catch (firstError) {
    if (!shouldRetryWrite(firstError)) {
      throw firstError;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    return apiRequest<T>(endpoint, token, options);
  }
}

async function apiRequest<T>(endpoint: string, token?: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError('Network connection issue. Please check internet and try again.');
  }

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const payload = await response.json();
      message = payload?.detail || payload?.error || message;
    } catch {
      // ignore json parse failure
    }
    throw new ApiError(message, response.status);
  }

  return response.json();
}

function recommendationFromApi(value: string): Recommendation {
  return value.toUpperCase().includes('BUY') ? 'BUY' : 'WAIT';
}

function toConfidencePercent(value: number): number {
  if (value <= 1) {
    return Math.round(value * 100);
  }
  return Math.round(value);
}

function buildImageUrl(productName: string): string {
  const normalizedName = productName.trim().toLowerCase().replace(/\s+/g, ' ');
  const localImage = APPROVED_PRODUCT_IMAGE_MAP[normalizedName];
  if (localImage) {
    return localImage;
  }

  const keyword = encodeURIComponent(productName.split(' ').slice(0, 3).join(' '));
  return `https://source.unsplash.com/featured/600x400/?${keyword},shopping`;
}

export function UserPanelProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [storedAlerts, setStoredAlerts] = useState<StoredAlert[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(USER_PANEL_REFRESH_MS_DEFAULT);
  const refreshInFlightRef = useRef(false);
  const approvedProductsSignatureRef = useRef('');

async function loginOrCreateDemoUser(): Promise<{ token: string; user: AuthUser }> {
  const demoCredentials = [
    { username: 'rahul_sharma', password: 'User@123' },
    { username: 'admin', password: 'Admin@123' },
  ];

  for (const creds of demoCredentials) {
    try {
      return await apiRequest('/auth/login', undefined, {
        method: 'POST',
        body: JSON.stringify(creds),
      });
    } catch {
      // try next credential
    }
  }

  const demoUsername = `demo_user_${Date.now().toString().slice(-6)}`;
  const signupPayload = {
    username: demoUsername,
    email: `${demoUsername}@example.com`,
    password: 'User@123',
    full_name: 'Demo User',
  };

  return apiRequest('/auth/signup', undefined, {
    method: 'POST',
    body: JSON.stringify(signupPayload),
  });
}

  const initializeAuth = useCallback(async () => {
    if (token) {
      try {
        const user = await apiRequest<AuthUser>('/auth/me', token);
        setCurrentUser(user);
        setProfile((prev) => {
          if (prev.name) return prev;
          return {
            ...prev,
            name: user.full_name || user.username,
            email: user.email || prev.email,
          };
        });
        return token;
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }
    }

    const auth = await loginOrCreateDemoUser();
    localStorage.setItem(TOKEN_KEY, auth.token);
    setToken(auth.token);
    setCurrentUser(auth.user);

    setProfile((prev) => ({
      ...prev,
      name: auth.user.full_name || auth.user.username,
      email: auth.user.email || prev.email,
    }));

    return auth.token;
  }, [token]);

  const syncPanelState = useCallback(async (activeToken: string) => {
    const [alertsResult, wishlistResult, profileResult, preferencesResult, effectiveSettingsResult] = await Promise.allSettled([
      apiRequest<AlertsResponse>('/user/alerts', activeToken),
      apiRequest<WishlistResponse>('/user/wishlist', activeToken),
      apiRequest<UserProfile>('/user/profile', activeToken),
      apiRequest<UserPreferences>('/user/preferences', activeToken),
      apiRequest<EffectiveUserSettingsResponse>('/user/effective-settings', activeToken),
    ]);

    if (alertsResult.status === 'fulfilled') {
      setStoredAlerts(alertsResult.value.alerts || []);
    }

    if (wishlistResult.status === 'fulfilled') {
      setWishlistIds(wishlistResult.value.productIds || []);
    }

    if (profileResult.status === 'fulfilled') {
      setProfile(profileResult.value);
    }

    if (preferencesResult.status === 'fulfilled') {
      setPreferences(preferencesResult.value);
    }

    if (effectiveSettingsResult.status === 'fulfilled') {
      const settings = effectiveSettingsResult.value?.settings || {};

      const interval = Number(settings.user_panel_refresh_ms);
      if (Number.isFinite(interval)) {
        const bounded = Math.max(15000, Math.min(Math.trunc(interval), 120000));
        setRefreshIntervalMs(bounded);
      }

      const adminAlertsEnabled = settings.alerts_enabled !== false;
      setAlertsEnabled(adminAlertsEnabled);

      setPreferences((prev) => {
        const next = { ...prev };

        if ((!next.platforms || next.platforms.length === 0) && Array.isArray(settings.default_platforms)) {
          const defaults = settings.default_platforms.map((item) => String(item).trim()).filter(Boolean);
          if (defaults.length > 0) {
            next.platforms = defaults;
          }
        }

        if ((!next.categories || next.categories.length === 0) && Array.isArray(settings.default_categories)) {
          const defaults = settings.default_categories.map((item) => String(item).trim()).filter(Boolean);
          if (defaults.length > 0) {
            next.categories = defaults;
          }
        }

        if (Number.isFinite(Number(settings.user_default_budget_max)) && next.budgetMax <= 0) {
          next.budgetMax = Number(settings.user_default_budget_max);
        }

        if (settings.user_email_notifications_enabled === false) {
          next.emailNotifications = false;
        }

        if (settings.user_push_notifications_enabled === false) {
          next.pushNotifications = false;
        }

        if (!adminAlertsEnabled) {
          next.emailNotifications = false;
          next.pushNotifications = false;
        }

        return next;
      });
    }
  }, []);

  const refreshProductsInternal = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (refreshInFlightRef.current) {
      return;
    }

    refreshInFlightRef.current = true;

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    if (USE_MOCK) {
      const mockToken = 'mock-mode-token';
      localStorage.setItem(TOKEN_KEY, mockToken);
      setToken(mockToken);
      setCurrentUser(MOCK_USER);
      setProducts(mockProducts);
      setStoredAlerts(
        mockAlerts.map((alert) => ({
          id: alert.id,
          productId: alert.productId,
          condition: alert.condition,
          targetPrice: alert.targetPrice,
          status: alert.status,
          createdAt: alert.createdAt,
          triggeredAt: alert.triggeredAt,
        }))
      );
      setWishlistIds(mockProducts.slice(0, 2).map((item) => item.id));
      setProfile((prev) => ({
        ...prev,
        name: prev.name || MOCK_USER.full_name,
        email: prev.email || MOCK_USER.email,
      }));
      setPreferences(defaultPreferences);
      if (!silent) {
        setLoading(false);
      }
      refreshInFlightRef.current = false;
      return;
    }

    try {
      const activeToken = await initializeAuth();
      await syncPanelState(activeToken);
      const listData = await apiRequest<{ products: string[] }>('/user/products', activeToken);
      approvedProductsSignatureRef.current = [...(listData.products || [])].sort().join('|');
      const productNames = listData.products.slice(0, 20);

      const hydrated = await Promise.all(
        productNames.map(async (productName, index) => {
          try {
            const compare = await apiRequest<{ product_name: string; comparison: Record<string, { current_price: number }> }>(
              `/user/compare?product_name=${encodeURIComponent(productName)}`,
              activeToken
            );

            const platformNames = Object.keys(compare.comparison);
            const fallbackPlatform = platformNames[0] || 'Amazon';

            let prediction: {
              recommendation: string;
              confidence: number;
              current_price: number;
              predicted_price: number;
              price_change_percentage: number;
            } | null = null;

            try {
              prediction = await apiRequest<{
                recommendation: string;
                confidence: number;
                current_price: number;
                predicted_price: number;
                price_change_percentage: number;
              }>(
                `/user/predict?product_name=${encodeURIComponent(productName)}&platform=${encodeURIComponent(fallbackPlatform)}`,
                activeToken
              );
            } catch {
              prediction = null;
            }

            let trend: {
              history: Array<{ date: string; price: number }>;
              min_price: number;
              max_price: number;
            } | null = null;

            try {
              trend = await apiRequest<{
                history: Array<{ date: string; price: number }>;
                min_price: number;
                max_price: number;
              }>(
                `/user/price-trend?product_name=${encodeURIComponent(productName)}&platform=${encodeURIComponent(fallbackPlatform)}`,
                activeToken
              );
            } catch {
              trend = null;
            }

            const platformRows = platformNames.map((platformName) => ({
              name: platformName,
              price: compare.comparison[platformName].current_price,
              url: '#',
              icon: platformIconMap[platformName] || '🛒',
              inStock: true,
            }));

            const priceValues = platformRows.map((p) => p.price);
            const currentPrice = Math.min(...priceValues);
            const highestVisiblePrice = Math.max(...priceValues);

            const changePct = prediction?.price_change_percentage ?? 0;
            const changeDirection = changePct < 0 ? 'drop' : 'rise';
            const aiReason =
              prediction == null
                ? 'Comparison approved. AI forecast is temporarily unavailable.'
                : changeDirection === 'drop'
                ? `AI expects ~${Math.abs(changePct).toFixed(1)}% price drop soon.`
                : `AI expects ~${Math.abs(changePct).toFixed(1)}% price rise.`;

            const product: Product = {
              id: String(index + 1),
              name: productName,
              image: buildImageUrl(productName),
              currentPrice,
              originalPrice: highestVisiblePrice,
              category: 'General',
              brand: productName.split(' ')[0] || 'Brand',
              recommendation: recommendationFromApi(prediction?.recommendation ?? 'WAIT'),
              confidence: toConfidencePercent(prediction?.confidence ?? 0.85),
              aiReason,
              platforms: platformRows,
              priceHistory: trend?.history?.map((point) => ({ date: point.date, price: point.price })) ?? [],
              lowestPrice: trend?.min_price ?? currentPrice,
              highestPrice: trend?.max_price ?? highestVisiblePrice,
            };

            return product;
          } catch {
            return null;
          }
        })
      );

      const validProducts = hydrated.filter((item): item is Product => Boolean(item));
      setProducts(validProducts);
    } catch (err) {
      if (!silent || products.length === 0) {
        setError(err instanceof Error ? err.message : 'Unable to load live data');
      }
      if (!silent) {
        setProducts([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
      refreshInFlightRef.current = false;
    }
  }, [initializeAuth, products.length, syncPanelState]);

  const refreshProducts = useCallback(async () => {
    await refreshProductsInternal({ silent: false });
  }, [refreshProductsInternal]);

  const syncApprovedProductsIfChanged = useCallback(async () => {
    if (USE_MOCK || !token || refreshInFlightRef.current) {
      return;
    }

    try {
      const listData = await apiRequest<{ products: string[] }>('/user/products', token);
      const nextSignature = [...(listData.products || [])].sort().join('|');

      if (nextSignature !== approvedProductsSignatureRef.current) {
        approvedProductsSignatureRef.current = nextSignature;
        await refreshProductsInternal({ silent: true });
      }
    } catch {
      // Keep the last successful UI state; regular refresh loop will retry.
    }
  }, [token, refreshProductsInternal]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    const runBackgroundRefresh = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return;
      }
      void refreshProductsInternal({ silent: true });
    };

    const intervalId = window.setInterval(runBackgroundRefresh, refreshIntervalMs);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        runBackgroundRefresh();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisible);
    }

    return () => {
      window.clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisible);
      }
    };
  }, [refreshIntervalMs, refreshProductsInternal]);

  useEffect(() => {
    const runApprovalSync = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return;
      }
      void syncApprovedProductsIfChanged();
    };

    const intervalId = window.setInterval(runApprovalSync, USER_PANEL_APPROVAL_SYNC_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        runApprovalSync();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisible);
    }

    return () => {
      window.clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisible);
      }
    };
  }, [syncApprovedProductsIfChanged]);

  const alerts = useMemo(() => {
    const productById = new Map(products.map((item) => [item.id, item]));

    return storedAlerts
      .map((entry) => {
        const product = productById.get(entry.productId);
        if (!product) return null;
        return {
          id: entry.id,
          productId: entry.productId,
          product,
          condition: entry.condition,
          targetPrice: entry.targetPrice,
          status: entry.status,
          createdAt: entry.createdAt,
          triggeredAt: entry.triggeredAt,
        } as Alert;
      })
      .filter((item): item is Alert => Boolean(item));
  }, [products, storedAlerts]);

  const setAlert = useCallback((productId: string, targetPrice: number) => {
    if (!alertsEnabled) {
      setError('Alerts are currently disabled by admin settings');
      return;
    }

    if (USE_MOCK) {
      const product = products.find((item) => item.id === productId);
      if (!product) {
        setError('Product not found');
        return;
      }

      const createdAt = new Date().toISOString().slice(0, 10);
      const newAlert: StoredAlert = {
        id: `mock-${Date.now()}`,
        productId,
        condition: `Price drops below ${targetPrice}`,
        targetPrice,
        status: 'Active',
        createdAt,
      };
      setStoredAlerts((prev) => [newAlert, ...prev]);
      return;
    }

    if (!token) {
      setError('Not authenticated');
      return;
    }

    void (async () => {
      setError(null);
      try {
        const created = await apiWriteRequest<StoredAlert>('/user/alerts', token, {
          method: 'POST',
          body: JSON.stringify({ productId, targetPrice }),
        });
        setStoredAlerts((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
      } catch (err) {
        setError(toFriendlyErrorMessage(err, 'Failed to create alert'));
      }
    })();
  }, [alertsEnabled, token]);

  const toggleAlert = useCallback((alertId: string) => {
    if (USE_MOCK) {
      setStoredAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? {
                ...alert,
                status: alert.status === 'Active' ? 'Triggered' : 'Active',
                triggeredAt: alert.status === 'Active' ? new Date().toISOString().slice(0, 10) : undefined,
              }
            : alert
        )
      );
      return;
    }

    if (!token) {
      setError('Not authenticated');
      return;
    }

    void (async () => {
      setError(null);
      try {
        const updated = await apiWriteRequest<StoredAlert>(`/user/alerts/${encodeURIComponent(alertId)}`, token, {
          method: 'PATCH',
          body: JSON.stringify({}),
        });
        setStoredAlerts((prev) => prev.map((alert) => (alert.id === alertId ? updated : alert)));
      } catch (err) {
        setError(toFriendlyErrorMessage(err, 'Failed to update alert'));
      }
    })();
  }, [token]);

  const deleteAlert = useCallback((alertId: string) => {
    if (USE_MOCK) {
      setStoredAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      return;
    }

    if (!token) {
      setError('Not authenticated');
      return;
    }

    void (async () => {
      setError(null);
      try {
        await apiWriteRequest(`/user/alerts/${encodeURIComponent(alertId)}`, token, { method: 'DELETE' });
        setStoredAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      } catch (err) {
        setError(toFriendlyErrorMessage(err, 'Failed to delete alert'));
      }
    })();
  }, [token]);

  const addWishlist = useCallback((productId: string) => {
    if (USE_MOCK) {
      setWishlistIds((prev) => (prev.includes(productId) ? prev : [productId, ...prev]));
      return;
    }

    if (!token) {
      setError('Not authenticated');
      return;
    }

    void (async () => {
      setError(null);
      try {
        const data = await apiWriteRequest<WishlistResponse>('/user/wishlist', token, {
          method: 'POST',
          body: JSON.stringify({ productId }),
        });
        setWishlistIds(data.productIds || []);
      } catch (err) {
        setError(toFriendlyErrorMessage(err, 'Failed to update wishlist'));
      }
    })();
  }, [token]);

  const removeWishlist = useCallback((productId: string) => {
    if (USE_MOCK) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      return;
    }

    if (!token) {
      setError('Not authenticated');
      return;
    }

    void (async () => {
      setError(null);
      try {
        const data = await apiWriteRequest<WishlistResponse>(`/user/wishlist/${encodeURIComponent(productId)}`, token, {
          method: 'DELETE',
        });
        setWishlistIds(data.productIds || []);
      } catch (err) {
        setError(toFriendlyErrorMessage(err, 'Failed to update wishlist'));
      }
    })();
  }, [token]);

  const savePreferences = useCallback((next: UserPreferences) => {
    if (USE_MOCK) {
      setPreferences(next);
      return;
    }

    if (!token) {
      setError('Not authenticated');
      return;
    }

    void (async () => {
      setError(null);
      try {
        const saved = await apiWriteRequest<UserPreferences>('/user/preferences', token, {
          method: 'PUT',
          body: JSON.stringify(next),
        });
        setPreferences(saved);
      } catch (err) {
        setError(toFriendlyErrorMessage(err, 'Failed to save preferences'));
      }
    })();
  }, [token]);

  const saveProfile = useCallback((next: UserProfile) => {
    if (USE_MOCK) {
      setProfile(next);
      setCurrentUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          full_name: next.name,
          email: next.email,
        };
      });
      return;
    }

    if (!token) {
      setError('Not authenticated');
      return;
    }

    void (async () => {
      setError(null);
      try {
        const saved = await apiWriteRequest<UserProfile>('/user/profile', token, {
          method: 'PUT',
          body: JSON.stringify(next),
        });
        setProfile(saved);
        setCurrentUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            full_name: saved.name,
            email: saved.email,
          };
        });
      } catch (err) {
        setError(toFriendlyErrorMessage(err, 'Failed to save profile'));
      }
    })();
  }, [token]);

  const logout = useCallback(async () => {
    if (USE_MOCK) {
      setToken(null);
      setCurrentUser(null);
      setStoredAlerts([]);
      setWishlistIds([]);
      setProducts([]);
      await refreshProducts();
      return;
    }

    if (token) {
      try {
        await apiRequest('/auth/logout', token, { method: 'POST' });
      } catch {
        // ignore logout API errors
      }
    }

    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCurrentUser(null);
    await refreshProducts();
  }, [refreshProducts, token]);

  const value = useMemo<UserPanelContextValue>(
    () => ({
      loading,
      error,
      products,
      alerts,
      wishlistIds,
      profile,
      preferences,
      currentUser,
      refreshProducts,
      setAlert,
      toggleAlert,
      deleteAlert,
      addWishlist,
      removeWishlist,
      savePreferences,
      saveProfile,
      logout,
    }),
    [
      loading,
      error,
      products,
      alerts,
      wishlistIds,
      profile,
      preferences,
      currentUser,
      refreshProducts,
      setAlert,
      toggleAlert,
      deleteAlert,
      addWishlist,
      removeWishlist,
      savePreferences,
      saveProfile,
      logout,
    ]
  );

  return <UserPanelContext.Provider value={value}>{children}</UserPanelContext.Provider>;
}

export function useUserPanel() {
  const context = useContext(UserPanelContext);
  if (!context) {
    throw new Error('useUserPanel must be used inside UserPanelProvider');
  }
  return context;
}
