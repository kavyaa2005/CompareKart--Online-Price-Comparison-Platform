export interface Product {
  id: string;
  name: string;
  image: string;
  currentPrice: number;
  originalPrice?: number;
  category: string;
  brand: string;
  recommendation?: 'BUY' | 'WAIT';
  confidence?: number;
  aiReason?: string;
  platforms: Platform[];
  priceHistory: PricePoint[];
  lowestPrice: number;
  highestPrice: number;
}

export interface Platform {
  name: string;
  price: number;
  url: string;
  icon: string;
  inStock: boolean;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface Alert {
  id: string;
  productId: string;
  product: Product;
  condition: string;
  targetPrice: number;
  status: 'Active' | 'Triggered';
  createdAt: string;
  triggeredAt?: string;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=300&fit=crop',
    currentPrice: 349.99,
    originalPrice: 399.99,
    category: 'Electronics',
    brand: 'Sony',
    recommendation: 'BUY',
    confidence: 92,
    aiReason: 'Based on your budget and browsing behavior',
    lowestPrice: 329.99,
    highestPrice: 429.99,
    platforms: [
      { name: 'Amazon', price: 349.99, url: '#', icon: '🛒', inStock: true },
      { name: 'Best Buy', price: 369.99, url: '#', icon: '🏪', inStock: true },
      { name: 'Walmart', price: 359.99, url: '#', icon: '🏬', inStock: false },
    ],
    priceHistory: [
      { date: '2026-01-01', price: 399.99 },
      { date: '2026-01-05', price: 389.99 },
      { date: '2026-01-10', price: 379.99 },
      { date: '2026-01-15', price: 369.99 },
      { date: '2026-01-20', price: 359.99 },
      { date: '2026-01-25', price: 354.99 },
      { date: '2026-01-31', price: 349.99 },
    ],
  },
  {
    id: '2',
    name: 'Apple MacBook Air M2',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    currentPrice: 1099.00,
    originalPrice: 1199.00,
    category: 'Computers',
    brand: 'Apple',
    recommendation: 'BUY',
    confidence: 88,
    aiReason: 'Price dropped 15% in the last week',
    lowestPrice: 1049.00,
    highestPrice: 1299.00,
    platforms: [
      { name: 'Apple Store', price: 1099.00, url: '#', icon: '🍎', inStock: true },
      { name: 'Amazon', price: 1129.00, url: '#', icon: '🛒', inStock: true },
      { name: 'Best Buy', price: 1149.00, url: '#', icon: '🏪', inStock: true },
    ],
    priceHistory: [
      { date: '2026-01-01', price: 1199.00 },
      { date: '2026-01-05', price: 1189.00 },
      { date: '2026-01-10', price: 1179.00 },
      { date: '2026-01-15', price: 1159.00 },
      { date: '2026-01-20', price: 1139.00 },
      { date: '2026-01-25', price: 1119.00 },
      { date: '2026-01-31', price: 1099.00 },
    ],
  },
  {
    id: '3',
    name: 'Samsung Galaxy S24 Ultra',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop',
    currentPrice: 1299.99,
    originalPrice: 1299.99,
    category: 'Smartphones',
    brand: 'Samsung',
    recommendation: 'WAIT',
    confidence: 76,
    aiReason: 'Price expected to drop in 2 weeks',
    lowestPrice: 1199.99,
    highestPrice: 1399.99,
    platforms: [
      { name: 'Samsung', price: 1299.99, url: '#', icon: '📱', inStock: true },
      { name: 'Amazon', price: 1299.99, url: '#', icon: '🛒', inStock: true },
      { name: 'Best Buy', price: 1299.99, url: '#', icon: '🏪', inStock: true },
    ],
    priceHistory: [
      { date: '2026-01-01', price: 1299.99 },
      { date: '2026-01-05', price: 1299.99 },
      { date: '2026-01-10', price: 1289.99 },
      { date: '2026-01-15', price: 1299.99 },
      { date: '2026-01-20', price: 1299.99 },
      { date: '2026-01-25', price: 1299.99 },
      { date: '2026-01-31', price: 1299.99 },
    ],
  },
  {
    id: '4',
    name: 'Nike Air Max 270',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    currentPrice: 129.99,
    originalPrice: 159.99,
    category: 'Shoes',
    brand: 'Nike',
    recommendation: 'BUY',
    confidence: 85,
    aiReason: 'Matching your favorite brands',
    lowestPrice: 119.99,
    highestPrice: 179.99,
    platforms: [
      { name: 'Nike', price: 129.99, url: '#', icon: '👟', inStock: true },
      { name: 'Amazon', price: 139.99, url: '#', icon: '🛒', inStock: true },
      { name: 'Foot Locker', price: 149.99, url: '#', icon: '🏃', inStock: true },
    ],
    priceHistory: [
      { date: '2026-01-01', price: 159.99 },
      { date: '2026-01-05', price: 154.99 },
      { date: '2026-01-10', price: 149.99 },
      { date: '2026-01-15', price: 144.99 },
      { date: '2026-01-20', price: 139.99 },
      { date: '2026-01-25', price: 134.99 },
      { date: '2026-01-31', price: 129.99 },
    ],
  },
  {
    id: '5',
    name: 'Dyson V15 Detect Vacuum',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=300&fit=crop',
    currentPrice: 649.99,
    originalPrice: 749.99,
    category: 'Home Appliances',
    brand: 'Dyson',
    recommendation: 'BUY',
    confidence: 90,
    aiReason: 'Lowest price in 6 months',
    lowestPrice: 629.99,
    highestPrice: 799.99,
    platforms: [
      { name: 'Dyson', price: 649.99, url: '#', icon: '🏠', inStock: true },
      { name: 'Amazon', price: 669.99, url: '#', icon: '🛒', inStock: true },
      { name: 'Best Buy', price: 679.99, url: '#', icon: '🏪', inStock: false },
    ],
    priceHistory: [
      { date: '2026-01-01', price: 749.99 },
      { date: '2026-01-05', price: 729.99 },
      { date: '2026-01-10', price: 709.99 },
      { date: '2026-01-15', price: 689.99 },
      { date: '2026-01-20', price: 679.99 },
      { date: '2026-01-25', price: 664.99 },
      { date: '2026-01-31', price: 649.99 },
    ],
  },
  {
    id: '6',
    name: 'LG C3 OLED 55" TV',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop',
    currentPrice: 1399.99,
    originalPrice: 1799.99,
    category: 'Electronics',
    brand: 'LG',
    recommendation: 'BUY',
    confidence: 94,
    aiReason: 'Historic low price',
    lowestPrice: 1399.99,
    highestPrice: 1899.99,
    platforms: [
      { name: 'LG', price: 1399.99, url: '#', icon: '📺', inStock: true },
      { name: 'Amazon', price: 1449.99, url: '#', icon: '🛒', inStock: true },
      { name: 'Best Buy', price: 1429.99, url: '#', icon: '🏪', inStock: true },
    ],
    priceHistory: [
      { date: '2026-01-01', price: 1799.99 },
      { date: '2026-01-05', price: 1699.99 },
      { date: '2026-01-10', price: 1599.99 },
      { date: '2026-01-15', price: 1549.99 },
      { date: '2026-01-20', price: 1499.99 },
      { date: '2026-01-25', price: 1449.99 },
      { date: '2026-01-31', price: 1399.99 },
    ],
  },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    productId: '1',
    product: mockProducts[0],
    condition: 'Price drops below $350',
    targetPrice: 350,
    status: 'Triggered',
    createdAt: '2026-01-15',
    triggeredAt: '2026-01-31',
  },
  {
    id: '2',
    productId: '2',
    product: mockProducts[1],
    condition: 'Price drops below $1100',
    targetPrice: 1100,
    status: 'Triggered',
    createdAt: '2026-01-20',
    triggeredAt: '2026-01-31',
  },
  {
    id: '3',
    productId: '3',
    product: mockProducts[2],
    condition: 'Price drops below $1200',
    targetPrice: 1200,
    status: 'Active',
    createdAt: '2026-01-25',
  },
];

export const categories = [
  'Electronics',
  'Computers',
  'Smartphones',
  'Shoes',
  'Home Appliances',
  'Fashion',
  'Sports',
  'Books',
];

export const platforms = [
  'Amazon',
  'Best Buy',
  'Walmart',
  'Target',
  'eBay',
  'Apple Store',
  'Samsung',
  'Nike',
];
