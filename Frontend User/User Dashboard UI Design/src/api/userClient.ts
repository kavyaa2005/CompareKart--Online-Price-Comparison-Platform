/**
 * API Client for User Panel
 * Handles all authenticated REST API calls for user dashboard, alerts, wishlist, preferences, etc.
 */

// TypeScript Interfaces for User API Responses

export interface UserProduct {
  product_name: string;
  platform: string;
  current_price: number;
  discount: number;
  rating: number;
}

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

export interface Alert {
  id: string;
  productId: string;
  condition: string;
  targetPrice: number;
  status: 'Active' | 'Triggered';
  createdAt: string;
  triggeredAt?: string;
}

export interface AlertsResponse {
  alerts: Alert[];
  count: number;
}

export interface AlertRequest {
  productId: string;
  targetPrice: number;
}

export interface AlertUpdateRequest {
  productId?: string;
  targetPrice?: number;
  status?: 'Active' | 'Triggered';
}

export interface WishlistResponse {
  productIds: string[];
  count: number;
  added?: boolean;
  removed?: boolean;
}

export interface UserPreferences {
  budgetMin: number;
  budgetMax: number;
  categories: string[];
  platforms: string[];
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
}

export interface UserDashboardStats {
  totalAlerts: number;
  activeAlerts: number;
  wishlistCount: number;
  totalSearches: number;
  totalPredictions: number;
  recentActivity: Array<{
    timestamp: string;
    activity: string;
    details: string;
  }>;
}

export interface Recommendation {
  productName: string;
  platform: string;
  reason: string;
  currentPrice: number;
  potentialPrice: number;
  confidence: number;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  count: number;
}

export interface ProductDetail {
  product_name: string;
  category: string;
  platforms: Array<{
    name: string;
    current_price: number;
    discount: number;
    rating: number;
  }>;
  average_rating: number;
  price_history_available: boolean;
}

export interface PriceHistory {
  product_name: string;
  viewedAt: string;
  platform: string;
  price: number;
}

export interface PriceHistoryResponse {
  history: PriceHistory[];
  count: number;
}

export interface SearchResponse {
  product_name: string;
  platform: string;
  current_price: number;
  discount: number;
  rating: number;
}

export interface ProductsListResponse {
  products: string[];
  count: number;
}

// User API Client Class
export class UserAPIClient {
  private baseURL: string;
  private token: string | null = null;
  private readonly primaryTokenKey = "user_panel_token";

  constructor(baseURL: string = "http://localhost:8000") {
    this.baseURL = baseURL;
    this.loadToken();
  }

  /**
   * Load auth token from localStorage
   */
  private loadToken() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(this.primaryTokenKey);
      this.token = storedToken;
    }
  }

  /**
   * Set auth token
   */
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.primaryTokenKey, token);
    }
  }

  /**
   * Clear auth token
   */
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.primaryTokenKey);
    }
  }

  /**
   * Generic method to make API requests with authentication
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...options.headers as Record<string, string>,
      };

      // Add token if available
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        headers,
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: response.statusText,
        }));
        
        // Handle auth errors
        if (response.status === 401 || response.status === 403) {
          this.clearToken();
        }
        
        throw new Error(
          errorData.detail || errorData.error || `API request failed: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ========== SEARCH & BROWSE ENDPOINTS ==========

  /**
   * Search for a product
   */
  async searchProduct(
    productName: string,
    platform?: string
  ): Promise<SearchResponse> {
    return this.request("/user/search", {
      method: "POST",
      body: JSON.stringify({
        product_name: productName,
        platform: platform,
      }),
    });
  }

  /**
   * Get list of all available products
   */
  async getAvailableProducts(): Promise<ProductsListResponse> {
    return this.request("/user/products");
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
    return this.request(`/user/price-trend?${params}`);
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
    return this.request(`/user/predict?${params}`);
  }

  /**
   * Compare product prices across platforms
   */
  async comparePlatforms(
    productName: string
  ): Promise<PlatformComparisonResponse> {
    const params = new URLSearchParams({
      product_name: productName,
    });
    return this.request(`/user/compare?${params}`);
  }

  // ========== ALERTS ENDPOINTS ==========

  /**
   * Get all alerts for current user
   */
  async getAlerts(): Promise<AlertsResponse> {
    return this.request("/user/alerts");
  }

  /**
   * Create a new price alert
   */
  async createAlert(alert: AlertRequest): Promise<Alert> {
    return this.request("/user/alerts", {
      method: "POST",
      body: JSON.stringify(alert),
    });
  }

  /**
   * Toggle alert status (Active ↔ Triggered)
   */
  async toggleAlertStatus(alertId: string, status?: string): Promise<Alert> {
    return this.request(`/user/alerts/${alertId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: status || null }),
    });
  }

  /**
   * Update an alert (full update)
   */
  async updateAlert(
    alertId: string,
    update: AlertUpdateRequest
  ): Promise<Alert> {
    return this.request(`/user/alerts/${alertId}`, {
      method: "PUT",
      body: JSON.stringify(update),
    });
  }

  /**
   * Delete an alert
   */
  async deleteAlert(alertId: string): Promise<{ success: boolean; deletedId: string }> {
    return this.request(`/user/alerts/${alertId}`, {
      method: "DELETE",
    });
  }

  // ========== WISHLIST ENDPOINTS ==========

  /**
   * Get user's wishlist
   */
  async getWishlist(): Promise<WishlistResponse> {
    return this.request("/user/wishlist");
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string): Promise<WishlistResponse> {
    return this.request("/user/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
  }

  /**
   * Remove product from wishlist by ID
   */
  async removeFromWishlist(productId: string): Promise<WishlistResponse> {
    return this.request(`/user/wishlist/${productId}`, {
      method: "DELETE",
    });
  }

  /**
   * Remove product from wishlist by body (alternative method)
   */
  async removeFromWishlistByBody(productId: string): Promise<WishlistResponse> {
    return this.request("/user/wishlist", {
      method: "DELETE",
      body: JSON.stringify({ productId }),
    });
  }

  // ========== USER PREFERENCES & PROFILE ==========

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    return this.request("/user/preferences");
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.request("/user/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    return this.request("/user/profile");
  }

  /**
   * Update user profile
   */
  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    return this.request("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
  }

  // ========== DASHBOARD & RECOMMENDATIONS (Placeholder for new endpoints) ==========

  /**
   * Get user dashboard statistics (requires backend endpoint)
   */
  async getDashboardStats(): Promise<UserDashboardStats> {
    try {
      return await this.request("/user/dashboard");
    } catch (error) {
      // Fallback: calculate from other endpoints
      const alerts = await this.getAlerts();
      const wishlist = await this.getWishlist();
      return {
        totalAlerts: alerts.count,
        activeAlerts: alerts.alerts.filter(a => a.status === 'Active').length,
        wishlistCount: wishlist.count,
        totalSearches: 0,
        totalPredictions: 0,
        recentActivity: [],
      };
    }
  }

  /**
   * Get AI-powered recommendations (requires backend endpoint)
   */
  async getRecommendations(): Promise<RecommendationsResponse> {
    try {
      return await this.request("/user/recommendations");
    } catch (error) {
      // Fallback: return empty
      return {
        recommendations: [],
        count: 0,
      };
    }
  }

  /**
   * Get product details (requires backend endpoint)
   */
  async getProductDetail(productId: string): Promise<ProductDetail> {
    try {
      return await this.request(`/user/product/${productId}`);
    } catch (error) {
      throw new Error(`Failed to get product details for ${productId}`);
    }
  }

  /**
   * Get price history for user's viewed products (requires backend endpoint)
   */
  async getPriceHistory(): Promise<PriceHistoryResponse> {
    try {
      return await this.request("/user/price-history");
    } catch (error) {
      // Fallback: return empty
      return {
        history: [],
        count: 0,
      };
    }
  }
}

// Singleton instance for easy imports
export const userAPIClient = new UserAPIClient();
