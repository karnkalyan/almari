import React, { useContext } from 'react';
import { Product } from '../types';
import { ShoppingCart, Star, Heart, Eye, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../App';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { site, addToCart: contextAddToCart } = useContext(ShopContext);
  
  const primaryColor = site.primaryColor || '#002D42';
  const accentColor = site.accentColor || '#D49B24';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else if (contextAddToCart) {
      contextAddToCart(product);
    }
  };

  // Helper to render all flags (New, Discount, Custom)
  const renderFlags = () => {
    return (
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.discount && (
          <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5 tracking-wide backdrop-blur-sm">
             <Zap size={9} fill="currentColor" /> {product.discount}% OFF
          </span>
        )}
        {product.isNew && (
          <span className="text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm tracking-wider uppercase" style={{ backgroundColor: primaryColor }}>
            NEW
          </span>
        )}
        {product.customFlags?.map((cf, i) => (
          <span 
            key={i} 
            className="text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wider uppercase"
            style={{ backgroundColor: cf.flag.color || primaryColor }}
          >
            {cf.flag.name}
          </span>
        ))}
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col sm:flex-row h-full">
        <div 
          className="relative w-full sm:w-48 h-48 sm:h-auto bg-slate-50 cursor-pointer flex-shrink-0 overflow-hidden"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {renderFlags()}
          <img 
            src={product.primaryImage || product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        <div className="p-5 flex-1 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-700">{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
              </div>
            </div>
            <h3 
              className="text-base font-bold text-slate-800 hover:text-[var(--brand-primary)] cursor-pointer transition-colors line-clamp-1 mb-2"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
             <div className="flex items-baseline gap-2">
               <span className="text-lg font-black text-slate-900">NPR {product.price.toLocaleString()}</span>
               {product.originalPrice && (
                 <span className="text-xs text-slate-400 line-through font-medium">NPR {product.originalPrice.toLocaleString()}</span>
               )}
             </div>
             <div className="flex items-center gap-2">
               <button 
                 onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }} 
                 className="w-9 h-9 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all"
                 title="Quick View"
               >
                 <Eye size={15} />
               </button>
               <button 
                 onClick={handleAddToCart} 
                 className="h-9 px-4 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                 style={{ backgroundColor: primaryColor }}
               >
                  <span>Add</span> <ShoppingCart size={14} />
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100/90 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full w-full relative">
      {/* Product Image Area */}
      <div className="relative w-full aspect-square bg-slate-50 overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
        {renderFlags()}

        {/* Floating Quick Action Buttons */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
           <button 
             onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }} 
             className="w-8 h-8 bg-white/95 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 transition-all" 
             title="Quick View"
           >
             <Eye size={14} />
           </button>
        </div>

        <img 
          src={product.primaryImage || product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
      </div>

      {/* Product Card Details */}
      <div className="p-3.5 md:p-4 flex flex-col flex-grow justify-between gap-2.5 bg-white">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{product.category}</span>
            <div className="flex items-center gap-0.5 text-amber-500 flex-shrink-0">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-semibold text-slate-600">{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
            </div>
          </div>
          
          <h3 
            className="font-bold text-slate-800 text-xs md:text-sm leading-snug hover:text-[var(--brand-primary)] cursor-pointer line-clamp-2 min-h-[34px] transition-colors" 
            onClick={() => navigate(`/product/${product.id}`)}
          >
            {product.name}
          </h3>
        </div>
        
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-50 mt-auto">
           <div className="flex flex-col min-w-0">
              <span className="text-sm md:text-base font-black text-slate-900 leading-tight truncate">
                NPR {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] md:text-xs text-slate-400 line-through font-medium">
                  NPR {product.originalPrice.toLocaleString()}
                </span>
              )}
           </div>
           
           <button 
             onClick={handleAddToCart} 
             className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-md flex-shrink-0"
             style={{ backgroundColor: primaryColor }}
             title="Add to Cart"
           >
              <ShoppingCart size={14} />
           </button>
        </div>
      </div>
    </div>
  );
};
