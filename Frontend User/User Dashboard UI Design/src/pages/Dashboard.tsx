import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, TrendingDown, Sparkles, Target, ArrowRight, Zap, TrendingUp, Clock } from 'lucide-react';
import { useUserPanel } from '../context/UserPanelContext';
import { useUserDashboard, useUserRecommendations } from '../hooks/useUserApi';

export function Dashboard() {
  const navigate = useNavigate();
  const { products, profile } = useUserPanel();
  
  // Real API data
  const { data: dashboardData, loading: dashLoading, error: dashError } = useUserDashboard();
  const { data: recommendationsData } = useUserRecommendations();
  
  const [heroSearch, setHeroSearch] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const bestDealProduct = products.find((p) => p.recommendation === 'BUY') || products[0];
  const aiRecommendations = recommendationsData?.recommendations?.slice(0, 3) || 
                            products.filter((p) => p.recommendation === 'BUY').slice(0, 3);
  const predictedDrops = products.filter((p) => p.recommendation === 'WAIT').slice(0, 3);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [currentTime]);

  const liveStats = useMemo(() => {
    // Use real dashboard data if available, otherwise calculate from products
    const trackedCount = dashboardData?.totalAlerts || products.length;
    const buyNowCount = dashboardData?.activeAlerts || products.filter((product) => product.recommendation === 'BUY').length;
    const totalSavings = products.reduce((sum, product) => {
      if (!product.originalPrice) return sum;
      return sum + Math.max(product.originalPrice - product.currentPrice, 0);
    }, 0);

    return {
      trackedCount,
      buyNowCount,
      totalSavings: Math.round(totalSavings),
    };
  }, [products, dashboardData]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate('/search');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 50%, #06B6D4 100%)',
        }}
      >
        {/* Abstract Geometric Shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full" style={{ background: 'white' }}></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full" style={{ background: 'white' }}></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 rotate-45" style={{ background: 'white' }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-8 py-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)' }}>
            <Clock className="w-3.5 h-3.5" />
            {greeting}, {profile.name || 'Shopper'} • {currentTime.toLocaleTimeString()}
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Compare prices intelligently.
            <br />
            Buy at the right time.
          </h1>
          <p className="text-xl text-white opacity-90 mb-8">
            AI-powered insights to help you make smarter purchasing decisions
          </p>

          {/* Large Search Bar */}
          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search for any product to compare prices..."
                className="w-full pl-16 pr-6 py-5 rounded-2xl text-lg shadow-2xl outline-none"
                style={{
                  backgroundColor: 'white',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </form>

          {/* Category Chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Electronics', 'Fashion', 'Home', 'Books', 'Sports'].map((category) => (
              <button
                key={category}
                onClick={() => navigate('/search')}
                className="px-4 py-2 rounded-full text-sm font-medium text-white border-2 border-white border-opacity-30 hover:bg-white hover:bg-opacity-20 transition-all ripple-effect"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Best Deal Today */}
          <Link
            to={`/product/${bestDealProduct?.id}`}
            className="rounded-2xl p-6 hover-lift cursor-pointer overflow-hidden relative"
            style={{
              background: 'var(--gradient-success)',
              color: 'white',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', transform: 'translate(30%, -30%)' }}></div>
            <TrendingDown className="w-8 h-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Best Deal Today</h3>
            <div className="text-3xl font-bold mb-2">${bestDealProduct?.currentPrice}</div>
            <p className="text-sm opacity-90 mb-4">{bestDealProduct?.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">View Details</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* AI Recommendation */}
          <Link
            to="/recommendations"
            className="rounded-2xl p-6 hover-lift cursor-pointer overflow-hidden relative ai-glow"
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', transform: 'translate(30%, -30%)' }}></div>
            <Sparkles className="w-8 h-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Buy Recommendations</h3>
            <div className="text-3xl font-bold mb-2">{aiRecommendations.length}</div>
            <p className="text-sm opacity-90 mb-4">Products ready to buy now</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">Explore AI Insights</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Predicted Drops */}
          <Link
            to="/price-history"
            className="rounded-2xl p-6 hover-lift cursor-pointer overflow-hidden relative"
            style={{
              background: 'var(--gradient-warning)',
              color: 'white',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', transform: 'translate(30%, -30%)' }}></div>
            <Target className="w-8 h-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Predicted Price Drops</h3>
            <div className="text-3xl font-bold mb-2">{predictedDrops.length}</div>
            <p className="text-sm opacity-90 mb-4">Products likely to drop soon</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">View Predictions</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-12">
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Products Tracked</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {liveStats.trackedCount}
            </p>
          </div>
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Buy-Now Signals</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--success)' }}>
              {liveStats.buyNowCount}
            </p>
          </div>
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Potential Savings</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--primary)' }}>
              ${liveStats.totalSavings}
            </p>
          </div>
        </div>

        {/* Trending Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Trending Products
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Most searched products this week
              </p>
            </div>
            <Link
              to="/search"
              className="text-sm font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--secondary)' }}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.slice(0, 3).map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="rounded-xl border overflow-hidden hover-lift"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--border)',
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="font-semibold mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                      ${product.currentPrice}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  {product.recommendation === 'BUY' && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                      <Zap className="w-4 h-4" style={{ color: 'var(--success)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>
                        Best time to buy
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
          <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Your Recent Activity
            </h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 hover:bg-opacity-50 transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--background)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(100, 116, 139, 0.1)' }}>
                    <Clock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {activity.activity}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              [
                { icon: TrendingDown, text: 'Price dropped on Sony WH-1000XM5', time: '2 hours ago', color: 'var(--success)' },
                { icon: Sparkles, text: 'AI suggests buying MacBook Air M2', time: '5 hours ago', color: 'var(--secondary)' },
                { icon: Clock, text: 'Price alert set for Samsung Galaxy S24', time: '1 day ago', color: 'var(--warning)' },
                { icon: TrendingUp, text: 'Dyson V15 added to wishlist', time: '2 days ago', color: 'var(--text-muted)' },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 hover:bg-opacity-50 transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--background)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${activity.color}15` }}>
                    <activity.icon className="w-5 h-5" style={{ color: activity.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {activity.text}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
