/**
 * API Client for E-commerce Price Comparison Backend
 * Handles all REST API calls to the backend server
 */

// TypeScript Interfaces for API Responses

export interface PriceHistoryPoint {
  date: string;
  price: number;
  discount: number;
}

export interface PriceTrendResponse {
  product_name: string;
  platform: string;
  history: PriceHistoryPoint[];
  current_price: number;
  average_price: number;
  min_price: number;
  max_price: number;
}

export interface PredictionResponse {
  product_name: string;
  platform: string;
  current_price: number;
  predicted_price: number;
  price_change_percentage: number;
  recommendation: string; // "BUY NOW" or "WAIT"
  confidence: number;
}

export interface TrendingProduct {
  product_name: string;
  platform: string;
  current_price: number;
  volatility: number;
  price_range: {
    min: number;
    max: number;
  };
}

export interface TrendingProductsResponse {
  trending_products: TrendingProduct[];
  count: number;
}

export interface PlatformComparison {
  [platform: string]: {
    current_price: number;
    discount: number;
    rating: number;
    date: string;
  };
}

export interface PlatformComparisonResponse {
  product_name: string;
  comparison: PlatformComparison;
  best_deal: string;
}

export interface DashboardStats {
  active_datasets: number;
  active_models: number;
  total_predictions: number;
  accuracy_percentage: number;
  recent_accuracy_trend: Array<{
    date: string;
    accuracy: number;
  }>;
  prediction_volume_trend: Array<{
    date: string;
    volume: number;
  }>;
}

export interface ModelStatus {
  model_name: string;
  status: string; // "trained", "training", "idle"
  accuracy: number;
  rmse: number;
  mae: number;
  training_date: string;
  last_trained_records: number;
  feature_importance: {
    [feature: string]: number;
  };
  next_training_scheduled: string | null;
}

export interface DatasetStats {
  dataset_name: string;
  total_records: number;
  products_count: number;
  platforms_count: number;
  date_range: {
    min: string;
    max: string;
  };
  file_size_mb: number;
  last_updated: string;
}

export interface DatasetListResponse {
  datasets: DatasetStats[];
  total_datasets: number;
}

export interface DatasetStatsDetails {
  total_records: number;
  products: {
    count: number;
    list: string[];
  };
  platforms: {
    count: number;
    list: string[];
  };
  price_stats: {
    min: number;
    max: number;
    mean: number;
    std: number;
  };
  date_range: {
    min: string;
    max: string;
  };
  records_per_product: number;
}

export interface UserBehaviorAnalytics {
  total_users: number;
  active_users: number;
  predictions_per_user: number;
  popular_products: Array<{
    name: string;
    searches: number;
  }>;
  popular_platforms: Array<{
    platform: string;
    queries: number;
  }>;
}

export interface EngagementAnalytics {
  engagement_trend: Array<{
    date: string;
    active_users: number;
    predictions: number;
    page_views: number;
  }>;
  total_sessions: number;
  avg_session_duration_minutes: number;
  bounce_rate: number;
}

export interface SystemLog {
  timestamp: string;
  level: string; // "INFO", "WARNING", "ERROR"
  activity: string;
  details: string;
}

export interface SystemLogsResponse {
  logs: SystemLog[];
  total_entries: number;
  time_range: {
    from: string;
    to: string;
  };
}

export interface SearchProductResponse {
  product_name: string;
  platform: string;
  current_price: number;
  discount: number;
  rating: number;
}

export interface ApiError {
  error: string;
  status_code: number;
  details?: string;
}

export interface AdminSettingsResponse {
  settings: Record<string, any>;
}

export interface AdminSettingsUpdateRequest {
  settings: Record<string, any>;
}

export interface DatasetRefreshResponse {
  status: string;
  dataset_name: string;
  total_records: number;
  products_count: number;
  platforms_count: number;
  file_size_mb: number;
  refreshed_at: string;
}

export interface DatasetValidationResponse {
  status: string;
  checked_at: string;
  summary: {
    total_rows: number;
    duplicate_rows: number;
    invalid_prices: number;
    invalid_ratings: number;
  };
  errors: string[];
  warnings: string[];
}

export interface DatasetBatchSimulationResponse {
  status: string;
  started_at: string;
  finished_at: string;
  processed_records: number;
  skipped_records: number;
  error_count: number;
}

export interface ReviewsTrustSummaryResponse {
  overall_trust: number;
  total_flagged: number;
  accuracy_rate: number;
  platform_breakdown: Array<{
    platform: string;
    trust: number;
    fakeReviews: number;
  }>;
}

export interface FlaggedReviewsResponse {
  reviews: Array<{
    id: number;
    product: string;
    platform: string;
    reviewer: string;
    rating: number;
    risk: string;
    reason: string;
    status: string;
    timestamp?: string;
  }>;
  count: number;
}

export interface ReviewAnalyzeResponse {
  status: string;
  analyzed_records: number;
  suspicious_found: number;
  model_confidence: number;
  completed_at: string;
}

export interface DbSetupStatusResponse {
  schema_version_expected: number;
  schema_version_db: number;
  all_required_tables_present: boolean;
  missing_tables: string[];
  required_tables_count: number;
  found_tables_count: number;
  db_path: string;
  timestamp: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  created_at: string;
  last_login: string | null;
  is_active: number;
  total_activities: number;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
}

// API Client Class
export class APIClient {
  private baseURL: string;
  private loginPromise: Promise<string | null> | null = null;

  constructor(baseURL: string = "http://localhost:8000") {
    this.baseURL = baseURL;
  }

  /**
   * Generic method to make API requests
   */
  private getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") {
      return {};
    }

    const token = window.localStorage.getItem("admin_token");

    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getStoredToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("admin_token");
  }

  private async ensureAdminToken(): Promise<string | null> {
    const existingToken = this.getStoredToken();
    if (existingToken) {
      return existingToken;
    }

    if (typeof window === "undefined") {
      return null;
    }

    if (!this.loginPromise) {
      this.loginPromise = (async () => {
        try {
          const username = window.localStorage.getItem("admin_username") || "admin";
          const password = window.localStorage.getItem("admin_password") || "Admin@123";

          const response = await fetch(`${this.baseURL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            return null;
          }

          const loginData = await response.json();
          const token = loginData?.token;
          if (token && typeof token === "string") {
            window.localStorage.setItem("admin_token", token);
            return token;
          }
          return null;
        } catch {
          return null;
        }
      })();
    }

    try {
      return await this.loginPromise;
    } finally {
      this.loginPromise = null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      if (endpoint.startsWith("/api/")) {
        await this.ensureAdminToken();
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });

      if (response.status === 401 && endpoint.startsWith("/api/")) {
        const refreshedToken = await this.ensureAdminToken();
        if (refreshedToken) {
          const retryResponse = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              ...this.getAuthHeaders(),
              ...options.headers,
            },
            ...options,
          });

          if (retryResponse.ok) {
            return await retryResponse.json();
          }

          const retryError = await retryResponse.json().catch(() => ({
            error: retryResponse.statusText,
          }));
          throw new Error(
            retryError.detail || retryError.error || "API request failed"
          );
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: response.statusText,
        }));
        throw new Error(
          errorData.detail || errorData.error || "API request failed"
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ========== EXISTING ENDPOINTS ==========

  /**
   * Get health status of the API
   */
  async getHealth() {
    return this.request("/health");
  }

  /**
   * Search for a product by name and optional platform
   */
  async searchProduct(
    productName: string,
    platform?: string
  ): Promise<SearchProductResponse> {
    return this.request("/search-product", {
      method: "POST",
      body: JSON.stringify({
        product_name: productName,
        platform: platform,
      }),
    });
  }

  /**
   * Get price trend for a product on a platform
   */
  async getPriceTrend(
    productName: string,
    platform: string
  ): Promise<PriceTrendResponse> {
    const params = new URLSearchParams({
      product_name: productName,
      platform: platform,
    });
    return this.request(`/price-trend?${params}`);
  }

  /**
   * Get price prediction and recommendation
   */
  async getPrediction(
    productName: string,
    platform: string
  ): Promise<PredictionResponse> {
    const params = new URLSearchParams({
      product_name: productName,
      platform: platform,
    });
    return this.request(`/predict?${params}`);
  }

  /**
   * Get trending products with highest volatility
   */
  async getTrendingProducts(
    limit: number = 5
  ): Promise<TrendingProductsResponse> {
    return this.request(`/trending-products?limit=${limit}`);
  }

  /**
   * Compare prices between platforms for a product
   */
  async getPlatformComparison(
    productName: string
  ): Promise<PlatformComparisonResponse> {
    const params = new URLSearchParams({
      product_name: productName,
    });
    return this.request(`/platform-comparison?${params}`);
  }

  // ========== NEW DASHBOARD & ANALYTICS ENDPOINTS ==========

  /**
   * Get dashboard statistics for HomePage
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request("/api/dashboard/stats");
  }

  /**
   * Get model training status and performance
   */
  async getModelStatus(): Promise<ModelStatus> {
    return this.request("/api/models/status");
  }

  /**
   * Get list of available datasets
   */
  async getDatasetList(): Promise<DatasetListResponse> {
    return this.request("/api/datasets/list");
  }

  /**
   * Get detailed dataset statistics
   */
  async getDatasetStats(): Promise<DatasetStatsDetails> {
    return this.request("/api/datasets/stats");
  }

  /**
   * Upload a new dataset file
   */
  async uploadDataset(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${this.baseURL}/api/datasets/upload`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...this.getAuthHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Dataset upload failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Dataset upload error:", error);
      throw error;
    }
  }

  /**
   * Get user behavior analytics
   */
  async getUserBehavior(): Promise<UserBehaviorAnalytics> {
    return this.request("/api/analytics/user-behavior");
  }

  /**
   * Get engagement analytics
   */
  async getEngagementAnalytics(): Promise<EngagementAnalytics> {
    return this.request("/api/analytics/engagement");
  }

  /**
   * Get system logs
   */
  async getSystemLogs(limit: number = 100): Promise<SystemLogsResponse> {
    return this.request(`/api/logs/system?limit=${limit}`);
  }

  /**
   * Get all registered users for admin operations
   */
  async getAdminUsers(): Promise<AdminUsersResponse> {
    return this.request("/api/admin/users");
  }

  /**
   * Get product matching pairs
   */
  async getMatchingPairs(): Promise<any> {
    return this.request("/api/matching/pairs");
  }

  /**
   * Get product matching stats
   */
  async getMatchingStats(): Promise<any> {
    return this.request("/api/matching/stats");
  }

  /**
   * Approve/reject/flag a match pair
   */
  async matchingAction(pairId: number, action: string): Promise<any> {
    return this.request(`/api/matching/${pairId}/action?action=${action}`, {
      method: "POST",
    });
  }

  /**
   * Get admin settings key-value map
   */
  async getAdminSettings(): Promise<AdminSettingsResponse> {
    return this.request("/api/admin/settings");
  }

  /**
   * Update one or more admin settings
   */
  async updateAdminSettings(
    payload: AdminSettingsUpdateRequest
  ): Promise<AdminSettingsResponse> {
    return this.request("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get DB setup/migration status
   */
  async getDbSetupStatus(): Promise<DbSetupStatusResponse> {
    return this.request("/api/system/db-status");
  }

  /**
   * Refresh dataset metadata
   */
  async refreshDataset(): Promise<DatasetRefreshResponse> {
    return this.request("/api/datasets/refresh", {
      method: "POST",
    });
  }

  /**
   * Run dataset validation
   */
  async validateDataset(): Promise<DatasetValidationResponse> {
    return this.request("/api/datasets/validate", {
      method: "POST",
    });
  }

  /**
   * Run dataset batch simulation
   */
  async simulateDatasetBatch(): Promise<DatasetBatchSimulationResponse> {
    return this.request("/api/datasets/simulate-batch", {
      method: "POST",
    });
  }

  /**
   * Get review trust summary
   */
  async getReviewsTrustSummary(): Promise<ReviewsTrustSummaryResponse> {
    return this.request("/api/reviews/trust-summary");
  }

  /**
   * Get flagged review list
   */
  async getFlaggedReviews(limit: number = 20): Promise<FlaggedReviewsResponse> {
    return this.request(`/api/reviews/flagged?limit=${limit}`);
  }

  /**
   * Approve/block a flagged review
   */
  async reviewAction(reviewId: number, action: "approved" | "blocked"): Promise<{ review_id: number; status: string }> {
    return this.request(`/api/reviews/${reviewId}/action?action=${action}`, {
      method: "POST",
    });
  }

  /**
   * Run review analysis
   */
  async analyzeReviews(): Promise<ReviewAnalyzeResponse> {
    return this.request("/api/reviews/analyze", {
      method: "POST",
    });
  }
}

// Create singleton instance
export const apiClient = new APIClient();
