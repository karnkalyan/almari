import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Product, Category } from '../../types';
import { ArrowLeft, Upload, Save, X } from 'lucide-react';

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    discount: 0,
    primaryImage: '',
    images: [],
    category: '',
    inStock: true,
    brand: '',
    weight: '',
    sku: '',
    isFlashDeal: false,
    isFeatured: false,
    isTrending: false,
    isDynamic: false,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await apiService.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();

    if (isEdit && id) {
      const fetchProduct = async () => {
        try {
          const product = await apiService.getProduct(id);
          setFormData(product);
        } catch (error) {
          console.error('Failed to fetch product', error);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && id) {
        await apiService.updateProduct(id, formData);
      } else {
        await apiService.createProduct(formData);
      }
      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to save product', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addImage = () => {
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), ''] }));
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...(formData.images || [])];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const removeImage = (index: number) => {
    const newImages = (formData.images || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate('/admin/products')} className="p-2 hover:bg-gray-200 rounded-full transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-gray-500 text-sm">Fill in the information below to {isEdit ? 'update' : 'create'} a product.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">General Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                  placeholder="e.g. Organic Apple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                  placeholder="Product details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                    placeholder="e.g. Organic Nepal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    required
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                    placeholder="e.g. FRU-001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                    placeholder="e.g. 1 kg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Pricing</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR)</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (NPR)</label>
                <input
                  type="number"
                  name="originalPrice"
                  min="0"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Images</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Image URL</label>
                <input
                  type="url"
                  name="primaryImage"
                  required
                  value={formData.primaryImage}
                  onChange={handleChange}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
                {(formData.images || []).map((image, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => updateImage(index, e.target.value)}
                      className="flex-1 h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImage}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <Upload size={16} />
                  Add Image
                </button>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Product Options</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isFlashDeal"
                  checked={formData.isFlashDeal}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                <span className="text-sm text-gray-700">Flash Deal</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isTrending"
                  checked={formData.isTrending}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                <span className="text-sm text-gray-700">Trending</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isDynamic"
                  checked={formData.isDynamic}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                <span className="text-sm text-gray-700">Dynamic</span>
              </label>
            </div>
          </div>

          {/* Stock */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Stock & Availability</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
                className="rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              />
              <span className="text-sm text-gray-700">In Stock</span>
            </label>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Actions</h3>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[#003d5c] transition disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
