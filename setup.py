"""
Complete Setup & Test Script for E-commerce Price Comparison Backend
Runs all components in sequence and validates the system
"""

import os
import sys
import subprocess
from pathlib import Path

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))


def print_header(text):
    """Print formatted header."""
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)


def print_step(num, text):
    """Print step marker."""
    print(f"\n[{num}] {text}")
    print("-" * 70)


def step_1_generate_dataset():
    """Step 1: Generate synthetic dataset."""
    print_step(1, "GENERATING SYNTHETIC DATASET")
    
    try:
        from src.dataset_generator import generate_synthetic_dataset
        
        df = generate_synthetic_dataset('data/ecommerce_prices.csv')
        print(f"\n✓ Dataset generated successfully")
        print(f"  Location: data/ecommerce_prices.csv")
        print(f"  Records: {len(df)}")
        
        return True
    
    except Exception as e:
        print(f"\n✗ Error generating dataset: {e}")
        return False


def step_2_preprocess_data():
    """Step 2: Preprocess data."""
    print_step(2, "PREPROCESSING DATA")
    
    try:
        from src.data_preprocessing import preprocess_data
        
        df, X, y, preprocessor = preprocess_data('data/ecommerce_prices.csv')
        
        print(f"\n✓ Data preprocessing completed")
        print(f"  Features shape: {X.shape}")
        print(f"  Target shape: {y.shape}")
        
        return True
    
    except Exception as e:
        print(f"\n✗ Error preprocessing data: {e}")
        return False


def step_3_train_model():
    """Step 3: Train ML model."""
    print_step(3, "TRAINING MACHINE LEARNING MODEL")
    
    try:
        from src.model_trainer import train_model
        
        model = train_model('data/ecommerce_prices.csv')
        
        print(f"\n✓ ML model trained and saved successfully")
        print(f"  Model location: models/price_predictor.pkl")
        print(f"  Model metrics saved")
        
        return True
    
    except Exception as e:
        print(f"\n✗ Error training model: {e}")
        return False


def step_4_test_api_locally():
    """Step 4: Test API endpoints locally."""
    print_step(4, "TESTING API ENDPOINTS (LOCAL)")
    
    try:
        from src.data_preprocessing import DataPreprocessor
        from src.model_trainer import PricePredictionModel
        import pandas as pd
        import numpy as np
        
        # Load data and model
        preprocessor = DataPreprocessor('data/ecommerce_prices.csv')
        df_test = preprocessor.load_data()
        preprocessor.create_features()
        
        model = PricePredictionModel('models/price_predictor.pkl')
        model.load_model()
        
        print(f"\n✓ Components loaded successfully")
        
        # Test 1: Product search
        print("\nTest 1: Product Search")
        product_sample = df_test.iloc[0]['product_name']
        platform_sample = df_test.iloc[0]['platform']
        
        matching = df_test[
            (df_test['product_name'] == product_sample) &
            (df_test['platform'] == platform_sample)
        ].sort_values('date')
        
        if len(matching) > 0:
            latest = matching.iloc[-1]
            print(f"  ✓ Found: {product_sample} on {platform_sample}")
            print(f"    Price: ₹{latest['price']:.2f}")
        
        # Test 2: Price trend
        print("\nTest 2: Price Trend")
        if len(matching) > 7:
            prices = matching['price'].values[-7:]
            print(f"  ✓ Last 7 days trend (₹): {[f'{p:.0f}' for p in prices]}")
        
        # Test 3: Price prediction
        print("\nTest 3: Price Prediction")
        features = np.array([[
            preprocessor.product_encodings.get(product_sample, 0),
            preprocessor.platform_encodings.get(platform_sample, 0),
            1,
            2,
            10.0,
            4.2
        ]])
        
        predicted = model.predict(features)
        current = latest['price']
        
        print(f"  ✓ Prediction successful")
        print(f"    Current: ₹{current:.2f}")
        print(f"    Predicted: ₹{predicted:.2f}")
        print(f"    Change: {((predicted-current)/current)*100:.2f}%")
        
        # Test 4: Recommendation
        print("\nTest 4: Buy/Wait Recommendation")
        if predicted < current:
            rec = "WAIT"
        else:
            rec = "BUY NOW"
        
        print(f"  ✓ Recommendation: {rec}")
        
        print(f"\n✓ All local API tests passed!")
        return True
    
    except Exception as e:
        print(f"\n✗ Error testing API: {e}")
        import traceback
        traceback.print_exc()
        return False


def print_final_summary(results):
    """Print final test summary."""
    print_header("SETUP & VALIDATION SUMMARY")
    
    steps = [
        "Dataset Generation",
        "Data Preprocessing",
        "ML Model Training",
        "API Testing"
    ]
    
    for i, (step, result) in enumerate(zip(steps, results), 1):
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"[{i}] {step:<30} {status}")
    
    all_passed = all(results)
    
    if all_passed:
        print("\n" + "="*70)
        print("  ✓ ALL TESTS PASSED - SYSTEM READY FOR DEPLOYMENT")
        print("="*70)
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Start API server: cd src && python api.py")
        print("3. Open browser: http://localhost:8000/docs")
        print("4. Test endpoints via Swagger UI")
    else:
        print("\n" + "="*70)
        print("  ✗ SOME TESTS FAILED - CHECK ERRORS ABOVE")
        print("="*70)
    
    return all_passed


def main():
    """Run complete setup and testing pipeline."""
    
    print_header("E-COMMERCE PRICE COMPARISON BACKEND")
    print("Complete Setup & Validation Pipeline")
    
    # Check if in correct directory
    if not os.path.exists('src'):
        print("\n✗ Error: Please run this script from the MINI-PROJECT directory")
        sys.exit(1)
    
    # Create necessary directories
    os.makedirs('data', exist_ok=True)
    os.makedirs('models', exist_ok=True)
    
    results = []
    
    # Run all steps
    results.append(step_1_generate_dataset())
    results.append(step_2_preprocess_data())
    results.append(step_3_train_model())
    results.append(step_4_test_api_locally())
    
    # Print summary
    success = print_final_summary(results)
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
