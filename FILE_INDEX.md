# FILE DIRECTORY & QUICK NAVIGATION

## 📍 Project Root: `c:\Users\fsarg\OneDrive\Desktop\MINI-PROJECT\`

---

## 📄 Documentation Files (Read These First!)

| File | Purpose | Read When | Time |
|------|---------|-----------|------|
| **PROJECT_SUMMARY.md** | Quick overview of everything | First! | 5 min |
| **QUICK_START.md** | How to get started fast | Before running code | 10 min |
| **README.md** | Complete documentation | For detailed info | 20 min |
| **ARCHITECTURE.md** | System design & data flow | To understand design | 15 min |
| **TESTING.md** | How to test everything | Before testing | 15 min |
| **FILE_INDEX.md** | This file! | For navigation | 5 min |

---

## 🔧 Source Code Files

### Main Python Modules (in `src/` directory)

#### 1. **dataset_generator.py** - Synthetic Data Creation
```
Purpose: Generate realistic e-commerce pricing data
Input: None (generates data)
Output: data/ecommerce_prices.csv (6,552 records)
Run: python dataset_generator.py
Time: ~5-10 seconds
```

**What it does:**
- Creates 18 product names
- Generates prices for 2 platforms
- Covers 6 months of daily prices (182 days)
- Adds realistic trends and seasonality
- Produces 6,552 total records

---

#### 2. **data_preprocessing.py** - Feature Engineering
```
Purpose: Clean data and prepare for ML training
Input: data/ecommerce_prices.csv
Output: Feature matrix (X), target vector (y)
Run: python data_preprocessing.py
Time: ~2-3 seconds
```

**What it does:**
- Loads CSV data
- Checks for missing values
- Sorts by date
- Encodes categorical features
- Extracts temporal features (day, month)
- Returns 6 features per record

**Features Created:**
- product_id (0-17)
- platform_id (0-1)
- day_of_month (1-31)
- month (1-12)
- discount (0-50%)
- rating (3.0-5.0)

---

#### 3. **model_trainer.py** - ML Model Training
```
Purpose: Train RandomForest price prediction model
Input: Preprocessed data
Output: models/price_predictor.pkl
Run: python model_trainer.py
Time: ~20-30 seconds
```

**What it does:**
- Preprocesses data
- Splits train/test (80/20)
- Trains RandomForestRegressor (100 trees)
- Evaluates model metrics
- Saves model to disk

**Model Performance:**
- R² Score: ~0.92-0.95
- RMSE: ±100-150 ₹
- MAE: ±80-120 ₹

---

#### 4. **api.py** - FastAPI Backend
```
Purpose: REST API for predictions and trends
Input: Models and data (loaded at startup)
Output: JSON responses
Run: python api.py
Port: 8000
URL: http://localhost:8000
```

**Endpoints:**
1. `GET /` - API info
2. `GET /health` - Status check
3. `POST /search-product` - Search products
4. `GET /price-trend` - Price history
5. `GET /predict` - Price prediction
6. `GET /trending-products` - Volatile products
7. `GET /platform-comparison` - Price comparison

---

#### 5. **__init__.py** - Package Initialization
```
Purpose: Make src a Python package
Contains: Package metadata
```

---

## 📊 Data & Models (Generated at Runtime)

### data/ Directory
```
data/
├── ecommerce_prices.csv       ← Generated dataset
    ├── 6,552 records
    ├── 18 products
    ├── 2 platforms
    └── 6 months (182 days)
```

**Columns:** product_name, platform, date, price, discount, rating

### models/ Directory
```
models/
├── price_predictor.pkl        ← Trained ML model
    ├── 100 decision trees
    ├── ~2 MB file size
    └── Can make 1,000s predictions
```

---

## 🚀 Execution Order

### Quick Setup (Automated)
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run complete setup
python setup.py

# Expected: ✓ ALL TESTS PASSED
```

### Manual Step-by-Step
```bash
# Step 1: Generate data
cd src
python dataset_generator.py
# Output: data/ecommerce_prices.csv

# Step 2: Preprocess data
python data_preprocessing.py
# Output: Processed features

# Step 3: Train model
python model_trainer.py
# Output: models/price_predictor.pkl

# Step 4: Start API
python api.py
# Output: Running on http://localhost:8000

# Step 5: Open browser
# http://localhost:8000/docs
```

---

## 📋 Configuration Files

### requirements.txt
```
Dependencies for the project
- pandas (data handling)
- numpy (numerical computing)
- scikit-learn (ML models)
- fastapi (web framework)
- uvicorn (server)
- joblib (model persistence)
- pydantic (validation)
```

**Install:** `pip install -r requirements.txt`

---

## 🧪 Testing & Validation

### setup.py - Automated Testing
```
Purpose: Validate entire system in one command
Run: python setup.py
Time: 1-2 minutes
Output: ✓ ALL TESTS PASSED (if successful)

Tests:
1. Dataset generation
2. Data preprocessing
3. Model training
4. API endpoints
```

---

## 📖 Documentation Structure

```
README.md
├── Project Overview
├── Quick Start
├── Installation
├── API Endpoints (detailed)
├── Technology Stack
├── Dataset Details
├── ML Model Info
└── Troubleshooting

QUICK_START.md
├── 3-step setup
├── Testing API
├── Sample responses
├── API endpoint summary
├── Troubleshooting
└── Frontend integration

ARCHITECTURE.md
├── High-level architecture
├── Component details
├── Data flow diagrams
├── Request-response examples
├── Performance info
└── Scaling notes

TESTING.md
├── Pre-test checklist
├── Unit tests
├── Integration tests
├── API tests
├── Load testing
└── Troubleshooting

PROJECT_SUMMARY.md
├── Project completion status
├── What's delivered
├── Getting started
├── Statistics
├── Technology stack
└── Next steps
```

---

## 💻 Key Commands Reference

### Setup
```bash
cd c:\Users\fsarg\OneDrive\Desktop\MINI-PROJECT
pip install -r requirements.txt
python setup.py
```

### Generate Data
```bash
cd src
python dataset_generator.py
```

### Preprocess
```bash
cd src
python data_preprocessing.py
```

### Train Model
```bash
cd src
python model_trainer.py
```

### Run API
```bash
cd src
python api.py
# Then visit: http://localhost:8000/docs
```

### Test with curl
```bash
# Health check
curl http://localhost:8000/health

# Search
curl -X POST http://localhost:8000/search-product \
  -H "Content-Type: application/json" \
  -d '{"product_name": "Headphones"}'

# Predict
curl "http://localhost:8000/predict?product_name=Wireless%20Headphones%20Pro&platform=Amazon"
```

---

## 📊 File Statistics

| Type | Count | Total Lines |
|------|-------|-------------|
| Python modules | 5 | ~2,500 |
| Documentation | 6 | ~2,000 |
| Config files | 1 | 8 |
| **Total** | **12** | **~4,500** |

---

## 🎯 By Use Case

### "I want to understand the system"
1. Read: PROJECT_SUMMARY.md (5 min)
2. Read: README.md (20 min)
3. Read: ARCHITECTURE.md (15 min)

### "I want to set up and run it"
1. Follow: QUICK_START.md
2. Run: `python setup.py`
3. Read: API docs at `/docs`

### "I want to test everything"
1. Follow: TESTING.md
2. Run individual tests
3. Run integration tests

### "I want to modify it"
1. Read: ARCHITECTURE.md (understand design)
2. Edit: Relevant Python file in `src/`
3. Run: `python setup.py` (re-validate)

### "I want to deploy it"
1. Read: README.md (full setup)
2. Read: ARCHITECTURE.md (scaling notes)
3. Configure: Database, authentication, monitoring
4. Deploy: Docker/Kubernetes

---

## 🔍 File Locations Quick Reference

```
MINI-PROJECT/
├── src/                          ← Python source code
│   ├── dataset_generator.py      ← Data generation
│   ├── data_preprocessing.py     ← Feature engineering
│   ├── model_trainer.py          ← ML model training
│   ├── api.py                    ← FastAPI backend
│   └── __init__.py               ← Package init
│
├── data/                         ← Generated data (empty initially)
│   └── ecommerce_prices.csv      ← Created by dataset_generator.py
│
├── models/                       ← ML models (empty initially)
│   └── price_predictor.pkl       ← Created by model_trainer.py
│
├── requirements.txt              ← Python dependencies
├── setup.py                      ← Automated testing
├── README.md                     ← Main documentation
├── QUICK_START.md                ← Quick setup guide
├── ARCHITECTURE.md               ← System design
├── TESTING.md                    ← Testing guide
├── PROJECT_SUMMARY.md            ← Project overview
└── FILE_INDEX.md                 ← This file
```

---

## ✅ Completion Checklist

- [x] Dataset generator created
- [x] Data preprocessing module created
- [x] ML model training script created
- [x] FastAPI backend implemented
- [x] 6 REST endpoints created
- [x] Buy/wait recommendation logic
- [x] Price trend visualization data
- [x] All documentation written
- [x] Automated testing script
- [x] Requirements file
- [x] Setup instructions
- [x] This file index

---

## 🎉 You're All Set!

**Your complete AI/ML e-commerce price comparison backend is ready!**

### Next Steps:
1. **Install**: `pip install -r requirements.txt`
2. **Setup**: `python setup.py`
3. **Run**: `cd src && python api.py`
4. **Test**: Open `http://localhost:8000/docs`

---

## 📞 Navigation Tips

- **For overview:** Read PROJECT_SUMMARY.md
- **To get started:** Follow QUICK_START.md
- **For details:** See README.md
- **To understand design:** Read ARCHITECTURE.md
- **To test:** Follow TESTING.md
- **To navigate:** Use FILE_INDEX.md (this file)

---

**Happy coding! 🚀**
