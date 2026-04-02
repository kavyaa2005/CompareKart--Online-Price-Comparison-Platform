import React, { useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink } from 'lucide-react';
import { useUserPanel } from '../context/UserPanelContext';
import { useUserRecommendations } from '../hooks/useUserApi';

export function Recommendations() {
  const { products: mockProducts } = useUserPanel();
  const { data: recommendationsData, loading, error } = useUserRecommendations();
  
  // Use real recommendations from API, fallback to mock data
  const recommendations = recommendationsData?.recommendations || [];
  const recommendedProducts = recommendations.length > 0 
    ? recommendations 
    : mockProducts.filter((p) => p.recommendation);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          AI Recommendations
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Personalized picks based on AI analysis and market trends
        </p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendedProducts.length > 0 ? (
          recommendedProducts.map((product, index) => {
            // Handle both real API format and mock data format
            const isRealData = !product.id;
            const productId = isRealData ? product.productName : product.id;
            const productName = isRealData ? product.productName : product.name;
            const platform = isRealData ? product.platform : product.category;
            const currentPrice = isRealData ? product.currentPrice : product.currentPrice;
            const potentialPrice = isRealData ? product.potentialPrice : product.originalPrice;
            const reason = isRealData ? product.reason : product.aiReason;
            const rawConfidence = isRealData ? (product.confidence ?? 0.75) : (product.confidence ?? 75);
            const confidence = rawConfidence <= 1 ? Math.round(rawConfidence * 100) : Math.round(rawConfidence);
            const image = product.image || ('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f0f0f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="12" fill="%23999">No Image</text></svg>');

            return (
              <div
                key={index}
                className="rounded-lg border p-6 hover:shadow-md transition-all"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-start gap-6">
                  <img
                    src={image}
                    alt={productName}
                    className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {productName}
                        </h3>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                          {platform || 'Multi-platform'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          ₹{currentPrice?.toLocaleString() || 'N/A'}
                        </div>
                        {potentialPrice && (
                          <div className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>
                            ₹{potentialPrice?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <span
                        className="inline-flex px-3 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: confidence >= 80 
                            ? 'rgba(16, 185, 129, 0.1)' 
                            : 'rgba(245, 158, 11, 0.1)',
                          color: confidence >= 80 ? 'var(--success)' : 'var(--warning)',
                        }}
                      >
                        {confidence >= 80 ? 'BUY' : 'GOOD DEAL'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Confidence:
                        </span>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-24 h-1.5 rounded-full overflow-hidden"
                            style={{ backgroundColor: 'var(--border)' }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${confidence}%`,
                                backgroundColor: 'var(--accent)',
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                            {confidence}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {reason && (
                      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {reason}
                  </p>
                )}

                    <Link
                      to={`/product/${productId}`}
                      className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--accent)' }}
                    >
                      View Details
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p style={{ color: 'var(--text-muted)' }}>
              {loading ? 'Loading recommendations...' : 'No recommendations available yet. Create some alerts to get personalized recommendations!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
