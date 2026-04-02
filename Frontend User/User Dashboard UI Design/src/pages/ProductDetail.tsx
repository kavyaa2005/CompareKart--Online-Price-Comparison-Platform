import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, ExternalLink, Heart, Share2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AIDecisionPanel } from '../components/AIDecisionPanel';
import { TrustPanel } from '../components/TrustPanel';
import { AlertModal } from '../components/AlertModal';
import { useUserPanel } from '../context/UserPanelContext';
import { useProductDetail, useCreateAlert, useAddToWishlist } from '../hooks/useUserApi';

export function ProductDetail() {
  const { id } = useParams();
  const { products } = useUserPanel();
  const contextProduct = products.find((p) => p.id === id);
  
  // Real API data
  const { data: productDetail, loading, error } = useProductDetail(id || '');
  
  // Mutation hooks for actions
  const { createAlert } = useCreateAlert();
  const { addToWishlist } = useAddToWishlist();
  
  // Use real product detail or fallback to mock data
  let product = null;
  if (productDetail) {
    // Map API response to component format
    product = {
      id: id || '',
      name: productDetail.product_name,
      category: productDetail.category || 'Electronics',
      brand: contextProduct?.brand || (productDetail.product_name?.split(' ')[0] || 'Brand'),
      image: contextProduct?.image || ('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23f0f0f0" width="400" height="400"/><text x="200" y="200" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="18" fill="%23999">' + (productDetail.product_name || 'Product').substring(0, 20) + '</text></svg>'),
      currentPrice: productDetail.platforms?.[0]?.current_price || 0,
      originalPrice: productDetail.platforms?.[0]?.current_price * 1.2 || 0,
      lowestPrice: Math.min(...(productDetail.platforms?.map(p => p.current_price) || [0])),
      highestPrice: Math.max(...(productDetail.platforms?.map(p => p.current_price) || [0])),
      platforms: productDetail.platforms?.map((p, idx) => ({
        name: p.name,
        icon: ['🛍️', '🏬', '👕', '🎯', '📱'][idx % 5],
        price: p.current_price,
        url: '#',
        rating: p.rating,
        inStock: true,
        discount: p.discount,
      })) || [],
      priceHistory: contextProduct?.priceHistory || [],
      recommendation: contextProduct?.recommendation || 'BUY',
      confidence: productDetail.average_rating ? (productDetail.average_rating / 5) * 100 : 75,
    };
  } else {
    product = contextProduct;
  }
  
  const [chartPeriod, setChartPeriod] = useState<'7D' | '30D' | '6M'>('30D');
  const [showAlertModal, setShowAlertModal] = useState(false);

  if (!product) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {loading ? 'Loading product...' : 'Product not found'}
          </h1>
          {!loading && error && (
            <p className="mt-2 text-sm" style={{ color: 'var(--danger)' }}>
              {String(error.message || 'Unable to load product details')}
            </p>
          )}
        </div>
      </div>
    );
  }

  const handleSetAlert = async (targetPrice: number, _enableAI: boolean, _platforms: string[]) => {
    try {
      await createAlert(product.id, targetPrice);
      setShowAlertModal(false);
    } catch (err) {
      console.error('Failed to create alert:', err);
    }
  };

  const handleAddWishlist = async () => {
    try {
      await addToWishlist(product.id);
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/product/${product.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Ignore clipboard failures silently to keep UI unchanged.
    }
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 mb-6 text-sm hover:opacity-70 transition-opacity"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Product Details (2 columns width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Header */}
          <div className="rounded-2xl border p-8" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>

              {/* Product Info */}
              <div>
                <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                  {product.category} • {product.brand}
                </div>
                <h1 className="text-3xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  {product.name}
                </h1>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-5xl font-bold" style={{ color: 'var(--primary)' }}>
                    ${product.currentPrice}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl line-through" style={{ color: 'var(--text-muted)' }}>
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Key Specs */}
                <details className="mb-6">
                  <summary className="cursor-pointer text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Key Specifications
                  </summary>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Category</span>
                      <span style={{ color: 'var(--text-primary)' }}>{product.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Brand</span>
                      <span style={{ color: 'var(--text-primary)' }}>{product.brand}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Lowest Price</span>
                      <span style={{ color: 'var(--success)' }}>${product.lowestPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Highest Price</span>
                      <span style={{ color: 'var(--danger)' }}>${product.highestPrice}</span>
                    </div>
                  </div>
                </details>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAlertModal(true)}
                    className="flex-1 px-6 py-3 rounded-xl font-medium text-white ripple-effect hover-lift"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    Set Price Alert
                  </button>
                  <button
                    onClick={handleAddWishlist}
                    className="px-4 py-3 rounded-xl border ripple-effect hover-lift"
                    style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border)' }}
                  >
                    <Heart className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-4 py-3 rounded-xl border ripple-effect hover-lift"
                    style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border)' }}
                  >
                    <Share2 className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Price Comparison Table */}
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Price Comparison
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {product.platforms.map((platform, index) => {
                const isLowest = platform.price === Math.min(...product.platforms.map((p) => p.price));
                const hasFastDelivery = index === 0;

                return (
                  <div
                    key={index}
                    className="p-6 flex items-center justify-between hover:bg-opacity-50 transition-colors"
                    style={{
                      backgroundColor: isLowest ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                      borderLeft: isLowest ? '4px solid var(--success)' : '4px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isLowest) {
                        e.currentTarget.style.backgroundColor = 'var(--background)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLowest) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-3xl">{platform.icon}</span>
                      <div>
                        <div className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          {platform.name}
                          {isLowest && (
                            <span className="px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: 'var(--success)' }}>
                              Lowest
                            </span>
                          )}
                          {hasFastDelivery && (
                            <span className="px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: 'var(--secondary)' }}>
                              Fast Delivery
                            </span>
                          )}
                        </div>
                        <div className="text-sm flex items-center gap-3 mt-1">
                          <span style={{ color: platform.inStock ? 'var(--success)' : 'var(--danger)' }}>
                            {platform.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            Delivery: 2-3 days
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                          ${platform.price}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          ⭐ 4.5 Rating
                        </div>
                      </div>
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg font-medium ripple-effect hover-lift flex items-center gap-2"
                        style={{ backgroundColor: 'var(--secondary)', color: 'white' }}
                      >
                        Visit
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price History Chart */}
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Price History & Trend
              </h2>
              <div className="flex gap-2">
                {(['7D', '30D', '6M'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all ripple-effect"
                    style={{
                      backgroundColor: chartPeriod === period ? 'var(--secondary)' : 'var(--background)',
                      color: chartPeriod === period ? 'white' : 'var(--text-primary)',
                    }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={product.priceHistory}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
                <YAxis stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--white)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine
                  y={product.lowestPrice}
                  stroke="var(--success)"
                  strokeDasharray="3 3"
                  label={{ value: 'Lowest', fill: 'var(--success)', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--secondary)"
                  strokeWidth={3}
                  fill="url(#priceGradient)"
                  dot={{ fill: 'var(--secondary)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* AI Annotations */}
            <div className="mt-4 flex gap-2">
              <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                📊 Festival Sale Zone
              </div>
              <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                ⚡ High Volatility
              </div>
            </div>
          </div>

          {/* Trust & Reviews */}
          <TrustPanel
            reviewCount={1247}
            positivePercentage={82}
            pros={[
              'Excellent sound quality',
              'Long battery life',
              'Comfortable for extended use',
              'Great noise cancellation',
            ]}
            cons={[
              'Expensive compared to alternatives',
              'Heavy for some users',
              'Limited color options',
            ]}
            trustScore={85}
          />
        </div>

        {/* Right Column - AI Decision Panel */}
        <div className="lg:col-span-1">
          {product.recommendation && (
            <AIDecisionPanel
              recommendation={product.recommendation}
              confidence={product.confidence || 85}
              product={{
                name: product.name,
                currentPrice: product.currentPrice,
                lowestPrice: product.lowestPrice,
                highestPrice: product.highestPrice,
              }}
            />
          )}
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        productName={product.name}
        currentPrice={product.currentPrice}
        onSetAlert={handleSetAlert}
      />
    </div>
  );
}
