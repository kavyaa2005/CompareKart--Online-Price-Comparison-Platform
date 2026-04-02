"""
Generate ML Model Evaluation Graphs for PPT/Review
Produces: Confusion Matrix (binned), Bar Graph, Line Graph, Heatmap
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from data_preprocessing import preprocess_data
import joblib

# ── Setup ──────────────────────────────────────────────
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'graphs')
os.makedirs(OUTPUT_DIR, exist_ok=True)

COLORS = {
    'bg': '#0a0e1a',
    'card': '#111827',
    'text': '#f8fafc',
    'muted': '#94a3b8',
    'blue': '#3b82f6',
    'purple': '#8b5cf6',
    'green': '#22c55e',
    'red': '#ef4444',
    'orange': '#f97316',
    'cyan': '#06b6d4',
    'grid': '#1e293b',
}

plt.rcParams.update({
    'figure.facecolor': COLORS['bg'],
    'axes.facecolor': COLORS['card'],
    'axes.edgecolor': COLORS['grid'],
    'axes.labelcolor': COLORS['text'],
    'xtick.color': COLORS['muted'],
    'ytick.color': COLORS['muted'],
    'text.color': COLORS['text'],
    'font.family': 'sans-serif',
    'font.size': 11,
    'grid.color': COLORS['grid'],
    'grid.alpha': 0.5,
})

# ── Load Model & Data ──────────────────────────────────
print("Loading model and data...")
model = joblib.load('models/price_predictor.pkl')

df, X, y, preprocessor = preprocess_data('data/ecommerce_prices.csv')
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)

test_r2 = r2_score(y_test, y_test_pred)
test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
test_mae = mean_absolute_error(y_test, y_test_pred)
train_r2 = r2_score(y_train, y_train_pred)
train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
train_mae = mean_absolute_error(y_train, y_train_pred)

print(f"Test R²: {test_r2:.4f}, RMSE: {test_rmse:.2f}, MAE: {test_mae:.2f}")
print(f"Train R²: {train_r2:.4f}, RMSE: {train_rmse:.2f}, MAE: {train_mae:.2f}")


# ══════════════════════════════════════════════════════════
# GRAPH 1: CONFUSION MATRIX (Binned Price Ranges)
# ══════════════════════════════════════════════════════════
print("\n1. Generating Confusion Matrix (Binned)...")

price_bins = [0, 200, 500, 1000, 2000, 5000, 12000]
price_labels = ['₹0-200', '₹200-500', '₹500-1K', '₹1K-2K', '₹2K-5K', '₹5K-12K']

y_test_binned = pd.cut(y_test, bins=price_bins, labels=price_labels)
y_pred_binned = pd.cut(y_test_pred, bins=price_bins, labels=price_labels)

# Build confusion matrix manually
n_labels = len(price_labels)
cm = np.zeros((n_labels, n_labels), dtype=int)
for actual, predicted in zip(y_test_binned, y_pred_binned):
    if pd.notna(actual) and pd.notna(predicted):
        i = price_labels.index(actual)
        j = price_labels.index(predicted)
        cm[i][j] += 1

fig, ax = plt.subplots(figsize=(10, 8))
im = ax.imshow(cm, interpolation='nearest', cmap='Blues')
cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
cbar.ax.yaxis.set_tick_params(color=COLORS['muted'])
cbar.outline.set_edgecolor(COLORS['grid'])
plt.setp(plt.getp(cbar.ax.axes, 'yticklabels'), color=COLORS['muted'])

ax.set_xticks(range(n_labels))
ax.set_yticks(range(n_labels))
ax.set_xticklabels(price_labels, rotation=45, ha='right', fontsize=10)
ax.set_yticklabels(price_labels, fontsize=10)
ax.set_xlabel('Predicted Price Range', fontsize=13, fontweight='bold', labelpad=10)
ax.set_ylabel('Actual Price Range', fontsize=13, fontweight='bold', labelpad=10)
ax.set_title('Confusion Matrix — Price Range Classification', fontsize=15, fontweight='bold', pad=15, color=COLORS['text'])

# Annotate cells
thresh = cm.max() / 2
for i in range(n_labels):
    for j in range(n_labels):
        color = COLORS['bg'] if cm[i, j] > thresh else COLORS['text']
        ax.text(j, i, f'{cm[i, j]}', ha='center', va='center', fontsize=12, fontweight='bold', color=color)

# Accuracy on diagonal
total = cm.sum()
correct = np.trace(cm)
accuracy = (correct / total) * 100 if total > 0 else 0
ax.text(0.5, -0.18, f'Binned Classification Accuracy: {accuracy:.1f}%', 
        transform=ax.transAxes, ha='center', fontsize=12, color=COLORS['green'], fontweight='bold')

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, '1_confusion_matrix.png'), dpi=200, bbox_inches='tight')
plt.close()
print(f"   ✓ Saved (Accuracy: {accuracy:.1f}%)")


# ══════════════════════════════════════════════════════════
# GRAPH 2: BAR GRAPH — Feature Importance
# ══════════════════════════════════════════════════════════
print("2. Generating Bar Graph (Feature Importance)...")

feature_names = ['Product ID', 'Platform ID', 'Day of Month', 'Month', 'Discount', 'Rating']
importances = model.feature_importances_ * 100

sorted_idx = np.argsort(importances)
sorted_names = [feature_names[i] for i in sorted_idx]
sorted_importance = importances[sorted_idx]

fig, ax = plt.subplots(figsize=(10, 6))
bars = ax.barh(range(len(sorted_names)), sorted_importance, height=0.6,
               color=[COLORS['blue'] if v < 50 else COLORS['green'] for v in sorted_importance],
               edgecolor='none', alpha=0.9)

for i, (bar, val) in enumerate(zip(bars, sorted_importance)):
    ax.text(val + 0.5, i, f'{val:.2f}%', va='center', fontsize=11, fontweight='bold', color=COLORS['text'])

ax.set_yticks(range(len(sorted_names)))
ax.set_yticklabels(sorted_names, fontsize=11)
ax.set_xlabel('Importance (%)', fontsize=13, fontweight='bold')
ax.set_title('Feature Importance — Random Forest Regressor', fontsize=15, fontweight='bold', pad=15)
ax.set_xlim(0, max(sorted_importance) * 1.15)
ax.grid(axis='x', alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, '2_feature_importance_bar.png'), dpi=200, bbox_inches='tight')
plt.close()
print("   ✓ Saved")


# ══════════════════════════════════════════════════════════
# GRAPH 3: BAR GRAPH — Train vs Test Metrics Comparison
# ══════════════════════════════════════════════════════════
print("3. Generating Bar Graph (Train vs Test Metrics)...")

fig, axes = plt.subplots(1, 3, figsize=(14, 5))

metrics_data = [
    ('R² Score', train_r2, test_r2, ''),
    ('RMSE', train_rmse, test_rmse, '₹'),
    ('MAE', train_mae, test_mae, '₹'),
]

bar_colors = [COLORS['blue'], COLORS['purple']]

for ax, (metric_name, train_val, test_val, prefix) in zip(axes, metrics_data):
    x = np.array([0, 1])
    bars = ax.bar(x, [train_val, test_val], width=0.5, color=bar_colors, edgecolor='none', alpha=0.9)
    ax.set_xticks(x)
    ax.set_xticklabels(['Train', 'Test'], fontsize=12, fontweight='bold')
    ax.set_title(metric_name, fontsize=14, fontweight='bold', pad=10)
    
    for bar, val in zip(bars, [train_val, test_val]):
        label = f'{prefix}{val:.2f}' if prefix else f'{val:.4f}'
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + bar.get_height()*0.02,
                label, ha='center', fontsize=11, fontweight='bold', color=COLORS['text'])
    
    ax.grid(axis='y', alpha=0.3)
    ax.set_ylim(0, max(train_val, test_val) * 1.18)

fig.suptitle('Model Performance — Training vs Testing', fontsize=16, fontweight='bold', y=1.02, color=COLORS['text'])
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, '3_train_vs_test_bar.png'), dpi=200, bbox_inches='tight')
plt.close()
print("   ✓ Saved")


# ══════════════════════════════════════════════════════════
# GRAPH 4: LINE GRAPH — Actual vs Predicted Prices
# ══════════════════════════════════════════════════════════
print("4. Generating Line Graph (Actual vs Predicted)...")

# Take a sample of 200 points sorted by actual price for clear visualization
sample_size = 200
rng = np.random.RandomState(42)
sample_idx = rng.choice(len(y_test), size=sample_size, replace=False)
y_test_arr = np.array(y_test)
sample_actual = y_test_arr[sample_idx]
sample_pred = y_test_pred[sample_idx]

sort_order = np.argsort(sample_actual)
sample_actual = sample_actual[sort_order]
sample_pred = sample_pred[sort_order]

fig, ax = plt.subplots(figsize=(14, 6))
x_range = range(len(sample_actual))

ax.plot(x_range, sample_actual, color=COLORS['blue'], linewidth=1.5, label='Actual Price', alpha=0.9)
ax.plot(x_range, sample_pred, color=COLORS['green'], linewidth=1.5, label='Predicted Price', alpha=0.8, linestyle='--')

ax.fill_between(x_range, sample_actual, sample_pred, alpha=0.15, color=COLORS['purple'])

ax.set_xlabel('Sample Index (sorted by actual price)', fontsize=12, fontweight='bold')
ax.set_ylabel('Price (₹)', fontsize=12, fontweight='bold')
ax.set_title('Actual vs Predicted Prices — Random Forest Model', fontsize=15, fontweight='bold', pad=15)
ax.legend(fontsize=11, loc='upper left', facecolor=COLORS['card'], edgecolor=COLORS['grid'], labelcolor=COLORS['text'])
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'₹{x:,.0f}'))
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, '4_actual_vs_predicted_line.png'), dpi=200, bbox_inches='tight')
plt.close()
print("   ✓ Saved")


# ══════════════════════════════════════════════════════════
# GRAPH 5: LINE GRAPH — Price Trend Over Time (Top 5 Products)
# ══════════════════════════════════════════════════════════
print("5. Generating Line Graph (Price Trends)...")

raw_df = pd.read_csv('data/ecommerce_prices.csv')
raw_df['date'] = pd.to_datetime(raw_df['date'])

# Get top 5 products by avg price (interesting ones)
top_products = raw_df.groupby('product_name')['price'].mean().nlargest(5).index.tolist()

fig, ax = plt.subplots(figsize=(14, 6))
line_colors = [COLORS['blue'], COLORS['green'], COLORS['purple'], COLORS['orange'], COLORS['cyan']]

for product, color in zip(top_products, line_colors):
    prod_data = raw_df[raw_df['product_name'] == product].groupby('date')['price'].mean().reset_index()
    prod_data = prod_data.sort_values('date')
    ax.plot(prod_data['date'], prod_data['price'], linewidth=2, label=product, color=color, alpha=0.9)

ax.set_xlabel('Date', fontsize=12, fontweight='bold')
ax.set_ylabel('Average Price (₹)', fontsize=12, fontweight='bold')
ax.set_title('Price Trends Over Time — Top 5 Products', fontsize=15, fontweight='bold', pad=15)
ax.legend(fontsize=9, loc='upper right', facecolor=COLORS['card'], edgecolor=COLORS['grid'], labelcolor=COLORS['text'])
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'₹{x:,.0f}'))
ax.grid(True, alpha=0.3)
fig.autofmt_xdate()

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, '5_price_trends_line.png'), dpi=200, bbox_inches='tight')
plt.close()
print("   ✓ Saved")


# ══════════════════════════════════════════════════════════
# GRAPH 6: HEATMAP — Average Price by Product × Platform
# ══════════════════════════════════════════════════════════
print("6. Generating Heatmap (Product × Platform)...")

# Pick top 15 products for readability
top15 = raw_df.groupby('product_name')['price'].mean().nlargest(15).index.tolist()
heatmap_df = raw_df[raw_df['product_name'].isin(top15)]
pivot = heatmap_df.pivot_table(values='price', index='product_name', columns='platform', aggfunc='mean')
pivot = pivot.reindex(top15)  # preserve sorted order

fig, ax = plt.subplots(figsize=(12, 9))
im = ax.imshow(pivot.values, cmap='YlOrRd', aspect='auto')
cbar = plt.colorbar(im, ax=ax, fraction=0.03, pad=0.04)
cbar.set_label('Average Price (₹)', fontsize=11, color=COLORS['text'])
cbar.ax.yaxis.set_tick_params(color=COLORS['muted'])
cbar.outline.set_edgecolor(COLORS['grid'])
plt.setp(plt.getp(cbar.ax.axes, 'yticklabels'), color=COLORS['muted'])

ax.set_xticks(range(len(pivot.columns)))
ax.set_yticks(range(len(pivot.index)))
ax.set_xticklabels(pivot.columns, fontsize=11, fontweight='bold')
ax.set_yticklabels(pivot.index, fontsize=10)
ax.set_xlabel('Platform', fontsize=13, fontweight='bold', labelpad=10)
ax.set_ylabel('Product', fontsize=13, fontweight='bold', labelpad=10)
ax.set_title('Average Price Heatmap — Top 15 Products Across Platforms', fontsize=15, fontweight='bold', pad=15)

# Annotate cells
for i in range(len(pivot.index)):
    for j in range(len(pivot.columns)):
        val = pivot.values[i, j]
        if not np.isnan(val):
            text_color = 'white' if val > pivot.values[~np.isnan(pivot.values)].mean() else 'black'
            ax.text(j, i, f'₹{val:,.0f}', ha='center', va='center', fontsize=8, fontweight='bold', color=text_color)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, '6_price_heatmap.png'), dpi=200, bbox_inches='tight')
plt.close()
print("   ✓ Saved")


# ══════════════════════════════════════════════════════════
# GRAPH 7: SCATTER PLOT — Actual vs Predicted (with R² line)
# ══════════════════════════════════════════════════════════
print("7. Generating Scatter Plot (Actual vs Predicted)...")

fig, ax = plt.subplots(figsize=(9, 9))

# Sample for performance
sample_size2 = 3000
y_test_arr2 = np.array(y_test)
idx2 = rng.choice(len(y_test_arr2), size=min(sample_size2, len(y_test_arr2)), replace=False)

ax.scatter(y_test_arr[idx2], y_test_pred[idx2], alpha=0.3, s=10, color=COLORS['blue'], edgecolors='none')

# Perfect prediction line
max_val = max(np.max(y_test), np.max(y_test_pred))
ax.plot([0, max_val], [0, max_val], color=COLORS['red'], linewidth=2, linestyle='--', label='Perfect Prediction', alpha=0.8)

ax.set_xlabel('Actual Price (₹)', fontsize=13, fontweight='bold')
ax.set_ylabel('Predicted Price (₹)', fontsize=13, fontweight='bold')
ax.set_title(f'Actual vs Predicted — R² = {test_r2:.4f}', fontsize=15, fontweight='bold', pad=15)
ax.legend(fontsize=11, facecolor=COLORS['card'], edgecolor=COLORS['grid'], labelcolor=COLORS['text'])
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'₹{x:,.0f}'))
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'₹{x:,.0f}'))
ax.set_aspect('equal')
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, '7_scatter_actual_vs_predicted.png'), dpi=200, bbox_inches='tight')
plt.close()
print("   ✓ Saved")


# ══════════════════════════════════════════════════════════
# GRAPH 8: HEATMAP — Correlation Matrix
# ══════════════════════════════════════════════════════════
print("8. Generating Heatmap (Feature Correlation)...")

feature_names_short = ['product_id', 'platform_id', 'day', 'month', 'discount', 'rating']
feature_df = pd.DataFrame(X, columns=feature_names_short)
feature_df['price'] = np.array(y)

corr = feature_df.corr()

fig, ax = plt.subplots(figsize=(9, 8))
im = ax.imshow(corr.values, cmap='coolwarm', vmin=-1, vmax=1, aspect='auto')
cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
cbar.set_label('Correlation', fontsize=11, color=COLORS['text'])
cbar.ax.yaxis.set_tick_params(color=COLORS['muted'])
cbar.outline.set_edgecolor(COLORS['grid'])
plt.setp(plt.getp(cbar.ax.axes, 'yticklabels'), color=COLORS['muted'])

labels = ['Product ID', 'Platform ID', 'Day', 'Month', 'Discount', 'Rating', 'Price']
ax.set_xticks(range(len(labels)))
ax.set_yticks(range(len(labels)))
ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=10)
ax.set_yticklabels(labels, fontsize=10)
ax.set_title('Feature Correlation Heatmap', fontsize=15, fontweight='bold', pad=15)

# Annotate
for i in range(len(labels)):
    for j in range(len(labels)):
        val = corr.values[i, j]
        color = 'white' if abs(val) > 0.5 else COLORS['text']
        ax.text(j, i, f'{val:.2f}', ha='center', va='center', fontsize=10, fontweight='bold', color=color)

plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, '8_correlation_heatmap.png'), dpi=200, bbox_inches='tight')
plt.close()
print("   ✓ Saved")


# ── Summary ────────────────────────────────────────────
print("\n" + "="*50)
print("ALL 8 GRAPHS GENERATED SUCCESSFULLY!")
print(f"Saved to: {os.path.abspath(OUTPUT_DIR)}")
print("="*50)
print("\nFiles:")
for f in sorted(os.listdir(OUTPUT_DIR)):
    if f.endswith('.png'):
        size = os.path.getsize(os.path.join(OUTPUT_DIR, f)) / 1024
        print(f"  • {f}  ({size:.0f} KB)")
