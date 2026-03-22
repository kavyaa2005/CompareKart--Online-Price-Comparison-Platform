import React from 'react';
import { Shield, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';

interface TrustPanelProps {
  reviewCount: number;
  positivePercentage: number;
  pros: string[];
  cons: string[];
  trustScore: number;
}

export function TrustPanel({ reviewCount, positivePercentage, pros, cons, trustScore }: TrustPanelProps) {
  const getTrustColor = () => {
    if (trustScore >= 80) return 'var(--success)';
    if (trustScore >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="rounded-xl border" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border)' }}>
      {/* Trust Score Header */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${getTrustColor()}15` }}
            >
              <Shield className="w-6 h-6" style={{ color: getTrustColor() }} />
            </div>
            <div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Trust Score
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Based on {reviewCount} reviews
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: getTrustColor() }}>
              {trustScore}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              out of 100
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Bar */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Review Sentiment
        </div>
        <div className="flex gap-2 mb-2">
          <div
            className="h-3 rounded-full transition-all"
            style={{
              backgroundColor: 'var(--success)',
              width: `${positivePercentage}%`,
            }}
          />
          <div
            className="h-3 rounded-full transition-all"
            style={{
              backgroundColor: 'var(--danger)',
              width: `${100 - positivePercentage}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{positivePercentage}% Positive</span>
          <span>{100 - positivePercentage}% Negative</span>
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Pros */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp className="w-4 h-4" style={{ color: 'var(--success)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Pros
              </span>
            </div>
            <ul className="space-y-2">
              {pros.map((pro, index) => (
                <li key={index} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ThumbsDown className="w-4 h-4" style={{ color: 'var(--danger)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Cons
              </span>
            </div>
            <ul className="space-y-2">
              {cons.map((con, index) => (
                <li key={index} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Warning */}
        {trustScore < 70 && (
          <div
            className="mt-4 p-3 rounded-lg flex items-start gap-2"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
            <p className="text-xs" style={{ color: 'var(--danger)' }}>
              This product has mixed reviews. Please read user feedback carefully before purchasing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
