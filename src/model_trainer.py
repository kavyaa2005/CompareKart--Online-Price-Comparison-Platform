"""
Machine Learning Model Training Module
Trains RandomForestRegressor to predict future prices
"""

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from data_preprocessing import preprocess_data
import os


class PricePredictionModel:
    """
    ML Model for predicting product prices using RandomForestRegressor.
    """
    
    def __init__(self, model_path='models/price_predictor.pkl'):
        """Initialize model storage path."""
        self.model = None
        self.model_path = model_path
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.preprocessor = None
        self.metrics = {}
    
    def train(self, csv_path='data/ecommerce_prices.csv', test_size=0.2, random_state=42):
        """
        Train RandomForestRegressor on preprocessed data.
        
        Args:
        - csv_path: Path to the CSV dataset
        - test_size: Fraction of data to use for testing
        - random_state: Random seed for reproducibility
        """
        
        print("\n" + "="*50)
        print("MODEL TRAINING PIPELINE")
        print("="*50)
        
        # Preprocess data
        print("\n1. Preprocessing data...")
        df, X, y, self.preprocessor = preprocess_data(csv_path)
        
        # Split data
        print("\n2. Splitting data into train/test sets...")
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y,
            test_size=test_size,
            random_state=random_state
        )
        print(f"   Training set: {len(self.X_train)} samples")
        print(f"   Test set: {len(self.X_test)} samples")
        
        # Train RandomForestRegressor
        print("\n3. Training RandomForestRegressor...")
        self.model = RandomForestRegressor(
            n_estimators=100,           # Number of trees
            max_depth=20,               # Maximum tree depth
            min_samples_split=5,        # Minimum samples to split
            min_samples_leaf=2,         # Minimum samples in leaf node
            random_state=random_state,
            n_jobs=-1,                  # Use all CPU cores
            verbose=1
        )
        
        self.model.fit(self.X_train, self.y_train)
        print("   ✓ Model training completed")
        
        # Evaluate model
        print("\n4. Evaluating model...")
        self._evaluate_model()
        
        # Save model
        print("\n5. Saving model...")
        self.save_model()
        
        print("\n" + "="*50 + "\n")
        
        return self.model
    
    def _evaluate_model(self):
        """Calculate and display model performance metrics."""
        
        # Predictions
        y_train_pred = self.model.predict(self.X_train)
        y_test_pred = self.model.predict(self.X_test)
        
        # Training metrics
        train_mse = mean_squared_error(self.y_train, y_train_pred)
        train_rmse = np.sqrt(train_mse)
        train_mae = mean_absolute_error(self.y_train, y_train_pred)
        train_r2 = r2_score(self.y_train, y_train_pred)
        
        # Test metrics
        test_mse = mean_squared_error(self.y_test, y_test_pred)
        test_rmse = np.sqrt(test_mse)
        test_mae = mean_absolute_error(self.y_test, y_test_pred)
        test_r2 = r2_score(self.y_test, y_test_pred)
        
        # Store metrics
        self.metrics = {
            'train_rmse': train_rmse,
            'train_mae': train_mae,
            'train_r2': train_r2,
            'test_rmse': test_rmse,
            'test_mae': test_mae,
            'test_r2': test_r2
        }
        
        # Display results
        print(f"\n   TRAINING SET:")
        print(f"   - R² Score: {train_r2:.4f}")
        print(f"   - RMSE: ₹{train_rmse:.2f}")
        print(f"   - MAE: ₹{train_mae:.2f}")
        
        print(f"\n   TEST SET:")
        print(f"   - R² Score: {test_r2:.4f}")
        print(f"   - RMSE: ₹{test_rmse:.2f}")
        print(f"   - MAE: ₹{test_mae:.2f}")
        
        # Feature importance
        feature_names = ['product_id', 'platform_id', 'day_of_month', 'month', 'discount', 'rating']
        importances = self.model.feature_importances_
        
        print(f"\n   FEATURE IMPORTANCE:")
        for name, importance in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True):
            print(f"   - {name}: {importance:.4f}")
    
    def predict(self, features):
        """
        Make prediction on new data.
        
        Args:
        - features: Array of shape (1, 6) with [product_id, platform_id, day_of_month, month, discount, rating]
        
        Returns:
        - Predicted price
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first or load_model().")
        
        return self.model.predict(features)[0]
    
    def save_model(self):
        """Save trained model to disk."""
        os.makedirs(os.path.dirname(self.model_path) if os.path.dirname(self.model_path) else '.', exist_ok=True)
        joblib.dump(self.model, self.model_path)
        print(f"   ✓ Model saved to {self.model_path}")
    
    def load_model(self):
        """Load pre-trained model from disk."""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model not found at {self.model_path}")
        
        self.model = joblib.load(self.model_path)
        print(f"✓ Model loaded from {self.model_path}")
        return self.model
    
    def get_feature_importance(self):
        """
        Get feature importance scores from the trained model.
        
        Returns:
        - Dictionary with feature names as keys and importance as values
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call train() or load_model() first.")
        
        feature_names = ['product_id', 'platform_id', 'day_of_month', 'month', 'discount', 'rating']
        importances = self.model.feature_importances_
        
        importance_dict = {}
        for name, importance in zip(feature_names, importances):
            importance_dict[name] = round(float(importance) * 100, 2)  # Convert to percentage
        
        return importance_dict


def train_model(csv_path='data/ecommerce_prices.csv'):
    """
    Convenience function to train and save the model.
    
    Returns:
    - model_instance: PricePredictionModel instance with trained model
    """
    
    model_instance = PricePredictionModel()
    model_instance.train(csv_path)
    
    return model_instance


if __name__ == '__main__':
    model = train_model()
