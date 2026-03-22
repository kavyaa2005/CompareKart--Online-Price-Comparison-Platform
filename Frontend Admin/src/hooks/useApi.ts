/**
 * Custom React Hooks for API Data Fetching
 * Provides loading states, error handling, and data caching
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";

interface UseApiOptions {
  pollingIntervalMs?: number;
  pollingEnabled?: boolean;
}

/**
 * Generic hook for fetching data from API
 * Handles loading, error, and caching
 */
export function useApi<T>(
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
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
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

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  return useApi(() => apiClient.getDashboardStats(), [], {
    pollingIntervalMs: 30000,
  });
}

/**
 * Hook to fetch model status
 */
export function useModelStatus() {
  return useApi(() => apiClient.getModelStatus(), [], {
    pollingIntervalMs: 30000,
  });
}

/**
 * Hook to fetch price trend
 */
export function usePriceTrend(productName: string, platform: string) {
  return useApi(
    () => apiClient.getPriceTrend(productName, platform),
    [productName, platform]
  );
}

/**
 * Hook to fetch price prediction
 */
export function usePrediction(productName: string, platform: string) {
  return useApi(
    () => apiClient.getPrediction(productName, platform),
    [productName, platform]
  );
}

/**
 * Hook to fetch trending products
 */
export function useTrendingProducts(limit: number = 5) {
  return useApi(() => apiClient.getTrendingProducts(limit), [limit]);
}

/**
 * Hook to fetch platform comparison
 */
export function usePlatformComparison(productName: string) {
  return useApi(
    () => apiClient.getPlatformComparison(productName),
    [productName]
  );
}

/**
 * Hook to fetch dataset list
 */
export function useDatasetList() {
  return useApi(() => apiClient.getDatasetList(), [], {
    pollingIntervalMs: 30000,
  });
}

/**
 * Hook to fetch dataset statistics
 */
export function useDatasetStats() {
  return useApi(() => apiClient.getDatasetStats(), [], {
    pollingIntervalMs: 30000,
  });
}

/**
 * Hook to fetch user behavior analytics
 */
export function useUserBehavior() {
  return useApi(() => apiClient.getUserBehavior(), [], {
    pollingIntervalMs: 30000,
  });
}

/**
 * Hook to fetch engagement analytics
 */
export function useEngagementAnalytics() {
  return useApi(() => apiClient.getEngagementAnalytics(), [], {
    pollingIntervalMs: 30000,
  });
}

/**
 * Hook to fetch system logs
 */
export function useSystemLogs(limit: number = 100) {
  return useApi(() => apiClient.getSystemLogs(limit), [limit], {
    pollingIntervalMs: 15000,
  });
}

/**
 * Hook to fetch all registered users for admin
 */
export function useAdminUsers() {
  return useApi(() => apiClient.getAdminUsers(), [], {
    pollingIntervalMs: 30000,
  });
}

/**
 * Hook to search for products
 */
export function useSearchProduct(productName: string, platform?: string) {
  return useApi(
    () => apiClient.searchProduct(productName, platform),
    [productName, platform]
  );
}

/**
 * Hook to fetch product matching pairs
 */
export function useMatchingPairs() {
  return useApi(() => apiClient.getMatchingPairs(), [], {
    pollingIntervalMs: 20000,
  });
}

/**
 * Hook to fetch product matching stats
 */
export function useMatchingStats() {
  return useApi(() => apiClient.getMatchingStats(), [], {
    pollingIntervalMs: 20000,
  });
}
