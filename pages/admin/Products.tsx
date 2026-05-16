
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Product } from '../../types';
import { Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await apiService.getProducts({ page, limit: 15, search: searchTerm });
        setProducts(response.products || []);
        setTotalPages(response.pages);
        setTotalResults(response.total);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, searchTerm]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteProduct = async (id: string) => {
    try {
      await apiService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Product Catalog</h1>
          <p className="text-gray-500 text-sm">Manage inventory, pricing, and visibility across the store.</p>
        </div>
        <Link to="/admin/products/new" className="px-6 py-2.5 bg-[var(--brand-primary)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--brand-primary)]/20 hover:bg-[#003d61] transition flex items-center gap-2">
          <Plus size={18} /> New Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 justify-between items-center">
         <div className="relative flex-1 w-full lg:max-w-xl">
           <input 
             type="text" 
             placeholder="Search by name, SKU or category..." 
             className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-transparent rounded-2xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)] outline-none transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
         </div>
         
         <div className="flex gap-3 w-full lg:w-auto">
           <button className="flex-1 lg:flex-none h-12 px-6 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-slate-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-sm">
             <Filter size={16} /> Filters
           </button>
         </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
              <tr>
                <th className="px-8 py-6 w-24">Item</th>
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Collection</th>
                <th className="px-8 py-6">Financials</th>
                <th className="px-8 py-6 text-center">Inventory</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="w-12 h-12 rounded-2xl bg-gray-100"></div></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-32 mb-2"></div><div className="h-3 bg-gray-50 rounded w-20"></div></td>
                    <td className="px-8 py-6"><div className="h-6 bg-gray-100 rounded-lg w-24"></div></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-16 mx-auto"></div></td>
                    <td className="px-8 py-6"></td>
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 p-2 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <img src={product.primaryImage} alt="" className="max-w-full max-h-full object-contain" />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-[var(--brand-primary)] text-sm tracking-tight truncate max-w-[250px]" title={product.name}>{product.name}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{product.sku || 'NO-SKU'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1.5 bg-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-wider">{product.category}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">NPR {product.price.toLocaleString()}</span>
                        {product.originalPrice && <span className="text-[10px] font-bold text-gray-400 line-through">NPR {product.originalPrice.toLocaleString()}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${product.inStock ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {product.inStock ? 'Available' : 'Sold Out'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          className="p-2.5 bg-white border border-gray-100 text-slate-400 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] hover:bg-blue-50 rounded-xl transition shadow-sm"
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2.5 bg-white border border-gray-100 text-slate-400 hover:text-red-600 hover:border-red-600 hover:bg-red-50 rounded-xl transition shadow-sm"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                         <Search size={32} />
                      </div>
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No matching products found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Admin Pagination */}
        {totalPages > 1 && (
          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-center items-center gap-2">
             <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-600 disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
             >
               Previous
             </button>
             {Array.from({ length: totalPages }).map((_, i) => (
               <button 
                 key={i}
                 onClick={() => setPage(i + 1)}
                 className={`w-10 h-10 rounded-lg text-xs font-black transition-all ${page === i + 1 ? 'bg-[var(--brand-primary)] text-white shadow-lg' : 'bg-white border border-gray-100 text-slate-400 hover:bg-gray-50'}`}
               >
                 {i + 1}
               </button>
             ))}
             <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-600 disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
             >
               Next
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
