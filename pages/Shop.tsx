import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShopContext } from '../App';
import { ProductCard } from '../components/ProductCard';
import { Filter, Grid, List, ChevronDown, X, SlidersHorizontal, Check } from 'lucide-react';
import { Product, SiteCustomization } from '../types';
import { apiService } from '../services/api';

export const Shop: React.FC = () => {
  const { addToCart } = useContext(ShopContext);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL States
  const urlCategory = searchParams.get('category');
  const urlBrand = searchParams.get('brand');
  const urlSearch = searchParams.get('search');

  // Filter States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(urlCategory ? [urlCategory] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(urlBrand ? [urlBrand] : []);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>({});
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [allProductsForFilters, setAllProductsForFilters] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [site, setSite] = useState<Partial<SiteCustomization>>({});

  // Fetch base catalog for dynamic filter extraction
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [cats, brnds, allProds, settings] = await Promise.all([
          apiService.getCategories(),
          apiService.getBrands(),
          apiService.getProducts({ limit: 500 }), // Fetch large set for filter extraction
          apiService.getSiteSettings()
        ]);
        setCategories(cats || []);
        setBrands(brnds || []);
        setAllProductsForFilters(allProds.products || []);
        setSite(settings.site_customization || settings.site || {});
      } catch (err) {
        console.error(err);
      }
    };
    fetchBaseData();
  }, []);

  // Filter products locally for instantaneous UX (Debounced fetching isn't needed if we process locally for small catalogs, but we'll do local filtering on allProds)
  useEffect(() => {
    setLoading(true);
    // Simulate slight delay for UX
    const timer = setTimeout(() => {
      let filtered = [...allProductsForFilters];

      // Search
      if (urlSearch) {
        const q = urlSearch.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }

      // Categories
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(p => selectedCategories.includes(p.categoryId) || selectedCategories.includes(p.category?.name));
      }

      // Brands
      if (selectedBrands.length > 0) {
        filtered = filtered.filter(p => selectedBrands.includes(p.brandId!) || selectedBrands.includes(p.brand!));
      }

      // Price
      filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

      // Ratings
      if (selectedRatings.length > 0) {
        filtered = filtered.filter(p => selectedRatings.some(r => p.rating >= r));
      }

      // Availability
      if (availability.length > 0) {
        if (availability.includes('in_stock')) filtered = filtered.filter(p => p.inStock);
        if (availability.includes('out_of_stock')) filtered = filtered.filter(p => !p.inStock);
      }

      // Discounts
      if (showDiscountedOnly) {
        filtered = filtered.filter(p => p.discount && p.discount > 0);
      }

      // Variants
      Object.keys(selectedVariants).forEach(variantName => {
        const selectedValues = selectedVariants[variantName];
        if (selectedValues.length > 0) {
          filtered = filtered.filter(p => {
            if (!p.options) return false;
            let optionsArr = typeof p.options === 'string' ? JSON.parse(p.options) : p.options;
            const opt = optionsArr.find((o: any) => o.name.toLowerCase() === variantName.toLowerCase());
            if (!opt) return false;
            return selectedValues.some(v => opt.values.includes(v));
          });
        }
      });

      // Sorting
      switch (sortBy) {
        case 'price_asc': filtered.sort((a, b) => a.price - b.price); break;
        case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
        case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
        case 'trending': filtered.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0)); break;
        case 'newest':
        default: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      }

      setProducts(filtered);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [allProductsForFilters, selectedCategories, selectedBrands, priceRange, selectedVariants, selectedRatings, availability, showDiscountedOnly, sortBy, urlSearch]);

  // Dynamic Variant Extraction
  const dynamicVariants = useMemo(() => {
    const variants: Record<string, Set<string>> = {};
    allProductsForFilters.forEach(p => {
      if (p.options) {
        let optionsArr = typeof p.options === 'string' ? JSON.parse(p.options) : p.options;
        optionsArr.forEach((opt: any) => {
          if (!variants[opt.name]) variants[opt.name] = new Set();
          opt.values.forEach((v: string) => variants[opt.name].add(v));
        });
      }
    });
    return variants;
  }, [allProductsForFilters]);

  const toggleArrayItem = (setter: any, item: any) => {
    setter((prev: any[]) => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const toggleVariant = (name: string, value: string) => {
    setSelectedVariants(prev => {
      const current = prev[name] || [];
      const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const FilterSidebar = () => (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Categories */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-black text-slate-800 mb-4 text-xs uppercase tracking-widest flex items-center justify-between">Categories</h3>
        <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
          {categories.map(cat => (
            <label 
              key={cat.id} 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleArrayItem(setSelectedCategories, cat.id)}
            >
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${selectedCategories.includes(cat.id) ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-gray-200 bg-white'}`}>
                {selectedCategories.includes(cat.id) && <Check size={12} className="text-white" />}
              </div>
              <span className={`text-sm font-bold transition-colors ${selectedCategories.includes(cat.id) ? 'text-[var(--brand-primary)]' : 'text-slate-600 group-hover:text-slate-900'}`}>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-black text-slate-800 mb-4 text-xs uppercase tracking-widest flex items-center justify-between">Brands</h3>
        <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
          {brands.map(brand => (
            <label 
              key={brand.id} 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleArrayItem(setSelectedBrands, brand.id)}
            >
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${selectedBrands.includes(brand.id) ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-gray-200 bg-white'}`}>
                {selectedBrands.includes(brand.id) && <Check size={12} className="text-white" />}
              </div>
              <span className={`text-sm font-bold transition-colors ${selectedBrands.includes(brand.id) ? 'text-[var(--brand-primary)]' : 'text-slate-600 group-hover:text-slate-900'}`}>{brand.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-black text-slate-800 mb-6 text-xs uppercase tracking-widest">Price Range</h3>
        <input 
          type="range" min="0" max="100000" step="1000" 
          className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)]"
          value={priceRange[1]} onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
        />
        <div className="flex justify-between mt-4 text-xs font-black text-slate-400">
          <span>NPR 0</span>
          <span className="text-[var(--brand-primary)]">NPR {priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Availability & Offers */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-2">Availability & Offers</h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${availability.includes('in_stock') ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-gray-200 bg-white'}`}>
            {availability.includes('in_stock') && <Check size={12} className="text-white" />}
          </div>
          <span className="text-sm font-bold text-slate-600">In Stock</span>
          <input type="checkbox" className="hidden" checked={availability.includes('in_stock')} onChange={() => toggleArrayItem(setAvailability, 'in_stock')} />
        </label>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${showDiscountedOnly ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-gray-200 bg-white'}`}>
            {showDiscountedOnly && <Check size={12} className="text-white" />}
          </div>
          <span className="text-sm font-bold text-slate-600">Discounted / On Sale</span>
          <input type="checkbox" className="hidden" checked={showDiscountedOnly} onChange={() => setShowDiscountedOnly(!showDiscountedOnly)} />
        </label>
      </div>

      {/* Dynamic Variants */}
      {Object.entries(dynamicVariants).map(([name, valuesSet]) => (
        <div key={name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-4 text-xs uppercase tracking-widest flex items-center justify-between">{name}</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(valuesSet as Set<string>).map(value => {
              const isSelected = selectedVariants[name]?.includes(value);
              return (
                <button 
                  key={value}
                  onClick={() => toggleVariant(name, value as string)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]' : 'bg-gray-50 text-slate-600 border-gray-100 hover:border-gray-300'}`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100 py-8 mb-8 sticky top-0 z-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Shop Collection</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{products.length} Products Found</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              className="md:hidden flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm"
              onClick={() => setMobileFilterOpen(true)}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <div className="relative flex-1 md:w-48">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-bold text-slate-600 text-sm outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="trending">Trending Now</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="hidden md:flex bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[var(--brand-primary)]' : 'text-gray-400 hover:text-gray-600'}`}><Grid size={18} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[var(--brand-primary)]' : 'text-gray-400 hover:text-gray-600'}`}><List size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-32 self-start h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-2">
             <FilterSidebar />
          </aside>

          {/* Mobile Bottom Sheet Modal */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
              <div className="relative bg-gray-50 w-full h-[85vh] rounded-t-[2.5rem] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
                <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                  <h2 className="text-xl font-black text-slate-800">Filters</h2>
                  <button onClick={() => setMobileFilterOpen(false)} className="w-10 h-10 bg-gray-50 text-slate-500 rounded-full flex items-center justify-center hover:bg-gray-100"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <FilterSidebar />
                </div>
                <div className="p-6 bg-white border-t border-gray-100">
                  <button onClick={() => setMobileFilterOpen(false)} className="w-full py-4 bg-[var(--brand-primary)] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[var(--brand-primary)]/20">
                    Apply Filters ({products.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-3xl h-[350px] animate-pulse"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-4 md:gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'}`}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm px-4">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SlidersHorizontal size={32} className="text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">No Match Found</h3>
                <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto">We couldn't find any products matching your current filters. Try relaxing your constraints.</p>
                <button 
                  onClick={() => { setSelectedCategories([]); setSelectedBrands([]); setPriceRange([0, 100000]); setSelectedVariants({}); setAvailability([]); setShowDiscountedOnly(false); }}
                  className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
