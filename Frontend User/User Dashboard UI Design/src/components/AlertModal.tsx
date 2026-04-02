import React, { useState } from 'react';
import { X, Bell, Sparkles } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  currentPrice: number;
  onSetAlert: (targetPrice: number, enableAI: boolean, platforms: string[]) => void;
}

export function AlertModal({ isOpen, onClose, productName, currentPrice, onSetAlert }: AlertModalProps) {
  const [targetPrice, setTargetPrice] = useState(currentPrice * 0.9);
  const [enableAI, setEnableAI] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Amazon', 'Best Buy']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetAlert(targetPrice, enableAI, selectedPlatforms);
    onClose();
  };

  const platforms = ['Amazon', 'Best Buy', 'Walmart', 'Target'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl"
        style={{ backgroundColor: 'var(--white)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Set Price Alert
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {productName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-opacity-50 transition-all"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Target Price Slider */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Target Price
            </label>
            <div className="text-center mb-4">
              <span className="text-4xl font-bold" style={{ color: 'var(--secondary)' }}>
                ${targetPrice.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={currentPrice * 0.5}
              max={currentPrice}
              step={0.01}
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--secondary) 0%, var(--secondary) ${((targetPrice - currentPrice * 0.5) / (currentPrice * 0.5)) * 100}%, var(--border) ${((targetPrice - currentPrice * 0.5) / (currentPrice * 0.5)) * 100}%, var(--border) 100%)`,
                accentColor: 'var(--secondary)',
              }}
            />
            <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              <span>${(currentPrice * 0.5).toFixed(2)}</span>
              <span>Current: ${currentPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* AI Prediction Toggle */}
          <div
            className="mb-6 p-4 rounded-xl border-2"
            style={{
              backgroundColor: enableAI ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
              borderColor: enableAI ? 'var(--secondary)' : 'var(--border)',
            }}
          >
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" style={{ color: 'var(--secondary)' }} />
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Enable AI Prediction
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Get notified when AI predicts a price drop
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableAI}
                onChange={(e) => setEnableAI(e.target.checked)}
                className="w-5 h-5 rounded cursor-pointer"
                style={{ accentColor: 'var(--secondary)' }}
              />
            </label>
          </div>

          {/* Platform Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Monitor Platforms
            </label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => {
                    setSelectedPlatforms((prev) =>
                      prev.includes(platform)
                        ? prev.filter((p) => p !== platform)
                        : [...prev, platform]
                    );
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: selectedPlatforms.includes(platform)
                      ? 'var(--secondary)'
                      : 'var(--background)',
                    color: selectedPlatforms.includes(platform) ? 'white' : 'var(--text-primary)',
                    border: `1px solid ${selectedPlatforms.includes(platform) ? 'var(--secondary)' : 'var(--border)'}`,
                  }}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-all"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--text-primary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl font-medium text-white ripple-effect hover-lift"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Set Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
