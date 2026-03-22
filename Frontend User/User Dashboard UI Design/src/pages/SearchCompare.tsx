import React, { useState } from 'react';
import { Link } from 'react-router';
import { ArrowUp, ArrowDown, Minus, ExternalLink } from 'lucide-react';
import { Product } from '../data/mockData';
import { useUserPanel } from '../context/UserPanelContext';

export function SearchCompare() {
  const { products } = useUserPanel();
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price') {
      return sortOrder === 'asc'
        ? a.currentPrice - b.currentPrice
        : b.currentPrice - a.currentPrice;
    }
    return sortOrder === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });

  const getPriceTrendIcon = (product: Product) => {
    if (!product.originalPrice) return <Minus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />;
    const change = product.currentPrice - product.originalPrice;
    if (change < 0) return <ArrowDown className="w-4 h-4" style={{ color: 'var(--success)' }} />;
    if (change > 0) return <ArrowUp className="w-4 h-4" style={{ color: 'var(--danger)' }} />;
    return <Minus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Search & Compare
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Compare prices across multiple platforms
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
            className="px-3 py-2 text-sm rounded-lg border outline-none"
            style={{
              backgroundColor: 'var(--card-background)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="name">Product Name</option>
            <option value="price">Price</option>
          </select>
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 text-sm rounded-lg border hover:bg-opacity-50 transition-all"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      </div>

      {/* Results Table */}
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
              <tr className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Lowest Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Price Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => {
                const lowestPlatform = product.platforms.reduce((prev, current) =>
                  prev.price < current.price ? prev : current
                );

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
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {product.name}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {product.brand} • {product.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        ${product.currentPrice}
                      </div>
                      {product.originalPrice && product.originalPrice > product.currentPrice && (
                        <div className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                          ${product.originalPrice}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {lowestPlatform.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPriceTrendIcon(product)}
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {!product.originalPrice
                            ? 'No change'
                            : product.currentPrice < product.originalPrice
                            ? 'Decreased'
                            : product.currentPrice > product.originalPrice
                            ? 'Increased'
                            : 'Stable'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/product/${product.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--accent)' }}
                      >
                        View Details
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
