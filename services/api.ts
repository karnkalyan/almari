import { Product, User, Order, Category, Address, PromoCode, Offer, FlashSale, SiteSettings, BlogPost, Brand, Review, Expense, Purchase, ProductAdditionalService, ProductFlag } from '../types';
import { API_BASE_URL } from '../constants';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private normalizeProduct(product: any): Product {
    const categoryName = typeof product.category === 'string'
      ? product.category
      : product.category?.name || product.categoryName || '';

    return {
      ...product,
      price: Number(product.price || 0),
      originalPrice: product.originalPrice == null ? undefined : Number(product.originalPrice),
      discount: product.discount == null ? undefined : Number(product.discount),
      primaryImage: product.primaryImage || product.image || '',
      image: product.primaryImage || product.image || '',
      images: Array.isArray(product.images) ? product.images : [],
      category: categoryName,
      categoryId: product.categoryId || product.category?.id || '',
      brandId: product.brandId || product.brandRef?.id,
      brandRef: product.brandRef,
      rating: Number(product.rating || 0),
      reviews: Number(product.reviews || 0),
      inStock: product.inStock ?? true,
      additionalServices: Array.isArray(product.additionalServices) ? product.additionalServices : [],
      flags: (product.customFlags || []).map((fa: any) => fa.flag?.name).filter(Boolean),
      flagSlugs: (product.customFlags || []).map((fa: any) => fa.flag?.id).filter(Boolean),
    } as Product;
  }

  private normalizeOrder(order: any): Order {
    return {
      ...order,
      date: order.date || order.createdAt,
      total: Number(order.total || 0),
      shippingCharge: Number(order.shippingCharge || 0),
      items: (order.items || []).map((item: any) => {
        const product = item.product ? this.normalizeProduct(item.product) : this.normalizeProduct(item);
        return {
          ...product,
          id: product.id || item.productId || item.id,
          productId: item.productId || product.id,
          quantity: Number(item.quantity || 1),
          price: Number(item.price ?? product.price ?? 0),
          selectedServices: Array.isArray(item.selectedServices) ? item.selectedServices : [],
          serviceTotal: Number(item.serviceTotal || 0),
        };
      }),
    };
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  }

    async register(name: string, email: string, password: string, phone?: string): Promise<{ user: User; token: string }> {

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone }),

    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  }

  // Products
  async getProducts(params?: { category?: string; search?: string; page?: number; limit?: number; flag?: string }): Promise<{ products: Product[]; total: number; page: number; pages: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.flag) query.append('flag', params.flag);

    const response = await fetch(`${API_BASE_URL}/products?${query}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return {
      ...data,
      products: (data.products || []).map((product: any) => this.normalizeProduct(product)),
    };
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return this.normalizeProduct(await response.json());
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return this.normalizeProduct(await response.json());
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return this.normalizeProduct(await response.json());
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete product');
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }

  async createCategory(category: { name: string; description?: string; parentId?: string; image?: string }): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete category');
  }

  async getBrands(): Promise<Brand[]> {
    const response = await fetch(`${API_BASE_URL}/brands`);
    if (!response.ok) throw new Error('Failed to fetch brands');
    return response.json();
  }

  async createBrand(brand: Partial<Brand>): Promise<Brand> {
    const response = await fetch(`${API_BASE_URL}/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(brand),
    });
    if (!response.ok) throw new Error('Failed to create brand');
    return response.json();
  }

  async updateBrand(id: string, brand: Partial<Brand>): Promise<Brand> {
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(brand),
    });
    if (!response.ok) throw new Error('Failed to update brand');
    return response.json();
  }

  async deleteBrand(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete brand');
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return (await response.json()).map((order: any) => this.normalizeOrder(order));
  }

  async getUserOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE_URL}/orders/my`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return (await response.json()).map((order: any) => this.normalizeOrder(order));
  }

  async getOrder(id: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch order');
    return this.normalizeOrder(await response.json());
  }

  async createOrder(order: { addressId?: string; address?: any; customer?: any; items: { productId: string; quantity: number; price: number; selectedServices?: ProductAdditionalService[] }[]; total: number; shippingCharge?: number; promoCode?: string }): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return this.normalizeOrder(await response.json());
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update order');
    return this.normalizeOrder(await response.json());
  }

  // Addresses
  async getUserAddresses(): Promise<Address[]> {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch addresses');
    return response.json();
  }

  async createAddress(address: { type: string; street: string; city: string; state: string; zipCode: string; country: string; isDefault?: boolean }): Promise<Address> {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(address),
    });
    if (!response.ok) throw new Error('Failed to create address');
    return response.json();
  }

  async updateAddress(id: string, address: Partial<Address>): Promise<Address> {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(address),
    });
    if (!response.ok) throw new Error('Failed to update address');
    return response.json();
  }

  async deleteAddress(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete address');
  }

  // Users
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch user');
    const user = await response.json();
    return { ...user, orders: (user.orders || []).map((order: any) => this.normalizeOrder(order)) };
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  }

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error('Failed to update user role');
    return response.json();
  }

  // Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    const response = await fetch(`${API_BASE_URL}/promo-codes`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch promo codes');
    return response.json();
  }

  async createPromoCode(promoCode: { code: string; discountType: string; discountValue: number; minOrderValue?: number; maxDiscount?: number; expiresAt?: string; usageLimit?: number }): Promise<PromoCode> {
    const response = await fetch(`${API_BASE_URL}/promo-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(promoCode),
    });
    if (!response.ok) throw new Error('Failed to create promo code');
    return response.json();
  }

  async updatePromoCode(id: string, promoCode: Partial<PromoCode>): Promise<PromoCode> {
    const response = await fetch(`${API_BASE_URL}/promo-codes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(promoCode),
    });
    if (!response.ok) throw new Error('Failed to update promo code');
    return response.json();
  }

  async deletePromoCode(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/promo-codes/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete promo code');
  }

  async validatePromoCode(code: string, orderTotal: number): Promise<{ promoCode: PromoCode; discount: number }> {
    const response = await fetch(`${API_BASE_URL}/promo-codes/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ code, orderTotal }),
    });
    if (!response.ok) throw new Error('Failed to validate promo code');
    return response.json();
  }

  // Offers
  async getOffers(): Promise<Offer[]> {
    const response = await fetch(`${API_BASE_URL}/offers`);
    if (!response.ok) throw new Error('Failed to fetch offers');
    return response.json();
  }

  async createOffer(offer: { title: string; description?: string; discountType: string; discountValue: number; applicableCategories: string[]; applicableProducts: string[]; startsAt?: string; endsAt?: string }): Promise<Offer> {
    const response = await fetch(`${API_BASE_URL}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(offer),
    });
    if (!response.ok) throw new Error('Failed to create offer');
    return response.json();
  }

  async updateOffer(id: string, offer: Partial<Offer>): Promise<Offer> {
    const response = await fetch(`${API_BASE_URL}/offers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(offer),
    });
    if (!response.ok) throw new Error('Failed to update offer');
    return response.json();
  }

  async deleteOffer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/offers/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete offer');
  }

  // Flash Sales
  async getFlashSales(): Promise<FlashSale[]> {
    const response = await fetch(`${API_BASE_URL}/flash-sales`);
    if (!response.ok) throw new Error('Failed to fetch flash sales');
    return response.json();
  }

  async createFlashSale(flashSale: { title: string; description?: string; discountPercentage: number; startsAt: string; endsAt: string; products: { productId: string; originalPrice: number; salePrice: number }[] }): Promise<FlashSale> {
    const response = await fetch(`${API_BASE_URL}/flash-sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(flashSale),
    });
    if (!response.ok) throw new Error('Failed to create flash sale');
    return response.json();
  }

  async updateFlashSale(id: string, flashSale: Partial<FlashSale> & { products?: { productId: string; originalPrice: number; salePrice: number }[] }): Promise<FlashSale> {
    const response = await fetch(`${API_BASE_URL}/flash-sales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(flashSale),
    });
    if (!response.ok) throw new Error('Failed to update flash sale');
    return response.json();
  }

  async deleteFlashSale(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/flash-sales/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete flash sale');
  }

  async getBlogPosts(all = false): Promise<BlogPost[]> {
    const response = await fetch(`${API_BASE_URL}/blog${all ? '?all=true' : ''}`);
    if (!response.ok) throw new Error('Failed to fetch blog posts');
    return response.json();
  }

  async getBlogPost(idOrSlug: string): Promise<BlogPost> {
    const response = await fetch(`${API_BASE_URL}/blog/${encodeURIComponent(idOrSlug)}`);
    if (!response.ok) throw new Error('Failed to fetch blog post');
    return response.json();
  }

  async createBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
    const response = await fetch(`${API_BASE_URL}/blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(post),
    });
    if (!response.ok) throw new Error('Failed to create blog post');
    return response.json();
  }

  async updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost> {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(post),
    });
    if (!response.ok) throw new Error('Failed to update blog post');
    return response.json();
  }

  async deleteBlogPost(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete blog post');
  }

  async getReviews(productId?: string): Promise<Review[]> {
    const response = await fetch(`${API_BASE_URL}/reviews${productId ? `?productId=${productId}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  }

  async createReview(review: Partial<Review>): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(review),
    });
    if (!response.ok) throw new Error('Failed to create review');
    return response.json();
  }

  async updateReview(id: string, review: Partial<Review>): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(review),
    });
    if (!response.ok) throw new Error('Failed to update review');
    return response.json();
  }

  async deleteReview(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete review');
  }

  async getCart(userId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
  }

  async saveCartItem(userId: string, productId: string, quantity: number, selectedOptions?: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ userId, productId, quantity, selectedOptions }),
    });
    if (!response.ok) throw new Error('Failed to save cart item');
    return response.json();
  }

  async getWishlist(userId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/wishlist?userId=${userId}`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch wishlist');
    return response.json();
  }

  async addWishlistItem(userId: string, productId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ userId, productId }),
    });
    if (!response.ok) throw new Error('Failed to add wishlist item');
    return response.json();
  }

  async deleteWishlistItem(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/wishlist/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete wishlist item');
  }

  // Site Settings
  async getSiteSettings(): Promise<Record<string, any>> {
    const response = await fetch(`${API_BASE_URL}/site-settings`);
    if (!response.ok) throw new Error('Failed to fetch site settings');
    return response.json();
  }

  async updateSiteSetting(key: string, value: any, description?: string): Promise<SiteSettings> {
    const response = await fetch(`${API_BASE_URL}/site-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ key, value, description }),
    });
    if (!response.ok) throw new Error('Failed to update site setting');
    return response.json();
  }

  async getExpenses(): Promise<Expense[]> {
    const response = await fetch(`${API_BASE_URL}/expenses`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch expenses');
    return response.json();
  }

  async createExpense(expense: Partial<Expense>): Promise<Expense> {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(expense),
    });
    if (!response.ok) throw new Error('Failed to create expense');
    return response.json();
  }

  async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(expense),
    });
    if (!response.ok) throw new Error('Failed to update expense');
    return response.json();
  }

  async deleteExpense(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete expense');
  }

  async getPurchases(): Promise<Purchase[]> {
    const response = await fetch(`${API_BASE_URL}/purchases`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch purchases');
    return response.json();
  }

  async createPurchase(purchase: Partial<Purchase>): Promise<Purchase> {
    const response = await fetch(`${API_BASE_URL}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(purchase),
    });
    if (!response.ok) throw new Error('Failed to create purchase');
    return response.json();
  }

  async updatePurchase(id: string, purchase: Partial<Purchase>): Promise<Purchase> {
    const response = await fetch(`${API_BASE_URL}/purchases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(purchase),
    });
    if (!response.ok) throw new Error('Failed to update purchase');
    return response.json();
  }

  async deletePurchase(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/purchases/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete purchase');
  }

  async getProductFlags(): Promise<ProductFlag[]> {
    const response = await fetch(`${API_BASE_URL}/product-flags`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch product flags');
    const data = await response.json();
    return (data || []).map((flag: any) => ({
      ...flag,
      products: (flag.products || []).map((assignment: any) => this.normalizeProduct(assignment.product)),
      productIds: (flag.products || []).map((assignment: any) => assignment.productId),
    }));
  }

  async createProductFlag(payload: Partial<ProductFlag>): Promise<ProductFlag> {
    const response = await fetch(`${API_BASE_URL}/product-flags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create product flag');
    return response.json();
  }

  async updateProductFlag(id: string, payload: Partial<ProductFlag>): Promise<ProductFlag> {
    const response = await fetch(`${API_BASE_URL}/product-flags/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update product flag');
    return response.json();
  }

  async deleteProductFlag(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/product-flags/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete product flag');
  }

  async setFlagProducts(id: string, productIds: string[]): Promise<ProductFlag> {
    const response = await fetch(`${API_BASE_URL}/product-flags/${id}/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ productIds }),
    });
    if (!response.ok) throw new Error('Failed to set flag products');
    const flag = await response.json();
    return {
      ...flag,
      products: (flag.products || []).map((assignment: any) => this.normalizeProduct(assignment.product)),
      productIds: (flag.products || []).map((assignment: any) => assignment.productId),
    };
  }

  async getProductsWithFlags(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/products/with-flags`);
    if (!response.ok) throw new Error('Failed to fetch products with flags');
    const data = await response.json();
    return (data || []).map((p: any) => this.normalizeProduct(p));
  }

  // Conversations (Real-time Chat)
  async getConversations(userId?: string): Promise<any[]> {
    const query = userId ? `?userId=${userId}` : '';
    const response = await fetch(`${API_BASE_URL}/conversations${query}`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
  }

  async createConversation(
    userId: string | undefined,
    subject: string,
    guest?: { name?: string; email?: string; phone?: string }
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({
        userId,
        subject,
        guestName: guest?.name,
        guestEmail: guest?.email,
        phone: guest?.phone,
      }),
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    return response.json();
  }

  async getConversationMessages(conversationId: string, markRead?: 'admin' | 'customer'): Promise<any[]> {
    const query = markRead ? `?markRead=${markRead}` : '';
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages${query}`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  }

  async sendMessage(conversationId: string, text: string, sender: 'customer' | 'admin'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ text, sender }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  }

  async updateConversationStatus(id: string, status: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/conversations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update conversation');
    return response.json();
  }

  async deleteConversation(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete conversation');
  }
  // Homepage CMS
  async getHomepageSections(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/homepage`);
    if (!response.ok) throw new Error('Failed to fetch sections');
    return response.json();
  }
  async createHomepageSection(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/homepage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() }, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create section');
    return response.json();
  }
  async updateHomepageSection(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/homepage/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() }, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update section');
    return response.json();
  }
  async deleteHomepageSection(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/homepage/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete section');
  }
  async reorderHomepageSections(sectionIds: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/homepage/reorder`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() }, body: JSON.stringify({ sectionIds })
    });
    if (!response.ok) throw new Error('Failed to reorder sections');
  }
  async createHomepageSectionItem(sectionId: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/homepage/${sectionId}/items`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() }, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create item');
    return response.json();
  }
  async updateHomepageSectionItem(itemId: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/homepage/items/${itemId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() }, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update item');
    return response.json();
  }
  async deleteHomepageSectionItem(itemId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/homepage/items/${itemId}`, { method: 'DELETE', headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to delete item');
  }

  // Advanced Settings
  async getAdvancedSettings(endpoint: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/advanced-settings/${endpoint}`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return response.json();
  }
  async updateAdvancedSettings(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/advanced-settings/${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() }, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update ${endpoint}`);
    return response.json();
  }
}

export const apiService = new ApiService();
