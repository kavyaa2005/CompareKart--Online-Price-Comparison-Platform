"""
Data Preprocessing Module for E-commerce Price Data
Prepares and cleans data for ML model training
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from datetime import datetime
import warnings

warnings.filterwarnings('ignore')


class DataPreprocessor:
    """Handles data loading, cleaning, and feature engineering."""
    
    def __init__(self, csv_path):
        """Initialize with CSV file path."""
        self.csv_path = csv_path
        self.df = None
        self.encoder = LabelEncoder()
        self.product_encodings = {}
        self.platform_encodings = {}
    
    def load_data(self):
        """Load CSV file into pandas DataFrame."""
        self.df = pd.read_csv(self.csv_path)
        self.df['date'] = pd.to_datetime(self.df['date'])
        print(f"✓ Data loaded: {len(self.df)} records")
        return self.df
    
    def handle_missing_values(self):
        """Check and handle any missing values."""
        missing_count = self.df.isnull().sum().sum()
        if missing_count > 0:
            print(f"⚠ Found {missing_count} missing values. Handling...")
            self.df = self.df.dropna()
        else:
            print("✓ No missing values found")
        return self.df
    
    def create_features(self):
        """
        Create features for ML model training.
        Features:
        - product_id: Encoded product name
        - platform_id: Encoded platform
        - day_of_month: Day from date
        - month: Month from date
        - discount: Discount percentage
        - rating: Product rating
        """
        
        # Encode categorical variables
        self.df['product_id'] = self.encoder.fit_transform(self.df['product_name'])
        self.product_encodings = dict(zip(
            self.encoder.classes_,
            self.encoder.transform(self.encoder.classes_)
        ))
        
        platform_encoder = LabelEncoder()
        self.df['platform_id'] = platform_encoder.fit_transform(self.df['platform'])
        self.platform_encodings = dict(zip(
            platform_encoder.classes_,
            platform_encoder.transform(platform_encoder.classes_)
        ))
        
        # Extract temporal features
        self.df['day_of_month'] = self.df['date'].dt.day
        self.df['month'] = self.df['date'].dt.month
        self.df['day_of_year'] = self.df['date'].dt.dayofyear
        
        # Ensure numeric types
        self.df['discount'] = pd.to_numeric(self.df['discount'], errors='coerce').fillna(0)
        self.df['rating'] = pd.to_numeric(self.df['rating'], errors='coerce').fillna(4.0)
        
        print("✓ Features created successfully")
        return self.df
    
    def sort_data(self):
        """Sort data by date for time series analysis."""
        self.df = self.df.sort_values('date').reset_index(drop=True)
        print("✓ Data sorted by date")
        return self.df
    
    def get_features_and_target(self):
        """
        Get features (X) and target (y) for ML training.
        Target: price (what we want to predict)
        Features: product_id, platform_id, day_of_month, month, discount, rating
        """
        
        feature_columns = ['product_id', 'platform_id', 'day_of_month', 'month', 'discount', 'rating']
        
        X = self.df[feature_columns].values
        y = self.df['price'].values
        
        print(f"✓ Features shape: {X.shape}")
        print(f"✓ Target shape: {y.shape}")
        
        return X, y, self.df
    
    def preprocess(self):
        """Execute full preprocessing pipeline."""
        print("\n" + "="*50)
        print("DATA PREPROCESSING PIPELINE")
        print("="*50)
        
        self.load_data()
        self.handle_missing_values()
        self.sort_data()
        self.create_features()
        
        print("\n" + "="*50)
        print("Data preview after preprocessing:")
        print(self.df[['product_name', 'platform', 'date', 'price', 'discount', 'rating']].head(10))
        print("="*50 + "\n")
        
        return self.df


def preprocess_data(csv_path='data/ecommerce_prices.csv'):
    """
    Convenience function to preprocess data.
    
    Returns:
    - df: Processed DataFrame
    - X: Feature matrix
    - y: Target vector
    - preprocessor: DataPreprocessor instance
    """
    
    preprocessor = DataPreprocessor(csv_path)
    df = preprocessor.preprocess()
    X, y, df = preprocessor.get_features_and_target()
    
    return df, X, y, preprocessor


if __name__ == '__main__':
    df, X, y, preprocessor = preprocess_data()
