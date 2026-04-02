import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, Bell, Heart, User, ChevronDown, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUserPanel } from '../context/UserPanelContext';

export function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const { products, profile, logout } = useUserPanel();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-md"
      style={{
        backgroundColor: 'var(--surface-background)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="h-full flex items-center px-6 max-w-screen-2xl mx-auto">
        {/* Left - Logo */}
        <Link to="/" className="flex items-center gap-3 mr-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Price Intelligence
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              AI-Powered
            </div>
          </div>
        </Link>

        {/* Center - Smart Search Bar */}
        <div className="flex-1 max-w-2xl mx-8 relative">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search product, brand, or category…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none text-sm"
              style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Auto-suggest Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl max-h-96 overflow-y-auto"
              style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--border)',
              }}
            >
              {filteredProducts.length > 0 ? (
                <div className="p-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full p-3 flex items-center gap-3 rounded-lg hover:bg-opacity-50 transition-all text-left"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--background)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {product.name}
                        </div>
                        <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                          <span>${product.currentPrice}</span>
                          {product.recommendation === 'BUY' && (
                            <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'var(--success)', color: 'white' }}>
                              Best Deal
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    No products found
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-xl px-3 py-2 hover-lift ripple-effect"
            style={{ backgroundColor: 'var(--background)' }}
            aria-label="Toggle dark mode"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
            ) : (
              <Sun className="w-4 h-4" style={{ color: 'var(--warning)' }} />
            )}
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
              {theme === 'light' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Notifications */}
          <Link
            to="/alerts"
            className="relative p-2.5 rounded-xl hover-lift ripple-effect"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <Bell className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            <span
              className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2"
              style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--card-background)' }}
            ></span>
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative p-2.5 rounded-xl hover-lift ripple-effect"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <Heart className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </Link>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover-lift ripple-effect"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <User className="w-4 h-4 text-white" />
              </div>
              <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
            </button>

            {showProfileMenu && (
              <div
                className="absolute top-full right-0 mt-2 w-56 rounded-xl border shadow-2xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {profile.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {profile.email}
                  </div>
                </div>
                <div className="p-2">
                  <Link
                    to="/"
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-3 py-2 text-sm rounded-lg hover:bg-opacity-50 transition-all"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--background)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/preferences"
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-3 py-2 text-sm rounded-lg hover:bg-opacity-50 transition-all"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--background)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Settings
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-3 py-2 text-sm rounded-lg hover:bg-opacity-50 transition-all"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--background)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    My Profile
                  </Link>
                </div>
                <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={async () => {
                      setShowProfileMenu(false);
                      await logout();
                    }}
                    className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-opacity-50 transition-all"
                    style={{ color: 'var(--danger)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--background)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
