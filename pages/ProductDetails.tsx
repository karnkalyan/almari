
import React, { useContext, useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShopContext } from '../App';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { Star, Truck, ShieldCheck, Heart, Share2, Plus, Minus, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { Product } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useContext(ShopContext);
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
  };

  const images = product ? (product.images?.length ? product.images : [product.primaryImage || product.image || '']) : [];
  const approvedReviews = ((product as any)?.reviewItems || []) as any[];
  const selectedServicesTotal = (product?.additionalServices || [])
    .filter(service => selectedServiceTitles.includes(service.title))
    .reduce((sum, service) => sum + Number(service.amount || 0), 0);

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

  if (loading) return <div className="container mx-auto px-4 py-16 text-center text-gray-500 font-bold uppercase tracking-widest">Loading Product...</div>;
  if (!product) return <div className="container mx-auto px-4 py-16 text-center text-gray-500 font-bold uppercase tracking-widest">Product Not Found</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-4 mb-8">
        <div className="container mx-auto px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <Link to="/" className="hover:text-brand-primary">Home</Link> <span className="mx-2">/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-primary">{product.category}</Link> <span className="mx-2">/</span>
          <span className="text-slate-800">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Main Details Section */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 lg:p-12 mb-12 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Gallery */}
            <div className="lg:w-1/2">
               <div className="relative bg-gray-50 rounded-2xl overflow-hidden mb-6 h-[400px] md:h-[500px] flex items-center justify-center border border-gray-50">
                 {product.discount && (
                   <span className="absolute top-6 left-6 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg z-10 shadow-lg">
                     {product.discount}% OFF
                   </span>
                 )}
                 <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-12" />
               </div>
               <div className="grid grid-cols-4 gap-4">
                 {images.map((img, i) => (
                   <div 
                     key={i} 
                     className={`border-2 rounded-xl p-2 cursor-pointer h-24 bg-gray-50 flex items-center justify-center transition-all ${selectedImage === i ? 'border-brand-primary shadow-lg' : 'border-transparent hover:border-brand-primary/20'}`}
                     onClick={() => setSelectedImage(i)}
                   >
                      <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                   </div>
                 ))}
               </div>
            </div>

            {/* Info */}
            <div className="lg:w-1/2">
               <div className="mb-6">
                 <span className="text-brand-primary text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 px-3 py-1.5 rounded-full">{product.category}</span>
               </div>
               
               <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">{product.name}</h1>
               
               <div className="flex flex-wrap items-center gap-6 mb-8 text-xs font-bold">
                 <div className="flex items-center gap-1.5">
                   <div className="flex text-yellow-400">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i < Math.floor(product.rating) ? "" : "text-gray-200"} />
                     ))}
                   </div>
                   <span className="text-slate-400">({product.reviews} reviews)</span>
                 </div>
                 <div className="text-gray-200">|</div>
                 <div className="text-slate-400">SKU: <span className="text-slate-800">{product.sku || `PRD-${product.id}`}</span></div>
                 <div className="text-gray-200">|</div>
                 <div className="text-green-500 flex items-center gap-1.5 uppercase tracking-widest"><Check size={16} /> In Stock</div>
               </div>

               <div className="flex items-end gap-6 mb-8 pb-8 border-b border-gray-100">
                 <span className="text-4xl md:text-5xl font-black text-slate-800">NPR {product.price.toLocaleString()}</span>
                 {product.originalPrice && (
                   <div className="flex flex-col mb-1">
                     <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">{product.discount}% Discount</span>
                     <span className="text-xl text-gray-300 line-through font-bold">NPR {product.originalPrice.toLocaleString()}</span>
                   </div>
                 )}
               </div>

               <div className="mb-8">
                 <p className="text-gray-500 leading-relaxed text-sm">{product.description}</p>
               </div>

              {(product.additionalServices || []).length > 0 && (
                <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-widest">Additional Services</h3>
                  <div className="space-y-3">
                    {(product.additionalServices || []).map((service, index) => (
                      <label key={index} className="flex items-center justify-between gap-3 text-sm cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedServiceTitles.includes(service.title) ? 'bg-brand-primary border-brand-primary' : 'border-gray-300 bg-white'}`}>
                            {selectedServiceTitles.includes(service.title) && <Check size={12} className="text-white" />}
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
                          <span className="font-bold text-slate-600 group-hover:text-brand-primary transition-colors">{service.title}</span>
                        </div>
                        <span className="font-black text-brand-primary">+ NPR {service.amount.toLocaleString()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

               <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                 <div className="flex items-center bg-gray-50 rounded-xl h-14 w-full sm:w-40 px-2 border border-gray-100">
                    <button 
                      className="w-12 h-10 hover:bg-white hover:shadow-sm rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all disabled:opacity-30"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus size={18} />
                    </button>
                    <div className="flex-1 text-center font-black text-slate-800">{quantity}</div>
                    <button 
                      className="w-12 h-10 hover:bg-white hover:shadow-sm rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus size={18} />
                    </button>
                 </div>
                 <Button size="lg" className="w-full sm:flex-1 h-14 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-100" onClick={handleAddToCart}>
                   Add to Shopping Cart
                 </Button>
                 <div className="flex gap-3">
                   <button onClick={toggleWishlist} disabled={wishlistLoading} className={`h-14 w-14 rounded-xl flex items-center justify-center transition-all border-2 ${wishlistItemId ? 'bg-red-50 border-red-200 text-red-500 shadow-lg shadow-red-100' : 'bg-white border-gray-100 text-slate-300 hover:border-red-200 hover:text-red-500'} ${wishlistLoading ? 'opacity-50' : ''}`}>
                      <Heart size={24} fill={wishlistItemId ? 'currentColor' : 'none'} />
                   </button>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl">
                    <Truck size={20} className="text-brand-primary" />
                    <div>
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Free Delivery</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Orders over NPR 2000</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl">
                    <ShieldCheck size={20} className="text-brand-primary" />
                    <div>
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Easy Returns</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">7 Days Guarantee</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 lg:p-12 mb-12 shadow-sm">
           <div className="flex border-b border-gray-100 mb-10 overflow-x-auto">
             {['Description', 'Information', `Reviews (${approvedReviews.length})`].map((tab, i) => {
               const key = ['desc', 'info', 'reviews'][i] as any;
               return (
                 <button 
                   key={key}
                   className={`px-10 py-5 font-black text-[10px] uppercase tracking-widest border-b-2 transition-all ${activeTab === key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-300 hover:text-slate-600'}`}
                   onClick={() => setActiveTab(key)}
                 >
                   {tab}
                 </button>
               )
             })}
           </div>

           <div className="min-h-[200px]">
             {activeTab === 'desc' && (
               <div className="text-slate-500 leading-relaxed text-sm">
                 <p className="mb-6">{product.description}</p>
                 {product.longDescription && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.longDescription }} />}
               </div>
             )}
             {activeTab === 'info' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {(product.specifications || []).map((spec, index) => (
                   <div key={index} className="flex border-b border-gray-50 pb-4">
                      <span className="w-1/3 font-black text-[10px] text-slate-800 uppercase tracking-widest">{spec.name}</span>
                      <span className="w-2/3 text-sm text-slate-500">{spec.value}</span>
                   </div>
                 ))}
               </div>
             )}
             {activeTab === 'reviews' && (
               <div className="max-w-3xl">
                  {approvedReviews.map(review => (
                    <div key={review.id} className="mb-8 border-b border-gray-50 pb-8">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">{review.user?.name?.[0] || 'C'}</div>
                          <div>
                             <p className="font-bold text-slate-800">{review.user?.name || 'Anonymous'}</p>
                             <div className="flex text-yellow-400 mt-1">
                                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} />)}
                             </div>
                          </div>
                       </div>
                       <p className="text-sm text-slate-500 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                  <form onSubmit={submitReview} className="mt-12 bg-slate-50 p-8 rounded-2xl">
                     <h4 className="font-black text-xs uppercase tracking-widest text-slate-800 mb-6">Write a Review</h4>
                     <div className="grid grid-cols-1 gap-6">
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Rating</label>
                           <select value={reviewForm.rating} onChange={e => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))} className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm focus:ring-0">
                              {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                           </select>
                        </div>
                        <input value={reviewForm.title} onChange={e => setReviewForm(prev => ({ ...prev, title: e.target.value }))} className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm focus:ring-0" placeholder="Review Subject" />
                        <textarea required value={reviewForm.comment} onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} className="w-full h-32 bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-0 resize-none" placeholder="Your experience..." />
                        <Button type="submit" className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest">Submit Review</Button>
                     </div>
                  </form>
               </div>
             )}
           </div>
        </div>

        {/* Related Products */}
        <div>
           <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-5">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Related Products</h3>
              <Link to="/shop" className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline">View All Collection</Link>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
           </div>
        </div>
      </div>
    </div>
  );
};
