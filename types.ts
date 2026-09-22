
export interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  primaryImage: string;
  image?: string;
  images?: string[];
  categoryId: string;
  parentCategoryId?: string;
  category: string;
  brandId?: string;
  brand?: string;
  brandRef?: Brand;
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  weight?: string;
  dimensions?: string;
  tags?: string[];
  specifications?: ProductSpecification[];
  options?: ProductOption[];
  additionalServices?: ProductAdditionalService[];
  metaTitle?: string;
  metaDescription?: string;
  sku?: string;
  isFlashDeal?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isDynamic?: boolean;
  isBestSeller?: boolean;
  isRecommended?: boolean;
  isPopular?: boolean;
  showOnHomepage?: boolean;
  createdAt?: string;
  updatedAt?: string;
  flags?: string[];
  flagSlugs?: string[];
  customFlags?: { flag: ProductFlag }[];
}

export interface ProductFlagAssignment {
  id: string;
  productId: string;
  flagId: string;
  product?: Product;
  flag: ProductFlag;
}

export interface CartItem extends Product {
  productId?: string;
  quantity: number;
  selectedServices?: ProductAdditionalService[];
  serviceTotal?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  addresses?: Address[];
  orders?: Order[];
  createdAt?: string;
}

export interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  shippingCharge?: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  address?: Address;
  promoCode?: PromoCode;
}

export interface Category {
  id: string;
  parentId?: string;
  name: string;
  description?: string;
  image?: string;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
}

export interface ProductSpecification {
  id?: string;
  name: string;
  value: string;
  type?: 'text' | 'rich';
}

export interface ProductOption {
  id?: string;
  name: string;
  values: string[];
}

export interface ProductAdditionalService {
  id?: string;
  title: string;
  description?: string;
  amount: number;
}

export interface ProductFlag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  isActive: boolean;
  productIds?: string[];
  products?: Product[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  user?: User;
  product?: Product;
  createdAt?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  isActive: boolean;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicableCategories: string[];
  applicableProducts: string[];
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
}

export interface FlashSale {
  id: string;
  title: string;
  description?: string;
  discountPercentage: number;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  products: FlashSaleProduct[];
}

export interface FlashSaleProduct {
  id: string;
  flashSaleId: string;
  productId: string;
  product: Product;
  originalPrice: number;
  salePrice: number;
}

export interface SiteSettings {
  id: string;
  key: string;
  value: string;
  description?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteCustomization {
  storeName?: string;
  logoText?: string;
  logoImage?: string;
  primaryColor?: string;
  accentColor?: string;
  topBarText?: string;
  topBarEnabled?: boolean;
  topBarBackgroundColor?: string;
  topBarTextColor?: string;
  topBarShowAdminLink?: boolean;
  topBarShowLanguage?: boolean;
  topBarShowCurrency?: boolean;
  supportPhone?: string;
  supportEmail?: string;
  adminAlertEmail?: string;
  address?: string;
  footerAbout?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroBadge?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  quaternaryColor?: string;
  accentHighlights?: string;
  announcements?: { text: string; link?: string; isActive: boolean }[];
  announcementSpeed?: number;
  showHeroSection?: boolean;
  showShopByBrand?: boolean;
  showFlashDeals?: boolean;
  showPromoCards?: boolean;
  showCategories?: boolean;
  merchantQrCode?: string;
  merchantQrName?: string;
  merchantQrAccountName?: string;
  merchantQrAccountNumber?: string;
  merchantQrInstructions?: string;
  copyrightText?: string;
  paymentPartners?: { name: string; logo: string; enabled: boolean }[];
  chatSettings?: {
    enabled: boolean;
    welcomeMessage: string;
    faq?: { question: string; answer: string }[];
    autoReplies?: { trigger: string; response: string }[];
    collectGuestInfo: boolean;
  };
  emailTemplates?: {
    orderConfirmation?: string;
    orderStatusUpdate?: string;
    welcomeEmail?: string;
  };
  smsTemplates?: {
    orderPlaced?: string;
    orderShipped?: string;
  };
  heroSlides?: HeroSlide[];
  heroSideCards?: HeroSideCard[];
  heroBottomCards?: any[];
  flashPopupEnabled?: boolean;
  flashPopupTitle?: string;
  flashPopupText?: string;
  flashPopupImage?: string;
  promoBanners?: { title: string; image: string; color: string; link?: string; badge?: string; position?: 'afterHero' | 'afterProducts' | 'beforeFooter'; showOnHomepage?: boolean }[];
  navItems?: { label: string; url: string }[];
  footerColumns?: FooterColumn[];
  footerBusinessHours?: string;
  footerNewsletterTitle?: string;
  footerNewsletterSubtitle?: string;
  templateSettings?: TemplateSettings;
  homepageProductSections?: HomepageProductSection[];
  homeSections?: {
    showPromoBanners?: boolean;
    showNewArrivals?: boolean;
    showBestSellers?: boolean;
    showTrending?: boolean;
    showRecommended?: boolean;
    showFlashDeals?: boolean;
    showDynamic?: boolean;
    showCategorySections?: boolean;
    showFeatures?: boolean;
  };
  maxProductImageSizeMb?: number;
  smtpSettings?: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    adminEmail: string;
    enabled: boolean;
  };
  smsSettings?: {
    enabled: boolean;
    provider: string;
    accountSid?: string;
    authToken?: string;
    fromNumber?: string;
    // Aakash SMS specific
    aakashToken?: string;
  };
  newsletters?: { email: string; subscribedAt: string }[];
  favicon?: string;
  metaTitle?: string;
  about_hero_title?: string;
  about_hero_subtitle?: string;
  about_hero_image?: string;
  about_story_title?: string;
  about_story_content?: string;
  about_story_image?: string;
  stat_customers?: string;
  stat_products?: string;
  stat_delivery?: string;
  stat_support?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: string;
}

export interface HeroSlide {
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonUrl: string;
  priceText?: string;
  oldPriceText?: string;
  textColor?: string;
  enabled?: boolean;
}

export type UserRole = 'customer' | 'editor' | 'admin' | 'super_admin' | 'sell_staff' | 'crm_staff';

export interface HeroSideCard {
  eyebrow: string;
  title: string;
  image: string;
  buttonText: string;
  buttonUrl: string;
  backgroundColor?: string;
  enabled?: boolean;
}

export interface DealBanner {
  enabled: boolean;
  badge: string;
  timerText: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  image: string;
  backgroundColor: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

export interface TemplateSettings {
  homepageTemplate: 'classic' | 'market' | 'editorial' | 'compact' | 'campaign' | 'modern';
  shopTemplate: 'sidebar' | 'topFilters' | 'denseGrid' | 'wideCards' | 'minimal' | 'editorial';
  productTemplate: 'classic' | 'galleryLeft' | 'marketplace' | 'technical' | 'story' | 'modern';
  productCardTemplate?: 'classic' | 'market' | 'editorial' | 'compact' | 'campaign' | 'modern';
}

export interface HomepageProductSection {
  title: string;
  subtitle?: string;
  flag: 'isNew' | 'isFeatured' | 'isBestSeller' | 'isTrending' | 'isRecommended' | 'isPopular' | 'isFlashDeal' | 'isDynamic';
  enabled: boolean;
  limit?: number;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMode?: string;
  reference?: string;
  notes?: string;
}

export interface PurchaseItem {
  id?: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitCost: number;
  total?: number;
}

export interface Purchase {
  id: string;
  supplier: string;
  invoiceNo?: string;
  date: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  notes?: string;
  items: PurchaseItem[];
}
