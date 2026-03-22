# Testing & Validation Guide

## Overview
This document provides comprehensive testing instructions for the E-commerce Price Comparison Backend system.

---

## Pre-Test Checklist

- [ ] Python 3.8+ installed
- [ ] Working directory: `c:\Users\fsarg\OneDrive\Desktop\MINI-PROJECT`
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Git/version control (optional)

---

## Test 1: Automated Setup Validation

The easiest way to validate the entire system.

### Command
```bash
cd c:\Users\fsarg\OneDrive\Desktop\MINI-PROJECT
python setup.py
```

### Expected Output
```
======================================================================
  E-COMMERCE PRICE COMPARISON BACKEND
======================================================================
Complete Setup & Validation Pipeline

======================================================================
  GENERATING SYNTHETIC DATASET
======================================================================

[1] GENERATING SYNTHETIC DATASET
----------------------------------------------------------------------
✓ Synthetic dataset generated: data/ecommerce_prices.csv
  Total records: 6552
  Products: 18
  Platforms: 2
  Date range: 2025-08-01 to 2026-02-01

Dataset preview:
...

======================================================================
  DATA PREPROCESSING PIPELINE
======================================================================

[2] PREPROCESSING DATA
----------------------------------------------------------------------
✓ Data loaded: 6552 records
✓ No missing values found
✓ Data sorted by date
✓ Features created successfully

======================================================================
MODEL TRAINING PIPELINE
======================================================================

[3] TRAINING MACHINE LEARNING MODEL
----------------------------------------------------------------------
1. Preprocessing data...
✓ Data loaded: 6552 records
...

[RESULTS]
✓ All local API tests passed!

======================================================================
  SETUP & VALIDATION SUMMARY
======================================================================
[1] Dataset Generation                ✓ PASSED
[2] Data Preprocessing                ✓ PASSED
[3] ML Model Training                 ✓ PASSED
[4] API Testing                       ✓ PASSED

======================================================================
  ✓ ALL TESTS PASSED - SYSTEM READY FOR DEPLOYMENT
======================================================================
```

**Success Criteria:**
- All 4 tests show ✓ PASSED
- Execution time: 1-2 minutes
- No error messages

---

## Test 2: Unit Tests - Dataset Generation

### File Location
`src/dataset_generator.py`

### Test Command
```bash
cd src
python dataset_generator.py
```

### What to Verify
1. **File Created:** `data/ecommerce_prices.csv` exists
2. **Record Count:** 6,552 records (18 products × 2 platforms × 182 days)
3. **Columns:** product_name, platform, date, price, discount, rating
4. **Data Types:**
   - product_name: string
   - platform: string (Amazon/Flipkart)
   - date: datetime
   - price: float (200-8000)
   - discount: float (5-50)
   - rating: float (3.0-5.0)

### Python Validation Script
```python
import pandas as pd

df = pd.read_csv('data/ecommerce_prices.csv')

# Test 1: Shape
assert df.shape[0] == 6552, "Should have 6552 records"
print(f"✓ Record count: {len(df)}")

# Test 2: Columns
expected_cols = ['product_name', 'platform', 'date', 'price', 'discount', 'rating']
assert list(df.columns) == expected_cols, "Column names mismatch"
print("✓ Columns correct")

# Test 3: Products
assert len(df['product_name'].unique()) == 18, "Should have 18 products"
print(f"✓ Product count: {len(df['product_name'].unique())}")

# Test 4: Platforms
assert set(df['platform'].unique()) == {'Amazon', 'Flipkart'}, "Platform names incorrect"
print("✓ Platforms: Amazon, Flipkart")

# Test 5: Price range
assert df['price'].min() >= 150 and df['price'].max() <= 8500, "Price range incorrect"
print(f"✓ Price range: ₹{df['price'].min():.0f} - ₹{df['price'].max():.0f}")

# Test 6: Discount range
assert df['discount'].min() >= 0 and df['discount'].max() <= 51, "Discount range incorrect"
print(f"✓ Discount range: {df['discount'].min():.1f}% - {df['discount'].max():.1f}%")

# Test 7: Rating range
assert df['rating'].min() >= 2.9 and df['rating'].max() <= 5.1, "Rating range incorrect"
print(f"✓ Rating range: {df['rating'].min():.1f} - {df['rating'].max():.1f}")

# Test 8: Date range
assert (df['date'].max() - df['date'].min()).days == 181, "Should span 182 days"
print("✓ Date range: 182 days (6 months)")

print("\n✓ ALL DATASET TESTS PASSED!")
```

---

## Test 3: Unit Tests - Data Preprocessing

### File Location
`src/data_preprocessing.py`

### Test Command
```bash
cd src
python data_preprocessing.py
```

### What to Verify
1. **Data Loading:** CSV loaded correctly
2. **Missing Values:** No null values after processing
3. **Sorting:** Data sorted by date
4. **Feature Creation:** 6 features created
5. **Encoding:** Categories encoded to integers

### Python Validation Script
```python
from data_preprocessing import preprocess_data
import numpy as np

df, X, y, preprocessor = preprocess_data('data/ecommerce_prices.csv')

# Test 1: Data shape
assert df.shape[0] == 6552, "Data shape incorrect"
print(f"✓ Data shape: {df.shape}")

# Test 2: No missing values
assert df.isnull().sum().sum() == 0, "Missing values found"
print("✓ No missing values")

# Test 3: Features shape
assert X.shape == (6552, 6), "Feature matrix shape incorrect"
print(f"✓ Feature matrix shape: {X.shape}")

# Test 4: Target shape
assert y.shape == (6552,), "Target shape incorrect"
print(f"✓ Target shape: {y.shape}")

# Test 5: Encoding valid
assert X[:, 0].min() >= 0 and X[:, 0].max() <= 17, "Product ID encoding invalid"
print("✓ Product IDs encoded (0-17)")

assert X[:, 1].min() >= 0 and X[:, 1].max() <= 1, "Platform ID encoding invalid"
print("✓ Platform IDs encoded (0-1)")

# Test 6: Feature ranges
assert X[:, 2].min() >= 0 and X[:, 2].max() <= 31, "Day of month invalid"
assert X[:, 3].min() >= 1 and X[:, 3].max() <= 12, "Month invalid"
assert X[:, 4].min() >= 0 and X[:, 4].max() <= 51, "Discount invalid"
assert X[:, 5].min() >= 2.9 and X[:, 5].max() <= 5.1, "Rating invalid"
print("✓ Feature ranges valid")

# Test 7: Preprocessor encodings
assert len(preprocessor.product_encodings) == 18, "Product encodings count wrong"
assert len(preprocessor.platform_encodings) == 2, "Platform encodings count wrong"
print("✓ Encoding dictionaries created")

print("\n✓ ALL PREPROCESSING TESTS PASSED!")
```

---

## Test 4: Unit Tests - Model Training

### File Location
`src/model_trainer.py`

### Test Command
```bash
cd src
python model_trainer.py
```

### What to Verify
1. **Model Saved:** `models/price_predictor.pkl` exists (~2 MB)
2. **R² Score:** Test R² ≥ 0.90
3. **RMSE:** Test RMSE ≤ 200
4. **Predictions:** Model can make predictions

### Python Validation Script
```python
from model_trainer import PricePredictionModel
import os
import numpy as np

# Test 1: Model file exists
assert os.path.exists('models/price_predictor.pkl'), "Model file not found"
print("✓ Model file exists")

# Test 2: Load model
model = PricePredictionModel('models/price_predictor.pkl')
model.load_model()
print("✓ Model loaded successfully")

# Test 3: Model trained
assert model.model is not None, "Model not loaded"
print("✓ Model object valid")

# Test 4: R² Score
r2 = model.metrics.get('test_r2', 0)
assert r2 >= 0.90, f"Test R² too low: {r2}"
print(f"✓ Test R² Score: {r2:.4f} (Target: ≥0.90)")

# Test 5: RMSE
rmse = model.metrics.get('test_rmse', 999)
assert rmse <= 200, f"Test RMSE too high: {rmse}"
print(f"✓ Test RMSE: ₹{rmse:.2f} (Target: ≤200)")

# Test 6: Make predictions
test_features = np.array([[5, 0, 15, 2, 10.0, 4.2]])
prediction = model.predict(test_features)
assert 100 < prediction < 10000, f"Prediction out of range: {prediction}"
print(f"✓ Prediction test: ₹{prediction:.2f}")

print("\n✓ ALL MODEL TESTS PASSED!")
```

---

## Test 5: API Endpoint Tests

### Start Server
```bash
cd src
python api.py
```

Server should start on `http://localhost:8000`

### Test 5a: Health Check
```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "data_loaded": true
}
```

### Test 5b: Search Product
```bash
curl -X POST http://localhost:8000/search-product \
  -H "Content-Type: application/json" \
  -d '{"product_name": "Wireless Headphones", "platform": "Amazon"}'
```

**Expected Response:**
```json
{
  "search_query": "Wireless Headphones",
  "results": [
    {
      "product_name": "Wireless Headphones Pro",
      "platform": "Amazon",
      "current_price": 2650.45,
      "discount": 12.5,
      "rating": 4.5,
      "date": "2026-02-01"
    }
  ],
  "count": 1
}
```

### Test 5c: Price Trend
```bash
curl "http://localhost:8000/price-trend?product_name=Wireless%20Headphones%20Pro&platform=Amazon"
```

**Expected Response:**
- 182 data points (one per day)
- Dates from 2025-08-01 to 2026-02-01
- Prices between 2300-3000 for headphones
- JSON structure with history array

### Test 5d: Price Prediction
```bash
curl "http://localhost:8000/predict?product_name=Wireless%20Headphones%20Pro&platform=Amazon"
```

**Expected Response:**
```json
{
  "product_name": "Wireless Headphones Pro",
  "platform": "Amazon",
  "current_price": 2650.45,
  "predicted_price": 2580.50,
  "price_change_percentage": -2.64,
  "recommendation": "WAIT",
  "confidence": 0.85
}
```

**Validation:**
- recommendation is either "WAIT" or "BUY NOW"
- confidence between 0.8-0.9
- predicted_price is numeric
- price_change_percentage reflects difference

### Test 5e: Trending Products
```bash
curl "http://localhost:8000/trending-products?limit=5"
```

**Expected Response:**
- Array of 5 products
- Each with volatility, average_price, price_range
- Sorted by volatility (descending)

### Test 5f: Platform Comparison
```bash
curl "http://localhost:8000/platform-comparison?product_name=Wireless%20Headphones%20Pro"
```

**Expected Response:**
- Amazon data with current_price, discount, rating
- Flipkart data with current_price, discount, rating
- best_deal key showing cheaper platform

---

## Test 6: Integration Tests

### Full Pipeline Test
```python
#!/usr/bin/env python3
"""Integration test - full pipeline"""

import sys
import os

# Step 1: Generate dataset
print("Step 1: Generating dataset...")
from src.dataset_generator import generate_synthetic_dataset
df = generate_synthetic_dataset('data/ecommerce_prices.csv')
assert len(df) == 6552, "Dataset generation failed"
print("✓ Dataset generated")

# Step 2: Preprocess
print("\nStep 2: Preprocessing data...")
from src.data_preprocessing import preprocess_data
df2, X, y, prep = preprocess_data('data/ecommerce_prices.csv')
assert X.shape == (6552, 6), "Preprocessing failed"
print("✓ Data preprocessed")

# Step 3: Train model
print("\nStep 3: Training model...")
from src.model_trainer import train_model
model = train_model('data/ecommerce_prices.csv')
assert model.model is not None, "Training failed"
print("✓ Model trained")

# Step 4: Make predictions
print("\nStep 4: Making predictions...")
import numpy as np
features = np.array([[0, 0, 1, 8, 10.0, 4.2]])
pred = model.predict(features)
assert 200 < pred < 8000, "Prediction invalid"
print(f"✓ Prediction: ₹{pred:.2f}")

# Step 5: Load and predict with saved model
print("\nStep 5: Loading saved model...")
model2 = type(model)('models/price_predictor.pkl')
model2.load_model()
pred2 = model2.predict(features)
assert abs(pred - pred2) < 0.01, "Loaded model predictions differ"
print(f"✓ Saved model prediction: ₹{pred2:.2f}")

print("\n" + "="*50)
print("✓ ALL INTEGRATION TESTS PASSED!")
print("="*50)
```

---

## Test 7: Error Handling Tests

### Test Invalid Product
```bash
curl -X POST http://localhost:8000/search-product \
  -H "Content-Type: application/json" \
  -d '{"product_name": "NonexistentProduct123"}'
```

**Expected:** 404 error with message

### Test Invalid Platform
```bash
curl "http://localhost:8000/price-trend?product_name=Wireless%20Headphones%20Pro&platform=BestBuy"
```

**Expected:** 404 error

### Test Missing Parameters
```bash
curl http://localhost:8000/price-trend
```

**Expected:** 422 validation error

---

## Test 8: Performance Tests

### Response Time Benchmarks
```python
import requests
import time

BASE_URL = "http://localhost:8000"

# Test 1: Health check
start = time.time()
for _ in range(100):
    requests.get(f"{BASE_URL}/health")
avg_time = (time.time() - start) / 100
print(f"Health check: {avg_time*1000:.2f}ms (Target: <50ms)")

# Test 2: Search
start = time.time()
for _ in range(50):
    requests.post(f"{BASE_URL}/search-product", json={"product_name": "Headphones"})
avg_time = (time.time() - start) / 50
print(f"Search: {avg_time*1000:.2f}ms (Target: <200ms)")

# Test 3: Prediction
start = time.time()
for _ in range(30):
    requests.get(f"{BASE_URL}/predict?product_name=Wireless%20Headphones%20Pro&platform=Amazon")
avg_time = (time.time() - start) / 30
print(f"Prediction: {avg_time*1000:.2f}ms (Target: <500ms)")

# Test 4: Trending
start = time.time()
for _ in range(30):
    requests.get(f"{BASE_URL}/trending-products")
avg_time = (time.time() - start) / 30
print(f"Trending: {avg_time*1000:.2f}ms (Target: <300ms)")
```

---

## Test 9: Load Testing

### Using Apache Bench (ab)
```bash
# Install: apt-get install apache2-utils (Linux/Mac)
# Windows: Use Apache Bench for Windows or replace with wrk

# Test 1: 100 concurrent requests
ab -n 1000 -c 100 http://localhost:8000/health

# Test 2: Concurrent predictions
ab -n 500 -c 50 "http://localhost:8000/predict?product_name=Wireless%20Headphones%20Pro&platform=Amazon"
```

---

## Documentation Tests

### Verify All Documentation Files
- [ ] `README.md` - Complete project documentation
- [ ] `QUICK_START.md` - Quick setup instructions
- [ ] `ARCHITECTURE.md` - System design & architecture
- [ ] `TESTING.md` - This testing guide
- [ ] Code comments - All modules documented

### Interactive API Documentation
```bash
# After starting server, open browser:
http://localhost:8000/docs
# Try each endpoint in Swagger UI
```

---

## Troubleshooting Test Failures

### Issue: "ModuleNotFoundError: No module named 'fastapi'"
```bash
pip install -r requirements.txt
```

### Issue: "Model not found at models/price_predictor.pkl"
```bash
cd src
python model_trainer.py
```

### Issue: "Data not loaded"
```bash
cd src
python dataset_generator.py
```

### Issue: "Port 8000 already in use"
```bash
# Option 1: Kill process on port 8000
lsof -ti:8000 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :8000    # Windows

# Option 2: Use different port
uvicorn api:app --port 8001
```

### Issue: "ImportError when running tests"
```bash
# Ensure PYTHONPATH includes src
export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"
python test_script.py
```

---

## Final Validation Checklist

- [ ] Dataset generated: 6,552 records
- [ ] All features created: product_id, platform_id, day, month, discount, rating
- [ ] Model trained: R² ≥ 0.90
- [ ] Model saved: models/price_predictor.pkl (~2 MB)
- [ ] API starts: http://localhost:8000
- [ ] Health check passes: `/health`
- [ ] Search works: `/search-product`
- [ ] Trend data available: `/price-trend`
- [ ] Predictions working: `/predict`
- [ ] Recommendations logic: "WAIT" or "BUY NOW"
- [ ] All endpoints return valid JSON
- [ ] Error handling works: Invalid inputs handled gracefully
- [ ] Documentation complete: README + QUICK_START + ARCHITECTURE
- [ ] Response times acceptable: <500ms per request

---

## Success Criteria Summary

✓ **System passes all tests when:**
1. setup.py returns all green checkmarks
2. All API endpoints respond with valid JSON
3. ML model achieves R² ≥ 0.90
4. Response times < 500ms
5. No unhandled errors
6. Documentation is complete

**Congratulations! Your system is production-ready! 🚀**
