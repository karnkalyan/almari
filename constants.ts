export const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

export const CATEGORIES = [
  "Fruits & Vegetables",
  "Meats & Seafood",
  "Breakfast & Dairy",
  "Breads & Bakery",
  "Beverages",
  "Frozen Foods",
  "Grocery & Staples",
  "Household Needs",
  "Healthcare",
  "Fashion & Clothing",
  "Electronics",
  "Home & Furniture"
];

export const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
    priceText: 'From NPR 150',
    oldPriceText: '250',
  },
];

export const MOCK_COUPONS = [
  {
    id: 1,
    code: 'WELCOME10',
    discount: '10%',
    type: 'percentage',
    expiry: '2024-12-31',
    status: 'Active',
    usage: 45
  },
  {
    id: 2,
    code: 'SAVE50',
    discount: 'NPR 50',
    type: 'fixed',
    expiry: '2024-11-30',
    status: 'Active',
    usage: 23
  },
  {
    id: 3,
    code: 'EXPIRED20',
    discount: '20%',
    type: 'percentage',
    expiry: '2024-01-01',
    status: 'Expired',
    usage: 12
  }
];

export const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+977 9841234567',
    orders: 5,
    totalSpent: 2500,
    status: 'Active',
    joinDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+977 9847654321',
    orders: 3,
    totalSpent: 1800,
    status: 'Active',
    joinDate: '2024-02-20'
  }
];

export const MOCK_ORDERS = [
  {
    id: 1,
    customerName: 'John Doe',
    email: 'john@example.com',
    total: 1250,
    status: 'Delivered',
    date: '2024-10-15',
    items: [
      { name: 'Apple', quantity: 5, price: 200 },
      { name: 'Banana', quantity: 3, price: 150 }
    ]
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    email: 'jane@example.com',
    total: 850,
    status: 'Processing',
    date: '2024-10-14',
    items: [
      { name: 'Milk', quantity: 2, price: 400 },
      { name: 'Bread', quantity: 1, price: 50 }
    ]
  }
];

export const MOCK_MESSAGES = [
  {
    id: 1,
    customerName: 'John Doe',
    email: 'john@example.com',
    subject: 'Order Inquiry',
    message: 'When will my order be delivered?',
    date: '2024-10-15',
    status: 'Unread'
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    email: 'jane@example.com',
    subject: 'Product Question',
    message: 'Is the milk organic?',
    date: '2024-10-14',
    status: 'Read'
  }
];

export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Fresh Apple',
    price: 200,
    category: 'Fruits & Vegetables',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=300',
    description: 'Fresh red apples from local farms'
  },
  {
    id: 2,
    name: 'Banana',
    price: 150,
    category: 'Fruits & Vegetables',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?auto=format&fit=crop&q=80&w=300',
    description: 'Sweet bananas'
  },
  {
    id: 3,
    name: 'Milk',
    price: 400,
    category: 'Breakfast & Dairy',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300',
    description: 'Fresh cow milk'
  }
];

export const MOCK_ADDRESS = {
  firstName: 'John',
  lastName: 'Doe',
  street: '123 Main Street',
  apartment: 'Apt 4B',
  city: 'Kathmandu',
  state: 'Bagmati',
  zipCode: '44600',
  zip: '44600',
  country: 'Nepal',
  phone: '+977 9801234567',
  email: 'john@example.com'
};

// API Service instance for components that need it
export const apiService = {
  // This will be replaced with actual API calls
  getProducts: () => Promise.resolve(MOCK_PRODUCTS),
  getOrders: () => Promise.resolve(MOCK_ORDERS),
  getCustomers: () => Promise.resolve(MOCK_CUSTOMERS),
  getCoupons: () => Promise.resolve(MOCK_COUPONS),
  getMessages: () => Promise.resolve(MOCK_MESSAGES)
};
