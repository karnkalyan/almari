import React, { useContext, useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShopContext } from '../App';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { Star, Truck, ShieldCheck, Heart, Plus, Minus, Check, Zap, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, site } = useContext(ShopContext);
  const { user, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'info' | 'reviews'>('desc');
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [selectedServiceTitles, setSelectedServiceTitles] = useState<string[]>([]);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const primaryColor = site?.primaryColor || '#002D42';
  const accentColor = site?.accentColor || '#D49B24';

  const resolvedUserId = user?.id || (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw).id : '';
    } catch {
      return '';
    }
  })();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const found = await apiService.getProduct(id);
        setProduct(found);
        setSelectedImage(0);
        setSelectedServiceTitles([]);
        setWishlistItemId(null);
        
        const response = await apiService.getProducts({ limit: 20 });
        setRelatedProducts(response.products.filter(p => p.category === found.category && p.id !== found.id).slice(0, 4));
        
        if (resolvedUserId) {
          const wishlist = await apiService.getWishlist(resolvedUserId).catch(() => []);
          const existing = wishlist.find((item: any) => item.productId === found.id);
          setWishlistItemId(existing?.id || null);
        }
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, resolvedUserId]);

  const toggleWishlist = async () => {
    if (!product) return;
    if (!resolvedUserId && authLoading) return;
    if (!resolvedUserId) {
      toast.error('Please log in to use wishlist');
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      if (wishlistItemId) {
        await apiService.deleteWishlistItem(wishlistItemId);
        setWishlistItemId(null);
        window.dispatchEvent(new CustomEvent('wishlist:changed'));
        toast.success('Removed from wishlist');
      } else {
        const created = await apiService.addWishlistItem(resolvedUserId, product.id);
        setWishlistItemId(created.id);
        window.dispatchEvent(new CustomEvent('wishlist:changed'));
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = () => {
    const selectedServices = (product?.additionalServices || []).filter(service => selectedServiceTitles.includes(service.title));
    const serviceTitles = selectedServices.map(service => service.title);
    for(let i=0; i<quantity; i++) {
        if (product) addToCart(product, serviceTitles);
    }
    toast.success(`Added ${quantity} item(s) to your cart!`);
  };

  const images = product ? (product.images?.length ? product.images : [product.primaryImage || product.image || '']) : [];
  const approvedReviews = ((product as any)?.reviewItems || []) as any[];

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast.error('Please log in to review this product');
      navigate('/login');
      return;
    }
    await apiService.createReview({ productId: product!.id, userId: user.id, ...reviewForm });
    toast.success('Review submitted for approval');
    setReviewForm({ rating: 5, title: '', comment: '' });
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-[var(--brand-primary)] rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Product Details...</p>
    </div>
  );

  if (!product) return (
    <div className="container mx-auto px-4 py-24 text-center">
      <p className="text-2xl font-black text-slate-800 mb-4">Product Not Found</p>
      <Link to="/shop" className="text-sm font-bold underline" style={{ color: primaryColor }}>Browse All Products</Link>
    </div>
  );

  return (
    <div className="bg-slate-50/50 min-h-screen pb-16">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-100 py-3 mb-6">
        <div className="container mx-auto px-4 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex-wrap">
          <Link to="/" className="hover:text-slate-800 transition-colors">Home</Link> 
          <span>/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-slate-800 transition-colors">{product.category}</Link> 
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-xs md:max-w-md">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Main Details Section */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 mb-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Gallery Column (5 of 12 cols) */}
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-4">
               <div className="relative bg-slate-50 rounded-3xl overflow-hidden aspect-square w-full border border-slate-100 shadow-inner group">
                 {product.discount && (
                   <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full z-10 shadow-md flex items-center gap-1 backdrop-blur-sm">
                     <Zap size={12} fill="currentColor" /> {product.discount}% OFF
                   </span>
                 )}
                 {product.isNew && (
                   <span className="absolute top-4 right-4 text-white text-xs font-black px-3 py-1 rounded-full z-10 shadow-md uppercase tracking-wider" style={{ backgroundColor: primaryColor }}>
                     NEW
                   </span>
                 )}
                 <img 
                   src={images[selectedImage]} 
                   alt={product.name} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                 />
               </div>

               {/* Thumbnails */}
               {images.length > 1 && (
                 <div className="flex gap-3 overflow-x-auto pb-2">
                   {images.map((img, i) => (
                     <button 
                       key={i} 
                       className={`w-20 h-20 rounded-2xl p-1 bg-slate-50 flex items-center justify-center overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === i ? 'border-[var(--brand-primary)] shadow-md ring-2 ring-[var(--brand-primary)]/20 scale-105' : 'border-slate-100 hover:border-slate-300'}`}
                       onClick={() => setSelectedImage(i)}
                     >
                        <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
                     </button>
                   ))}
                 </div>
               )}
            </div>

            {/* Info Column (7 of 12 cols) */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-between">
               <div>
                  {/* Category Pill */}
                  <div className="mb-3">
                    <span className="inline-block text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                      {product.category}
                    </span>
                  </div>
                  
                  {/* Product Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
                    {product.name}
                  </h1>
                  
                  {/* Rating & In-Stock Meta Bar */}
                  <div className="flex flex-wrap items-center gap-4 mb-6 text-xs font-bold pb-5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} fill={i < Math.floor(product.rating || 5) ? "currentColor" : "none"} className={i < Math.floor(product.rating || 5) ? "" : "text-slate-200"} />
                        ))}
                      </div>
                      <span className="text-slate-700 font-black">{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
                      <span className="text-slate-400 font-medium">({product.reviews || approvedReviews.length || 0} reviews)</span>
                    </div>

                    <span className="text-slate-300">|</span>
                    <span className="text-slate-400">SKU: <span className="text-slate-700 font-bold">{product.sku || `ALM-${product.id}`}</span></span>

                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-extrabold uppercase tracking-wider text-[11px]">In Stock</span>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-4 mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      NPR {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-slate-400 line-through font-semibold">
                          NPR {product.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                          Save NPR {(product.originalPrice - product.price).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Short Description */}
                  {product.description && (
                    <div className="mb-8">
                      <p className="text-slate-600 leading-relaxed text-sm md:text-base">{product.description}</p>
                    </div>
                  )}

                  {/* Additional Add-on Services */}
                  {(product.additionalServices || []).length > 0 && (
                    <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <h3 className="text-xs font-black text-slate-800 mb-3 uppercase tracking-wider">Custom Add-on Services</h3>
                      <div className="space-y-2.5">
                        {(product.additionalServices || []).map((service, index) => (
                          <label key={index} className="flex items-center justify-between gap-3 text-sm cursor-pointer p-2 rounded-xl hover:bg-white transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${selectedServiceTitles.includes(service.title) ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-slate-300 bg-white'}`}>
                                {selectedServiceTitles.includes(service.title) && <Check size={13} className="text-white" />}
                              </div>
                              <input
                                type="checkbox"
                                checked={selectedServiceTitles.includes(service.title)}
                                onChange={(event) => {
                                  setSelectedServiceTitles((prev) =>
                                    event.target.checked ? [...prev, service.title] : prev.filter((title) => title !== service.title)
                                  );
                                }}
                                className="hidden"
                              />
                              <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{service.title}</span>
                            </div>
                            <span className="font-black text-xs px-2 py-1 rounded-md bg-white border border-slate-100 text-slate-800">+ NPR {service.amount.toLocaleString()}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
               </div>

               {/* Quantity & CTA Row */}
               <div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 pt-4 border-t border-slate-100">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-slate-50 rounded-2xl h-14 w-full sm:w-36 px-2 border border-slate-200/80">
                       <button 
                         className="w-10 h-10 hover:bg-white hover:shadow-sm rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all disabled:opacity-30"
                         onClick={() => setQuantity(Math.max(1, quantity - 1))}
                         disabled={quantity <= 1}
                         title="Decrease quantity"
                       >
                         <Minus size={16} />
                       </button>
                       <div className="flex-1 text-center font-black text-slate-900 text-base">{quantity}</div>
                       <button 
                         className="w-10 h-10 hover:bg-white hover:shadow-sm rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all"
                         onClick={() => setQuantity(quantity + 1)}
                         title="Increase quantity"
                       >
                         <Plus size={16} />
                       </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                      className="w-full sm:flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                      style={{ backgroundColor: primaryColor }}
                      onClick={handleAddToCart}
                    >
                      <span>Add to Shopping Cart</span>
                    </button>

                    {/* Wishlist Button */}
                    <button 
                      onClick={toggleWishlist} 
                      disabled={wishlistLoading} 
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all border-2 flex-shrink-0 ${wishlistItemId ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-500'} ${wishlistLoading ? 'opacity-50' : ''}`}
                      title={wishlistItemId ? "Remove from wishlist" : "Add to wishlist"}
                    >
                       <Heart size={22} fill={wishlistItemId ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Value Propositions / Guarantee Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                         <Truck size={17} />
                       </div>
                       <div>
                         <p className="text-xs font-black text-slate-800 leading-tight">Free Delivery</p>
                         <p className="text-[10px] text-slate-500 font-medium">Inside Ring Road</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                         <RotateCcw size={17} />
                       </div>
                       <div>
                         <p className="text-xs font-black text-slate-800 leading-tight">Easy Returns</p>
                         <p className="text-[10px] text-slate-500 font-medium">7-Day Guarantee</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                         <ShieldCheck size={17} />
                       </div>
                       <div>
                         <p className="text-xs font-black text-slate-800 leading-tight">100% Genuine</p>
                         <p className="text-[10px] text-slate-500 font-medium">Verified Product</p>
                       </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Info / Reviews */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 mb-12 shadow-sm">
           <div className="flex border-b border-slate-100 mb-8 overflow-x-auto gap-2">
             {['Description', 'Specifications', `Reviews (${approvedReviews.length})`].map((tab, i) => {
               const key = ['desc', 'info', 'reviews'][i] as any;
               const isActive = activeTab === key;
               return (
                 <button 
                   key={key}
                   className={`px-8 py-4 font-black text-xs uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${isActive ? 'border-[var(--brand-primary)] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                   onClick={() => setActiveTab(key)}
                 >
                   {tab}
                 </button>
               );
             })}
           </div>

           <div className="min-h-[160px]">
             {activeTab === 'desc' && (
               <div className="text-slate-600 leading-relaxed text-sm md:text-base">
                 <p className="mb-6">{product.description}</p>
                 {product.longDescription && <div className="prose max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: product.longDescription }} />}
               </div>
             )}
             {activeTab === 'info' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {(product.specifications || []).map((spec, index) => (
                   <div key={index} className="flex justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">{spec.name}</span>
                      <span className="text-sm font-semibold text-slate-900">{spec.value}</span>
                   </div>
                 ))}
                 {(!product.specifications || product.specifications.length === 0) && (
                   <p className="text-slate-400 text-sm">No special specifications listed for this product.</p>
                 )}
               </div>
             )}
             {activeTab === 'reviews' && (
               <div className="max-w-3xl">
                  {approvedReviews.map(review => (
                    <div key={review.id} className="mb-6 border-b border-slate-100 pb-6">
                       <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">{review.user?.name?.[0] || 'C'}</div>
                          <div>
                             <p className="font-bold text-slate-800 text-sm">{review.user?.name || 'Customer'}</p>
                             <div className="flex text-amber-400 mt-0.5">
                                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} />)}
                             </div>
                          </div>
                       </div>
                       <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                  {approvedReviews.length === 0 && (
                    <p className="text-slate-400 text-sm mb-8">No customer reviews yet. Be the first to review this product!</p>
                  )}

                  <form onSubmit={submitReview} className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <h4 className="font-black text-xs uppercase tracking-widest text-slate-800 mb-5">Write a Customer Review</h4>
                     <div className="space-y-4">
                        <div>
                           <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Rating</label>
                           <select value={reviewForm.rating} onChange={e => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none font-medium">
                              {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                           </select>
                        </div>
                        <input value={reviewForm.title} onChange={e => setReviewForm(prev => ({ ...prev, title: e.target.value }))} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none" placeholder="Headline / Subject" />
                        <textarea required value={reviewForm.comment} onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} className="w-full h-28 bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none resize-none" placeholder="Share details of your experience with this product..." />
                        <Button type="submit" className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest" style={{ backgroundColor: primaryColor }}>Submit Review</Button>
                     </div>
                  </form>
               </div>
             )}
           </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div>
             <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
                <div>
                   <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Related Products</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Explore similar items from {product.category}</p>
                </div>
                <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="text-xs font-bold uppercase tracking-wider hover:underline" style={{ color: primaryColor }}>
                  View All
                </Link>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
