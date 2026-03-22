import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, TrendingDown, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface AIDecisionPanelProps {
  recommendation: 'BUY' | 'WAIT';
  confidence: number;
  product: {
    name: string;
    currentPrice: number;
    lowestPrice: number;
    highestPrice: number;
  };
}

export function AIDecisionPanel({ recommendation, confidence, product }: AIDecisionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getBadgeStyle = () => {
    if (recommendation === 'BUY') {
      return {
        background: 'var(--gradient-success)',
        color: 'white',
      };
    }
    return {
      background: 'var(--gradient-warning)',
      color: 'white',
    };
  };

  const getReasonText = () => {
    if (recommendation === 'BUY') {
      return 'Price dropped twice in the last 10 days. Historical data suggests this is a good time to buy.';
    }
    return 'Price may drop further in the next 2 weeks based on seasonal patterns. Consider waiting.';
  };

  const aiFactors = [
    {
      icon: TrendingDown,
      label: 'Price Trend',
      value: recommendation === 'BUY' ? 'Declining' : 'Stable',
      positive: recommendation === 'BUY',
    },
    {
      icon: Calendar,
      label: 'Historical Pattern',
      value: recommendation === 'BUY' ? 'Favorable' : 'Wait Period',
      positive: recommendation === 'BUY',
    },
    {
      icon: DollarSign,
      label: 'Current vs Lowest',
      value: `${(((product.currentPrice - product.lowestPrice) / product.lowestPrice) * 100).toFixed(1)}% above`,
      positive: product.currentPrice <= product.lowestPrice * 1.05,
    },
  ];

  return (
    <div
      className="sticky top-20 rounded-2xl border-2 overflow-hidden ai-glow"
      style={{
        backgroundColor: 'var(--white)',
        borderColor: recommendation === 'BUY' ? 'var(--success)' : 'var(--warning)',
      }}
    >
      {/* Header */}
      <div className="p-6" style={{ background: getBadgeStyle().background }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="font-semibold text-white">AI Decision Support</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="text-center mb-4">
          <div className="inline-block px-8 py-4 rounded-2xl mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <div className="text-4xl font-bold text-white mb-1">{recommendation}</div>
            <div className="text-sm text-white opacity-90">Recommendation</div>
          </div>
        </div>

        {/* Confidence Circle */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(confidence / 100) * 352} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{confidence}%</div>
                <div className="text-xs text-white opacity-90">Confidence</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation Section */}
      <div className="p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-4 hover:opacity-70 transition-opacity"
        >
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Why this recommendation?
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          )}
        </button>

        {isExpanded && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {getReasonText()}
            </p>

            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                AI Analysis Factors
              </div>
              {aiFactors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  <div className="flex items-center gap-2">
                    <factor.icon className="w-4 h-4" style={{ color: factor.positive ? 'var(--success)' : 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {factor.label}
                    </span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: factor.positive ? 'var(--success)' : 'var(--text-muted)' }}>
                    {factor.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <p className="mb-2">
                  <strong>AI Transparency:</strong> This recommendation is based on:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>30 days of price history data</li>
                  <li>Seasonal pattern analysis</li>
                  <li>Market demand indicators</li>
                  <li>Platform inventory levels</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
