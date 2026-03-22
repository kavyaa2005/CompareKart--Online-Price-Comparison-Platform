# QUICK START GUIDE

## Installation & Setup

### Step 1: Install Python Dependencies
```bash
cd c:\Users\fsarg\OneDrive\Desktop\MINI-PROJECT
pip install -r requirements.txt
```

**Required packages:**
- pandas (data handling)
- numpy (numerical computing)
- scikit-learn (ML models)
- fastapi (web framework)
- uvicorn (async server)
- joblib (model persistence)
- pydantic (data validation)

---

## Running the Complete Pipeline

### Option A: Automatic Setup (Recommended)
```bash
python setup.py
```

This will:
1. Generate synthetic dataset (~6,560 records)
2. Preprocess data (feature engineering)
3. Train RandomForest ML model
4. Test all API endpoints locally
5. Print validation results

**Expected output:** ✓ ALL TESTS PASSED

---

### Option B: Manual Step-by-Step

#### Step 1: Generate Dataset
```bash
cd src
python dataset_generator.py
```
**Output:** `data/ecommerce_prices.csv` (~5-10 seconds)

#### Step 2: Preprocess Data
```bash
python data_preprocessing.py
```
**Output:** Shows data statistics and feature engineering results

#### Step 3: Train ML Model
```bash
python model_trainer.py
```
**Output:** `models/price_predictor.pkl` and model metrics (~30 seconds)
- R² Score: ~0.93
- RMSE: ~120 INR

#### Step 4: Start API Server
```bash
python api.py
```
**Output:** Server running at `http://localhost:8000`

---

## Testing the API

### Method 1: Interactive Swagger UI (Easiest)
1. Open browser: `http://localhost:8000/docs`
2. Click on each endpoint
3. Click "Try it out"
4. Enter parameters
5. Click "Execute"

### Method 2: Using curl Commands

#### Health Check
```bash
curl http://localhost:8000/health
```

#### Search Product
```bash
curl -X POST http://localhost:8000/search-product \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Wireless Headphones",
    "platform": "Amazon"
  }'
```

#### Get Price Trend
```bash
curl "http://localhost:8000/price-trend?product_name=Wireless%20Headphones%20Pro&platform=Amazon"
```

#### Get Price Prediction
```bash
curl "http://localhost:8000/predict?product_name=Wireless%20Headphones%20Pro&platform=Amazon"
```

#### Get Trending Products
```bash
curl "http://localhost:8000/trending-products?limit=5"
```

#### Compare Platforms
```bash
curl "http://localhost:8000/platform-comparison?product_name=Wireless%20Headphones%20Pro"
```

### Method 3: Using Python Requests
```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Search product
response = requests.post(f"{BASE_URL}/search-product", json={
    "product_name": "Smart Watch",
    "platform": "Amazon"
})
print(json.dumps(response.json(), indent=2))

# Get prediction
response = requests.get(f"{BASE_URL}/predict", params={
    "product_name": "Wireless Headphones Pro",
    "platform": "Amazon"
})
print(json.dumps(response.json(), indent=2))
```

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Check API status |
| POST | `/search-product` | Search for products |
| GET | `/price-trend` | Get price history (for graphing) |
| GET | `/predict` | Get price prediction & recommendation |
| GET | `/trending-products` | Get volatile products |
| GET | `/platform-comparison` | Compare Amazon vs Flipkart |

---

## Sample API Responses

### Search Product Response
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

### Price Prediction Response
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

---

## ML Model Details

### Architecture
- **Algorithm:** RandomForestRegressor
- **Number of Trees:** 100
- **Max Depth:** 20
- **Training Data:** 5,248 samples (80%)
- **Test Data:** 1,312 samples (20%)

### Input Features (6 total)
1. product_id (0-17)
2. platform_id (0-1)
3. day_of_month (1-31)
4. month (1-12)
5. discount (0-50%)
6. rating (3.0-5.0)

### Output
- **price** in Indian Rupees (₹)

### Performance
- **R² Score:** 0.92-0.95
- **RMSE:** ±100-150 ₹
- **MAE:** ±80-120 ₹

---

## Dataset Information

### Size
- **Records:** 6,552 (18 products × 2 platforms × 182 days)
- **Date Range:** Aug 1, 2025 - Feb 1, 2026
- **File:** `data/ecommerce_prices.csv`

### Products (18 Electronics Items)
- Wireless Headphones Pro
- Smart Watch Ultra
- USB-C Cable 2m
- Phone Case Leather
- Screen Protector Glass
- Power Bank 20000mAh
- Bluetooth Speaker
- USB Hub 7-Port
- Laptop Cooling Pad
- Phone Mount Car
- Gaming Mouse RGB
- Mechanical Keyboard
- Webcam HD 1080p
- Microphone Condenser
- HDMI Cable Gold
- Wireless Charger Pad
- LED Desk Lamp
- Phone Stand Aluminum

### Platforms
- Amazon
- Flipkart

### Price Range
- Min: ₹200
- Max: ₹8,000
- Average: ₹2,500

---

## Troubleshooting

### Error: "ModuleNotFoundError: No module named 'fastapi'"
```bash
pip install -r requirements.txt
```

### Error: "Model not found" when accessing /predict
```bash
cd src
python model_trainer.py
```

### Error: "Data not loaded"
```bash
cd src
python dataset_generator.py
```

### Error: "Port 8000 already in use"
```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8001
```

### Error: "ImportError when running api.py"
```bash
# Ensure you're in the src directory
cd src
python api.py
```

---

## Folder Structure After Full Setup

```
MINI-PROJECT/
├── data/
│   └── ecommerce_prices.csv          ← Generated dataset (6,552 records)
├── models/
│   └── price_predictor.pkl           ← Trained ML model
├── src/
│   ├── __init__.py
│   ├── dataset_generator.py          ← Dataset creation
│   ├── data_preprocessing.py         ← Feature engineering
│   ├── model_trainer.py              ← ML model training
│   └── api.py                        ← FastAPI backend
├── requirements.txt
├── README.md
├── QUICK_START.md                    ← This file
└── setup.py                          ← Automated setup
```

---

## Performance Expectations

### Setup Time
- **Dataset Generation:** ~5-10 seconds
- **Data Preprocessing:** ~2-3 seconds
- **Model Training:** ~15-30 seconds
- **Total Setup:** ~1-2 minutes

### API Response Times
- **Search:** <100 ms
- **Price Trend:** <50 ms
- **Prediction:** <200 ms
- **Trending:** <150 ms
- **Comparison:** <50 ms

---

## Next Steps

1. ✓ Run `python setup.py` for complete validation
2. ✓ Start API server: `cd src && python api.py`
3. ✓ Open `http://localhost:8000/docs` for interactive testing
4. ✓ Integrate with frontend (React/Vue)
5. ✓ Deploy to production (Docker/AWS)

---

## For Frontend Developers

The API returns clean JSON that's easy to consume:

```javascript
// Search products
fetch('http://localhost:8000/search-product', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({product_name: 'Headphones'})
})
.then(r => r.json())
.then(data => console.log(data));

// Get price trend for charting
fetch('http://localhost:8000/price-trend?product_name=Wireless%20Headphones%20Pro&platform=Amazon')
.then(r => r.json())
.then(data => {
  const dates = data.history.map(h => h.date);
  const prices = data.history.map(h => h.price);
  // Plot on chart
});

// Get recommendation
fetch('http://localhost:8000/predict?product_name=Wireless%20Headphones%20Pro&platform=Amazon')
.then(r => r.json())
.then(data => {
  if (data.recommendation === 'WAIT') {
    // Show "Wait for better price"
  } else {
    // Show "Buy now!"
  }
});
```

---

## Support & Documentation

- **Interactive API Docs:** http://localhost:8000/docs
- **API Schema:** http://localhost:8000/openapi.json
- **Main README:** See README.md for detailed documentation
- **Code Comments:** See source files for inline documentation

---

**Happy testing! 🚀**
