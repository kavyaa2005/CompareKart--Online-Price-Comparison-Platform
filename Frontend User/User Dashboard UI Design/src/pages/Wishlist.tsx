import React, { useMemo, useCallback, useState } from 'react';
import { Link } from 'react-router';
import { Trash2, ExternalLink } from 'lucide-react';
import { useUserPanel } from '../context/UserPanelContext';
import { useUserWishlist, useRemoveFromWishlist } from '../hooks/useUserApi';

export function Wishlist() {
  const { products: mockProducts } = useUserPanel();
  
  // Real API hooks
  const { data: wishlistData, loading, error, refetch } = useUserWishlist();
  const { removeFromWishlist, loading: removeLoading } = useRemoveFromWishlist();
  
  // Use real wishlist from API, fallback to mock data
  const wishlistIds = wishlistData?.productIds || [];
  const wishlistItems = useMemo(
    () => mockProducts.filter((item) => wishlistIds.includes(item.id))
      .map(product => ({
        ...product,
        currentPrice: product.currentPrice,
        originalPrice: product.originalPrice,
      })),
    [mockProducts, wishlistIds]
  );

  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const handleRemoveWishlist = useCallback(async (productId: string) => {
    setRemovingIds(prev => new Set(prev).add(productId));
    try {
      await removeFromWishlist(productId);
      refetch();
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setRemovingIds(prev => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  }, [removeFromWishlist, refetch]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Wishlist
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Track your favorite products
          </p>
        </div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {wishlistItems.length} items
        </div>
      </div>

      {/* Wishlist Table */}
      {wishlistItems.length > 0 ? (
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--background)',
                  }}
                >
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Product
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Current Price
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Price Change
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {wishlistItems.map((product) => {
                  const priceChange = product.originalPrice
                    ? product.currentPrice - product.originalPrice
                    : 0;
                  const priceChangePercent = product.originalPrice
                    ? ((priceChange / product.originalPrice) * 100).toFixed(1)
                    : '0';

                  return (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-opacity-50 transition-colors"
                      style={{ borderColor: 'var(--border)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--background)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded"
                          />
                          <div>
                            <div
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {product.name}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {product.brand} • {product.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          ${product.currentPrice}
                        </div>
                        {product.originalPrice && (
                          <div
                            className="text-xs line-through"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            ${product.originalPrice}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.originalPrice ? (
                          <div
                            className="text-sm font-medium"
                            style={{
                              color: priceChange < 0 ? 'var(--success)' : 'var(--danger)',
                            }}
                          >
                            {priceChange < 0 ? '↓' : '↑'} ${Math.abs(priceChange).toFixed(2)} (
                            {priceChangePercent}%)
                          </div>
                        ) : (
                          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            No change
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/product/${product.id}`}
                            className="text-sm font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
                            style={{ color: 'var(--accent)' }}
                          >
                            View Details
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => handleRemoveWishlist(product.id)}
                            disabled={removingIds.has(product.id)}
                            className="p-1 hover:opacity-70 transition-opacity"
                            style={{ 
                              color: 'var(--danger)',
                              opacity: removingIds.has(product.id) ? 0.5 : 1,
                              cursor: removingIds.has(product.id) ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="rounded-lg border p-12 text-center"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--border)',
          }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Your wishlist is empty
          </h3>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            Start adding products to track their prices
          </p>
          <Link
            to="/search"
            className="inline-block px-6 py-2.5 text-sm rounded-lg font-medium hover:opacity-90 transition-opacity text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
