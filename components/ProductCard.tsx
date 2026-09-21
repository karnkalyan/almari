
import React, { useContext } from 'react';
import { Product } from '../types';
import { ShoppingCart, Star, Heart, Eye, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../App';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { site } = useContext(ShopContext);
  
  const primaryColor = site.primaryColor || '#002f4a';
  const accentColor = site.accentColor || '#E5A823';

  // Helper to render all flags (New, Discount, Custom)
  const renderFlags = () => {
    return (
      <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
        {product.discount && (
          <span className="text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-0.5" style={{ backgroundColor: '#ff3b3b' }}>
             <Zap size={7} fill="white" /> {product.discount}%
          </span>
        )}
        {product.isNew && (
          <span className="text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow" style={{ backgroundColor: primaryColor }}>
            NEW
          </span>
        )}
        {product.customFlags?.map((cf, i) => (
          <span 
            key={i} 
            className="text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow"
            style={{ backgroundColor: cf.flag.color || primaryColor }}
          >
            {cf.flag.name.toUpperCase()}
          </span>
        ))}
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row h-full md:h-36">
        <div 
          className="relative w-full md:w-36 h-36 bg-gray-50/50 p-3 cursor-pointer flex-shrink-0"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {renderFlags()}
          <img 
            src={product.primaryImage || product.image} 
            alt={product.name} 
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 
              className="text-xs font-black text-slate-800 mb-1 hover:text-slate-600 cursor-pointer transition-colors line-clamp-1"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {product.name}
            </h3>
            <div className="flex items-center gap-1">
               <Star size={8} fill={accentColor} style={{ color: accentColor }} />
               <span className="text-[8px] text-gray-400 font-bold">{product.rating || '5.0'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
             <div className="flex flex-col">
               <p className="text-sm font-black text-slate-800 leading-none">NPR {product.price.toLocaleString()}</p>
               {product.originalPrice && (
                 <p className="text-[8px] text-gray-300 line-through font-bold">NPR {product.originalPrice.toLocaleString()}</p>
               )}
             </div>
             <div className="flex items-center gap-2">
               <button 
                 onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }} 
                 className="w-7 h-7 bg-gray-100 text-slate-700 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all"
                 title="Quick View"
               >
                 <Eye size={12} />
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); onAddToCart(product); }} 
                 className="h-7 px-3 text-white rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center gap-1.5 hover:opacity-90 transition-all shadow-sm"
                 style={{ backgroundColor: primaryColor }}
               >
                  ADD <ShoppingCart size={10} />
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col h-full w-full relative">
      <div className="relative h-[150px] bg-gray-50/20 overflow-hidden">
        {renderFlags()}

        {/* Floating Actions */}
        <div className="absolute top-1.5 right-1.5 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
           <button className="w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"><Heart size={12} /></button>
           <button onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }} className="w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-gray-400 hover:text-slate-800 transition-all" title="Quick View"><Eye size={12} /></button>
        </div>

        {/* Product Image */}
        <div className="absolute inset-0 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
          <img 
            src={product.primaryImage || product.image} 
            alt={product.name} 
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
          />
        </div>
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <span className="text-[7px] text-gray-400 font-black uppercase tracking-widest mb-0.5">{product.category}</span>
        
        <h3 
          className="font-black text-slate-800 text-[10px] mb-2 hover:opacity-70 cursor-pointer line-clamp-2 min-h-[24px] leading-tight transition-all" 
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </h3>
        
        <div className="mt-auto flex items-center justify-between gap-1">
           <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 leading-none">NPR {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-[8px] text-gray-300 line-through mt-0.5 font-bold">NPR {product.originalPrice.toLocaleString()}</span>
              )}
           </div>
           <button 
             onClick={(e) => { e.stopPropagation(); onAddToCart(product); }} 
             className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110 shadow-sm"
             style={{ backgroundColor: primaryColor }}
           >
              <ShoppingCart size={12} />
           </button>
        </div>
      </div>
    </div>
  );
};
