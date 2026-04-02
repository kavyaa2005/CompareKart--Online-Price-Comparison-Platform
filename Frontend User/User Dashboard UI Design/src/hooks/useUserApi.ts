/**
 * Custom React Hooks for User Panel API Data Fetching
 * Provides loading states, error handling, and data caching
 */

import { useState, useEffect, useCallback } from "react";
import { userAPIClient } from "../api/userClient";

interface UseApiOptions {
  pollingIntervalMs?: number;
  pollingEnabled?: boolean;
}

/**
 * Generic hook for fetching data from User API
 * Handles loading, error, and caching
 */
export function useUserApi<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const pollingIntervalMs = options.pollingIntervalMs;
  const pollingEnabled = options.pollingEnabled ?? true;

  const fetchData = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    // Check if user is authenticated before fetching
    if (!userAPIClient['token'] && typeof window !== 'undefined') {
      const token = localStorage.getItem('user_panel_token');
      if (!token) {
        setError(new Error('Not authenticated'));
        setLoading(false);
        return;
      }
      userAPIClient.setToken(token);
    }

    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    if (!pollingEnabled || !pollingIntervalMs || pollingIntervalMs < 15000) {
      return;
    }

    let inFlight = false;

    const runRefresh = async () => {
      if (inFlight) {
        return;
      }
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return;
      }

      inFlight = true;
      try {
        await fetchData(false);
      } finally {
        inFlight = false;
      }
    };

    const intervalId = window.setInterval(() => {
      void runRefresh();
    }, pollingIntervalMs);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void runRefresh();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible);
    }

    return () => {
      window.clearInterval(intervalId);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisible);
      }
    };
  }, [fetchData, pollingEnabled, pollingIntervalMs]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// ========== SEARCH & BROWSE HOOKS ==========

/**
 * Hook to search for products
 */
export function useSearchProduct(productName: string, platform?: string) {
  return useUserApi(
    () => userAPIClient.searchProduct(productName, platform),
    [productName, platform]
  );
}

/**
 * Hook to fetch available products list
 */
export function useAvailableProducts() {
  return useUserApi(() => userAPIClient.getAvailableProducts(), []);
}

/**
 * Hook to fetch price trend for a product
 */
export function useUserPriceTrend(productName: string, platform: string) {
  return useUserApi(
    () => userAPIClient.getPriceTrend(productName, platform),
    [productName, platform]
  );
}

/**
 * Hook to fetch price prediction
 */
export function useUserPrediction(productName: string, platform: string) {
  return useUserApi(
    () => userAPIClient.getPrediction(productName, platform),
    [productName, platform]
  );
}

/**
 * Hook to compare product prices across platforms
 */
export function usePlatformComparison(productName: string) {
  return useUserApi(
    () => userAPIClient.comparePlatforms(productName),
    [productName]
  );
}

// ========== ALERTS HOOKS ==========

/**
 * Hook to fetch user's alerts
 */
export function useUserAlerts() {
  return useUserApi(() => userAPIClient.getAlerts(), [], {
    pollingIntervalMs: 20000,
  });
}

/**
 * Hook to create a new alert
 * Note: Use this in mutation form (useCallback), not directly in component render
 */
export function useCreateAlert() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createAlert = useCallback(async (productId: string, targetPrice: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userAPIClient.createAlert({ productId, targetPrice });
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, []);

  return { createAlert, loading, error };
}

/**
 * Hook to update alert status
 */
export function useToggleAlertStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toggleStatus = useCallback(async (alertId: string, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userAPIClient.toggleAlertStatus(alertId, status);
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, []);

  return { toggleStatus, loading, error };
}

/**
 * Hook to update alert
 */
export function useUpdateAlert() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateAlert = useCallback(async (alertId: string, update: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userAPIClient.updateAlert(alertId, update);
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, []);

  return { updateAlert, loading, error };
}

/**
 * Hook to delete an alert
 */
export function useDeleteAlert() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteAlert = useCallback(async (alertId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userAPIClient.deleteAlert(alertId);
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, []);

  return { deleteAlert, loading, error };
}

// ========== WISHLIST HOOKS ==========

/**
 * Hook to fetch user's wishlist
 */
export function useUserWishlist() {
  return useUserApi(() => userAPIClient.getWishlist(), [], {
    pollingIntervalMs: 20000,
  });
}

/**
 * Hook to add product to wishlist
 */
export function useAddToWishlist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addToWishlist = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userAPIClient.addToWishlist(productId);
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, []);

  return { addToWishlist, loading, error };
}

/**
 * Hook to remove product from wishlist
 */
export function useRemoveFromWishlist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const removeFromWishlist = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userAPIClient.removeFromWishlist(productId);
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, []);

  return { removeFromWishlist, loading, error };
}

// ========== USER PREFERENCES & PROFILE HOOKS ==========

/**
 * Hook to fetch user preferences
 */
export function useUserPreferences() {
  return useUserApi(() => userAPIClient.getPreferences(), []);
}

/**
 * Hook to update user preferences
 */
export function useUpdatePreferences() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePreferences = useCallback(async (preferences: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userAPIClient.updatePreferences(preferences);
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, []);

  return { updatePreferences, loading, error };
}

/**
 * Hook to fetch user profile
 */
export function useUserProfile() {
  return useUserApi(() => userAPIClient.getProfile(), []);
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProfile = useCallback(async (profile: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userAPIClient.updateProfile(profile);
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, []);

  return { updateProfile, loading, error };
}

// ========== DASHBOARD & RECOMMENDATIONS HOOKS ==========

/**
 * Hook to fetch user dashboard statistics
 */
export function useUserDashboard() {
  return useUserApi(() => userAPIClient.getDashboardStats(), [], {
    pollingIntervalMs: 30000,
  });
}

/**
 * Hook to fetch AI-powered recommendations
 */
export function useUserRecommendations() {
  return useUserApi(() => userAPIClient.getRecommendations(), [], {
    pollingIntervalMs: 30000,
  });
}

/**
 * Hook to fetch product details
 */
export function useProductDetail(productId: string) {
  return useUserApi(
    () => userAPIClient.getProductDetail(productId),
    [productId]
  );
}

/**
 * Hook to fetch user's price history
 */
export function usePriceHistory() {
  return useUserApi(() => userAPIClient.getPriceHistory(), [], {
    pollingIntervalMs: 30000,
  });
}
