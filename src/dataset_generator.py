"""
Synthetic Dataset Generator for E-commerce Price Comparison
Generates realistic product pricing data for Amazon and Flipkart
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

# Set random seed for reproducibility
np.random.seed(42)

def generate_synthetic_dataset(output_path='data/ecommerce_prices.csv'):
    """
    Generate a realistic synthetic dataset simulating Amazon and Flipkart platforms.
    
    Dataset includes:
    - product_name: Names of electronics products
    - platform: Amazon or Flipkart
    - date: Date of price record (over 6 months)
    - price: Product price in INR
    - discount: Discount percentage offered
    - rating: Product rating (1-5 stars)
    """
    
    # Product names (80+ products across multiple categories)
    products = [
        # Electronics & Gadgets
        'Wireless Headphones Pro', 'Smart Watch Ultra', 'USB-C Cable 2m', 'Phone Case Leather',
        'Screen Protector Glass', 'Power Bank 20000mAh', 'Bluetooth Speaker', 'USB Hub 7-Port',
        'Laptop Cooling Pad', 'Phone Mount Car', 'Gaming Mouse RGB', 'Mechanical Keyboard',
        'Webcam HD 1080p', 'Microphone Condenser', 'HDMI Cable Gold', 'Wireless Charger Pad',
        'LED Desk Lamp', 'Phone Stand Aluminum', 'Portable SSD 1TB', 'Wireless Mouse Silent',
        'USB Type-C Hub', 'Lightning Cable Braided', 'Laptop Stand Metal', 'Monitor Light Bar',
        'Gaming Headset Wireless', 'External Hard Drive', 'Card Reader USB', 'Dock Station',
        
        # Fashion & Clothing
        'Cotton T-Shirt Men', 'Denim Jeans Blue', 'Casual Sneakers White', 'Running Shoes Sport',
        'Cotton Saree Traditional', 'Kurti Women Cotton', 'Formal Shirt Men', 'Shorts Casual',
        'Hoodies Sweatshirt', 'Winter Jacket Warm', 'Cotton Dress Women', 'Leggings Yoga',
        'Sports Bra Comfort', 'Tank Top Summer', 'Cargo Pants Men', 'Ethnic Kurta',
        
        # Home & Living
        'Bedsheet Double King', 'Pillow Soft Comfort', 'Bath Towel Premium', 'Door Mat Indoor',
        'Cushion Cover Set', 'Wall Clock Digital', 'Table Lamp Modern', 'Bed Runner Decorative',
        'Throw Blanket Cozy', 'Curtain Rod Brass', 'Wall Hanging Art', 'Photo Frame Wooden',
        'Storage Box Plastic', 'Organizer Drawer', 'Carpet Floor Mat', 'Mirror Wall Mounted',
        
        # Beauty & Personal Care
        'Face Wash Gel', 'Moisturizer Cream', 'Lipstick Matte', 'Sunscreen SPF50', 'Shampoo Bottle',
        'Conditioner Hair', 'Body Lotion Pump', 'Compact Mirror', 'Hair Brush Detangle',
        'Nail Cutter Set', 'Deodorant Spray', 'Face Pack Mask', 'Eye Cream Anti-Aging',
        
        # Sports & Fitness
        'Yoga Mat Non-Slip', 'Dumbbells Set Pair', 'Resistance Bands', 'Foam Roller', 'Jump Rope',
        'Push-Up Bar', 'Water Bottle Sipper', 'Gym Gloves Leather', 'Exercise Ball', 'Meditation Cushion',
        
        # Books & Stationery
        'Notebook A4 Plain', 'Pen Set Premium', 'Highlighter Pack', 'Sticky Notes Neon',
        'Novel Fiction Book', 'Self-Help Book', 'Calendar 2026', 'Bookmark Set'
    ]
    
    platforms = ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Meesho']
    
    # Date range: 6 months (180 days)
    start_date = datetime(2025, 8, 1)
    end_date = datetime(2026, 2, 1)
    date_range = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Base prices for each product (in INR)
    base_prices = {
        # Electronics & Gadgets
        'Wireless Headphones Pro': 2500, 'Smart Watch Ultra': 8000, 'USB-C Cable 2m': 300,
        'Phone Case Leather': 500, 'Screen Protector Glass': 200, 'Power Bank 20000mAh': 1200,
        'Bluetooth Speaker': 1500, 'USB Hub 7-Port': 800, 'Laptop Cooling Pad': 1000,
        'Phone Mount Car': 400, 'Gaming Mouse RGB': 1800, 'Mechanical Keyboard': 3500,
        'Webcam HD 1080p': 2000, 'Microphone Condenser': 3000, 'HDMI Cable Gold': 450,
        'Wireless Charger Pad': 900, 'LED Desk Lamp': 1100, 'Phone Stand Aluminum': 600,
        'Portable SSD 1TB': 8500, 'Wireless Mouse Silent': 1500, 'USB Type-C Hub': 750,
        'Lightning Cable Braided': 350, 'Laptop Stand Metal': 1200, 'Monitor Light Bar': 2200,
        'Gaming Headset Wireless': 3200, 'External Hard Drive': 5500, 'Card Reader USB': 250,
        'Dock Station': 2800,
        
        # Fashion & Clothing
        'Cotton T-Shirt Men': 400, 'Denim Jeans Blue': 1200, 'Casual Sneakers White': 2500,
        'Running Shoes Sport': 3500, 'Cotton Saree Traditional': 1500, 'Kurti Women Cotton': 600,
        'Formal Shirt Men': 1000, 'Shorts Casual': 500, 'Hoodies Sweatshirt': 1200,
        'Winter Jacket Warm': 2500, 'Cotton Dress Women': 800, 'Leggings Yoga': 450,
        'Sports Bra Comfort': 1000, 'Tank Top Summer': 300, 'Cargo Pants Men': 1500,
        'Ethnic Kurta': 700,
        
        # Home & Living
        'Bedsheet Double King': 1200, 'Pillow Soft Comfort': 800, 'Bath Towel Premium': 350,
        'Door Mat Indoor': 500, 'Cushion Cover Set': 600, 'Wall Clock Digital': 1500,
        'Table Lamp Modern': 1800, 'Bed Runner Decorative': 700, 'Throw Blanket Cozy': 1000,
        'Curtain Rod Brass': 800, 'Wall Hanging Art': 2000, 'Photo Frame Wooden': 400,
        'Storage Box Plastic': 300, 'Organizer Drawer': 500, 'Carpet Floor Mat': 1500,
        'Mirror Wall Mounted': 1200,
        
        # Beauty & Personal Care
        'Face Wash Gel': 200, 'Moisturizer Cream': 400, 'Lipstick Matte': 350,
        'Sunscreen SPF50': 300, 'Shampoo Bottle': 250, 'Conditioner Hair': 280,
        'Body Lotion Pump': 350, 'Compact Mirror': 150, 'Hair Brush Detangle': 200,
        'Nail Cutter Set': 150, 'Deodorant Spray': 180, 'Face Pack Mask': 200,
        'Eye Cream Anti-Aging': 600,
        
        # Sports & Fitness
        'Yoga Mat Non-Slip': 800, 'Dumbbells Set Pair': 1500, 'Resistance Bands': 500,
        'Foam Roller': 1200, 'Jump Rope': 250, 'Push-Up Bar': 400, 'Water Bottle Sipper': 300,
        'Gym Gloves Leather': 450, 'Exercise Ball': 800, 'Meditation Cushion': 600,
        
        # Books & Stationery
        'Notebook A4 Plain': 100, 'Pen Set Premium': 200, 'Highlighter Pack': 150,
        'Sticky Notes Neon': 100, 'Novel Fiction Book': 300, 'Self-Help Book': 350,
        'Calendar 2026': 200, 'Bookmark Set': 80
    }
    
    data = []
    
    # Generate data for each product and platform combination
    for product in products:
        for platform in platforms:
            for date in date_range:
                # Generate price with upward/downward trends
                base_price = base_prices[product]
                
                # Add trend: slight increase over time
                days_elapsed = (date - start_date).days
                trend = (days_elapsed / 180) * (base_price * 0.15)  # 15% variation
                
                # Add periodic seasonality (peaks and valleys)
                seasonality = base_price * 0.10 * np.sin(days_elapsed * 2 * np.pi / 30)
                
                # Add random noise
                noise = np.random.normal(0, base_price * 0.05)
                
                # Calculate final price
                price = base_price + trend + seasonality + noise
                price = max(price * 0.7, price)  # Ensure price doesn't drop too much
                price = round(price, 2)
                
                # Discount varies by platform and time
                if platform == 'Amazon':
                    base_discount = np.random.uniform(5, 20)
                else:  # Flipkart
                    base_discount = np.random.uniform(8, 25)
                
                # Higher discounts on certain dates (sales events)
                if date.day in [1, 15, 25]:
                    base_discount *= 1.5
                
                discount = min(round(base_discount, 1), 50)  # Cap discount at 50%
                
                # Rating varies slightly by product consistency
                product_base_rating = np.random.uniform(3.5, 4.9)
                rating = min(round(product_base_rating + np.random.normal(0, 0.2), 1), 5.0)
                rating = max(rating, 3.0)
                
                data.append({
                    'product_name': product,
                    'platform': platform,
                    'date': date,
                    'price': price,
                    'discount': discount,
                    'rating': rating
                })
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Sort by product, platform, and date
    df = df.sort_values(['product_name', 'platform', 'date']).reset_index(drop=True)
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    
    # Save to CSV
    df.to_csv(output_path, index=False)
    
    print(f"✓ Synthetic dataset generated: {output_path}")
    print(f"  Total records: {len(df):,}")
    print(f"  Products: {len(df['product_name'].unique())}")
    print(f"  Platforms: {len(df['platform'].unique())} ({', '.join(df['platform'].unique())})")
    print(f"  Categories: Electronics, Fashion, Home & Living, Beauty, Sports, Stationery")
    print(f"  Date range: {df['date'].min().date()} to {df['date'].max().date()}")
    print(f"  Price range: ₹{df['price'].min():.0f} - ₹{df['price'].max():.0f}")
    print(f"\nDataset preview:")
    print(df.head(10))
    
    return df


if __name__ == '__main__':
    generate_synthetic_dataset()
