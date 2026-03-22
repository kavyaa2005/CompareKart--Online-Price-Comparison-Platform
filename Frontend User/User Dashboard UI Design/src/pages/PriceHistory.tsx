import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUserPanel } from '../context/UserPanelContext';
import { usePriceHistory } from '../hooks/useUserApi';

export function PriceHistory() {
  const { products } = useUserPanel();
  const { data: historyData, loading, error } = usePriceHistory();
  
  // Use real price history from API, fallback to mock data
  const priceHistory = historyData?.history || [];
  const productByName = useMemo(
    () => new Map(products.map((product) => [product.name.toLowerCase(), product])),
    [products]
  );

  const displayProducts = priceHistory.length > 0
    ? priceHistory.slice(0, 4).map((item, idx) => {
        const matchedProduct = productByName.get(item.product_name.toLowerCase());
        return {
          id: matchedProduct?.id || `history-${idx}`,
          name: item.product_name,
          image: matchedProduct?.image || ('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f0f0f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="12" fill="%23999">' + item.product_name.substring(0, 8) + '</text></svg>'),
          currentPrice: item.price,
          priceHistory: matchedProduct?.priceHistory?.length
            ? matchedProduct.priceHistory
            : [{ date: item.viewedAt, price: item.price }],
          lowestPrice: matchedProduct?.lowestPrice ?? item.price,
          highestPrice: matchedProduct?.highestPrice ?? item.price,
          hasDetailRoute: Boolean(matchedProduct?.id),
        };
      })
    : products.slice(0, 4).map((item) => ({ ...item, hasDetailRoute: true }));
  
  return (
    <div className="min-h-screen pt-20 pb-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
          Price History
        </h1>

        <div className="space-y-8">
          {displayProducts.map((product) => {
            const firstPrice = product.priceHistory?.[0]?.price || product.currentPrice;
            const lastPrice = product.priceHistory?.[product.priceHistory.length - 1]?.price || product.currentPrice;
            const priceChange = lastPrice - firstPrice;
            const priceChangePercent = firstPrice
              ? ((priceChange / firstPrice) * 100).toFixed(1)
              : '0.0';

            return (
              <div
                key={product.id}
                className="rounded-xl border p-6"
                style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {product.name}
                    </h2>
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                        ₹{product.currentPrice?.toLocaleString()}
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: priceChange < 0 ? 'var(--success)' : 'var(--danger)' }}
                      >
                        {priceChange < 0 ? '' : '+'}₹{Math.abs(priceChange).toFixed(2)} ({priceChangePercent}%)
                      </span>
                    </div>
                  </div>
                  {product.hasDetailRoute ? (
                    <Link
                      to={`/product/${product.id}`}
                      className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-white"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      View Details
                    </Link>
                  ) : (
                    <span
                      className="px-4 py-2 rounded-lg text-sm"
                      style={{ backgroundColor: 'var(--background)', color: 'var(--text-muted)' }}
                    >
                      No detail view
                    </span>
                  )}
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={product.priceHistory || [{date: new Date().toLocaleDateString(), price: product.currentPrice}]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: '12px' }} />
                    <YAxis stroke="var(--text-secondary)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <Line type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div
                    className="rounded-lg p-3 border"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Lowest Price
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--success)' }}>
                      ₹{product.lowestPrice?.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className="rounded-lg p-3 border"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Current Price
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                      ₹{product.currentPrice?.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className="rounded-lg p-3 border"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Highest Price
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--danger)' }}>
                      ₹{product.highestPrice?.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {displayProducts.length === 0 && (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-muted)' }}>
                {loading ? 'Loading price history...' : 'No price history available yet. Start tracking products to see their price history!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
