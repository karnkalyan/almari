import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { apiService } from '../../services/api';
import { Brand, Category, Product, ProductAdditionalService, ProductFlag, ProductOption, ProductSpecification, SiteCustomization } from '../../types';
import { ArrowLeft, ImagePlus, Plus, Save, X } from 'lucide-react';

const emptyProduct: Partial<Product> = {
  name: '',
  shortDescription: '',
  description: '',
  longDescription: '',
  price: 0,
  originalPrice: 0,
  discount: 0,
  primaryImage: '',
  images: [],
  categoryId: '',
  brandId: '',
  inStock: true,
  brand: '',
  weight: '',
  dimensions: '',
  sku: '',
  specifications: [{ id: Math.random().toString(36).substr(2, 9), name: '', value: '', type: 'rich' }],
  options: [{ id: Math.random().toString(36).substr(2, 9), name: '', values: [] }],
  additionalServices: [{ id: Math.random().toString(36).substr(2, 9), title: '', description: '', amount: 0 }],
  tags: [],
  metaTitle: '',
  metaDescription: '',
  isNew: false,
  isFlashDeal: false,
  isFeatured: false,
  isTrending: false,
  isDynamic: false,
  isBestSeller: false,
  isRecommended: false,
  isPopular: false,
  showOnHomepage: true,
};

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const quillRef = useRef<HTMLDivElement | null>(null);
  const quillInstance = useRef<Quill | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>(emptyProduct);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [settings, setSettings] = useState<Partial<SiteCustomization> & { maxProductImageSizeMb?: number }>({});
  const [loading, setLoading] = useState(false);
  const [customFlags, setCustomFlags] = useState<ProductFlag[]>([]);
  const [productFlagIds, setProductFlagIds] = useState<string[]>([]);

  const maxImageSizeMb = Number(settings.maxProductImageSizeMb || 2);
  const parentCategories = categories.filter(category => !category.parentId);
  const subCategories = categories.filter(category => category.parentId === formData.parentCategoryId);

  useEffect(() => {
    const load = async () => {
      const [cats, brandData, siteData, flagsData] = await Promise.all([
        apiService.getCategories(),
        apiService.getBrands(),
        apiService.getSiteSettings(),
        apiService.getProductFlags(),
      ]);
      setCategories(cats);
      setBrands(brandData);
      setSettings(siteData.site || {});
      setCustomFlags(flagsData || []);
      if (isEdit && id) {
        const product = await apiService.getProduct(id);
        const category = cats.find(cat => cat.id === product.categoryId);
        setFormData({ ...emptyProduct, ...product, parentCategoryId: category?.parentId || product.categoryId });
        // Load product's custom flag assignments
        const assignedFlagIds = (product as any).customFlags?.map((cf: any) => cf.flagId) || [];
        setProductFlagIds(assignedFlagIds);
      }
    };

    load().catch(error => {
      console.error('Failed to load product form:', error);
      toast.error('Failed to load product form data');
    });
  }, [id, isEdit]);

  // Enhanced Quill Initialization
  useEffect(() => {
    if (!quillRef.current) return;
    
    // Clear the container first to prevent duplicates
    quillRef.current.innerHTML = '';
    
    const editorContainer = document.createElement('div');
    editorContainer.className = 'min-h-60 bg-white rounded-b-xl border-x border-b border-gray-200';
    quillRef.current.appendChild(editorContainer);

    const quill = new Quill(editorContainer, {
      theme: 'snow',
      modules: { 
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'align': [] }],
          ['link', 'image', 'video'],
          ['clean']
        ]
      },
      placeholder: 'Write an immersive product story...'
    });
    
    quillInstance.current = quill;

    // Load initial content if available
    if (formData.longDescription) {
      quill.root.innerHTML = formData.longDescription;
    }

    // Capture changes
    const handleChange = () => {
      const html = quill.root.innerHTML;
      setFormData(prev => {
        // Only update if content actually changed to avoid cursor jumps
        if (prev.longDescription === html) return prev;
        return { ...prev, longDescription: html === '<p><br></p>' ? '' : html };
      });
    };

    quill.on('text-change', handleChange);

    return () => {
      quill.off('text-change', handleChange);
      if (quillRef.current) quillRef.current.innerHTML = '';
      quillInstance.current = null;
    };
  }, [id]); // Re-init on ID change to ensure correct data load

  const breadcrumb = useMemo(() => {
    const category = categories.find(cat => cat.id === formData.categoryId);
    const parent = categories.find(cat => cat.id === category?.parentId);
    return ['Home', parent?.name, category?.name, formData.name].filter(Boolean).join(' / ');
  }, [categories, formData.categoryId, formData.name]);

  const setField = (name: string, value: any) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleFile = async (file: File, primary = false) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > maxImageSizeMb * 1024 * 1024) {
      toast.error(`Image must be ${maxImageSizeMb}MB or smaller`);
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    if (primary) setField('primaryImage', dataUrl);
    else setField('images', [...(formData.images || []), dataUrl]);
    toast.success('Image added');
  };

  const fileToDataUrl = async (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const toggleCustomFlag = (flagId: string) => {
    setProductFlagIds(prev => prev.includes(flagId) ? prev.filter(id => id !== flagId) : [...prev, flagId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.categoryId) throw new Error('Select a category or subcategory');
      if (!formData.primaryImage) throw new Error('Upload or provide a primary image');
      const brand = brands.find(item => item.id === formData.brandId);
      const payload = {
        ...formData,
        brand: brand?.name || formData.brand,
        images: formData.images?.length ? formData.images : [formData.primaryImage],
        flagIds: productFlagIds,
      };
      
      if (isEdit && id) await apiService.updateProduct(id, payload);
      else await apiService.createProduct(payload);
      
      toast.success(`Product ${isEdit ? 'updated' : 'created'}`);
      navigate('/admin/products');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const updateSpec = (index: number, key: keyof ProductSpecification, value: string) => {
    const specs = [...(formData.specifications || [])];
    specs[index] = { ...specs[index], [key]: value };
    setField('specifications', specs);
  };

  const addSpec = () => {
    setField('specifications', [...(formData.specifications || []), { id: Math.random().toString(36).substr(2, 9), name: '', value: '', type: 'rich' }]);
  };

  const updateOption = (index: number, key: keyof ProductOption, value: string) => {
    const options = [...(formData.options || [])];
    options[index] = { ...options[index], [key]: key === 'values' ? value.split(',').map(item => item.trim()).filter(Boolean) : value };
    setField('options', options);
  };

  const addOption = () => {
    setField('options', [...(formData.options || []), { id: Math.random().toString(36).substr(2, 9), name: '', values: [] }]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/products')} className="p-2 hover:bg-gray-200 rounded-full transition"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p className="text-gray-500 text-sm">{breadcrumb || 'Home / Category / Product'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Panel title="Core Product Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Product Name" value={formData.name || ''} onChange={value => setField('name', value)} required />
              <Input label="SKU" value={formData.sku || ''} onChange={value => setField('sku', value)} required />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea className="w-full min-h-20 p-3 border rounded-lg text-sm" value={formData.shortDescription || ''} onChange={e => setField('shortDescription', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
                <textarea className="w-full min-h-28 p-3 border rounded-lg text-sm" value={formData.description || ''} onChange={e => setField('description', e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Long Description (Quill)</label>
                <div className="bg-white"><div ref={quillRef} className="min-h-40" /></div>
              </div>
            </div>
          </Panel>

          <Panel title="Pricing & Inventory">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Price (NPR)" type="number" value={String(formData.price || 0)} onChange={value => setField('price', Number(value))} required />
              <Input label="Original Price" type="number" value={String(formData.originalPrice || 0)} onChange={value => setField('originalPrice', Number(value))} />
              <Input label="Discount %" type="number" value={String(formData.discount || 0)} onChange={value => setField('discount', Number(value))} />
            </div>
          </Panel>

          <Panel title="Flexible Product Specifications">
            <Repeater
              items={(formData.specifications || []) as any[]}
              addLabel="Add Specification"
              onAdd={addSpec}
              onRemove={index => setField('specifications', (formData.specifications || []).filter((_, i) => i !== index))}
              render={(item, index) => (
                <>
                  <input className="h-10 px-3 border rounded-lg text-sm" placeholder="Section title" value={item.name} onChange={e => updateSpec(index, 'name', e.target.value)} />
                  <select className="h-10 px-3 border rounded-lg text-sm" value={item.type || 'rich'} onChange={e => updateSpec(index, 'type' as any, e.target.value)}>
                    <option value="rich">Rich editor</option>
                    <option value="text">Plain text</option>
                  </select>
                  <div className="col-span-full">
                    {item.type === 'text' ? (
                      <textarea className="w-full min-h-24 p-3 border rounded-lg text-sm" placeholder="Specification details" value={item.value} onChange={e => updateSpec(index, 'value', e.target.value)} />
                    ) : (
                      <MiniRichText value={item.value} onChange={value => updateSpec(index, 'value', value)} placeholder="Add tables, lists, highlights, links, images, or formatted technical details" />
                    )}
                  </div>
                </>
              )}
            />
          </Panel>

          <Panel title="Product Options">
            <Repeater
              items={(formData.options || []) as any[]}
              addLabel="Add Option"
              onAdd={addOption}
              onRemove={index => setField('options', (formData.options || []).filter((_, i) => i !== index))}
              render={(item, index) => (
                <>
                  <input className="h-10 px-3 border rounded-lg text-sm" placeholder="Option name e.g. Size" value={item.name} onChange={e => updateOption(index, 'name', e.target.value)} />
                  <input className="h-10 px-3 border rounded-lg text-sm" placeholder="Values comma separated" value={(item.values || []).join(', ')} onChange={e => updateOption(index, 'values', e.target.value)} />
                </>
              )}
            />
          </Panel>

          <Panel title="Value Added Services">
            <Repeater
              items={(formData.additionalServices || []) as any[]}
              addLabel="Add Service"
              onAdd={() => setField('additionalServices', [...(formData.additionalServices || []), { id: Math.random().toString(36).substr(2, 9), title: '', description: '', amount: 0 }])}
              onRemove={index => setField('additionalServices', (formData.additionalServices || []).filter((_, i) => i !== index))}
              render={(item, index) => (
                <>
                  <input className="h-10 px-3 border rounded-lg text-sm" placeholder="Service name e.g. Installation" value={item.title} onChange={e => {
                    const services = [...(formData.additionalServices || [])];
                    services[index] = { ...services[index], title: e.target.value };
                    setField('additionalServices', services);
                  }} />
                  <input className="h-10 px-3 border rounded-lg text-sm" type="number" placeholder="Amount (NPR)" value={String(item.amount || 0)} onChange={e => {
                    const services = [...(formData.additionalServices || [])];
                    services[index] = { ...services[index], amount: Number(e.target.value) };
                    setField('additionalServices', services);
                  }} />
                  <div className="col-span-full">
                    <textarea className="w-full min-h-20 p-3 border rounded-lg text-sm" placeholder="Service description" value={item.description || ''} onChange={e => {
                      const services = [...(formData.additionalServices || [])];
                      services[index] = { ...services[index], description: e.target.value };
                      setField('additionalServices', services);
                    }} />
                  </div>
                </>
              )}
            />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Category & Brand">
            <div className="space-y-4">
              <Select label="Parent Category" value={(formData as any).parentCategoryId || ''} onChange={value => { setField('parentCategoryId', value); setField('categoryId', value); }} options={parentCategories.map(cat => ({ label: cat.name, value: cat.id }))} />
              <Select label="Subcategory" value={formData.categoryId || ''} onChange={value => setField('categoryId', value)} options={subCategories.map(cat => ({ label: cat.name, value: cat.id }))} />
              <Select label="Brand" value={formData.brandId || ''} onChange={value => setField('brandId', value)} options={brands.map(brand => ({ label: brand.name, value: brand.id }))} />
              <div className="flex gap-2">
                <Link to="/admin/brands" className="text-sm font-bold text-[var(--brand-primary)] hover:underline">Manage brands</Link>
                <span className="text-gray-300">·</span>
                <Link to="/admin/categories" className="text-sm font-bold text-[var(--brand-primary)] hover:underline">Manage categories</Link>
              </div>
            </div>
          </Panel>

          <Panel title={`Images (max ${maxImageSizeMb}MB)`}>
            <div className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Primary Image</span>
                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], true)} className="w-full text-sm" />
              </label>
              <Input label="Primary Image URL" value={formData.primaryImage || ''} onChange={value => setField('primaryImage', value)} />
              {formData.primaryImage && <img src={formData.primaryImage} alt="" className="w-full h-40 object-contain bg-gray-50 rounded-lg border" />}
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-bold cursor-pointer">
                <ImagePlus size={16} /> Add Gallery Image
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(formData.images || []).map((image, index) => (
                  <div key={index} className="relative bg-gray-50 border rounded-lg p-1">
                    <img src={image} className="w-full h-20 object-contain" />
                    <button type="button" onClick={() => setField('images', (formData.images || []).filter((_, i) => i !== index))} className="absolute -top-2 -right-2 bg-white border rounded-full p-1 text-red-600"><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Storefront Flags">
            <div className="space-y-2">
              {([
                ['inStock', 'In Stock'],
                ['showOnHomepage', 'Show on Homepage'],
                ['isNew', 'New Arrival'],
                ['isFeatured', 'Featured'],
                ['isBestSeller', 'Best Seller'],
                ['isTrending', 'Trending'],
                ['isRecommended', 'Recommended'],
                ['isPopular', 'Popular'],
                ['isFlashDeal', 'Flash Deal'],
                ['isDynamic', 'Dynamic Section'],
              ] as [keyof Product, string][]).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={key === 'showOnHomepage' ? formData[key] !== false : Boolean(formData[key])} onChange={e => setField(key, e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
            {customFlags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-slate-800 mb-2">Custom Product Flags</h4>
                <div className="space-y-2">
                  {customFlags.map(flag => (
                    <label key={flag.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={productFlagIds.includes(flag.id)} onChange={() => toggleCustomFlag(flag.id)} />
                      <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: flag.color || '#0f766e' }} />
                      {flag.name}
                    </label>
                  ))}
                </div>
                <Link to="/admin/product-flags" className="text-xs font-bold text-[var(--brand-primary)] hover:underline mt-2 inline-block">Manage custom flags</Link>
              </div>
            )}
          </Panel>

          <Panel title="SEO">
            <div className="space-y-3">
              <Input label="Meta Title" value={formData.metaTitle || ''} onChange={value => setField('metaTitle', value)} />
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <textarea className="w-full min-h-20 p-3 border rounded-lg text-sm" value={formData.metaDescription || ''} onChange={e => setField('metaDescription', e.target.value)} />
            </div>
          </Panel>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[#003d5c] transition disabled:opacity-50 font-bold">
            <Save size={16} /> {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Panel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">{title}</h3>
    {children}
  </section>
);

const Input: React.FC<{ label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }> = ({ label, value, onChange, type = 'text', required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input type={type} required={required} value={value} onChange={e => onChange(e.target.value)} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none" />
  </div>
);

const Select: React.FC<{ label: string; value: string; onChange: (value: string) => void; options: { label: string; value: string }[] }> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none">
      <option value="">Select</option>
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </div>
);

const Repeater = <T,>({ items, addLabel, onAdd, onRemove, render }: { items: T[]; addLabel: string; onAdd: () => void; onRemove: (index: number) => void; render: (item: T, index: number) => React.ReactNode }) => (
  <div className="space-y-3">
    {items.map((item, index) => (
      <div key={(item as any).id || index} className="grid grid-cols-[1fr_160px_auto] gap-2 items-start">
        {render(item, index)}
        <button type="button" onClick={() => onRemove(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X size={16} /></button>
      </div>
    ))}
    <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200"><Plus size={16} /> {addLabel}</button>
  </div>
);

const MiniRichText: React.FC<{ value: string; onChange: (value: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current || instanceRef.current) return;
    
    // Clear existing content to prevent duplicates
    editorRef.current.innerHTML = '';
    const editorDiv = document.createElement('div');
    editorDiv.className = 'min-h-32';
    editorRef.current.appendChild(editorDiv);

    const quill = new Quill(editorDiv, {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ header: [2, 3, false] }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'link', 'image'],
          ['clean'],
        ],
      },
      placeholder,
    });
    
    quill.root.innerHTML = value || '';
    quill.on('text-change', () => onChange(quill.root.innerHTML || ''));
    instanceRef.current = quill;

    return () => {
      quill.off('text-change');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (instanceRef.current && instanceRef.current.root.innerHTML !== value) {
      // Use silent update to prevent feedback loops
      instanceRef.current.root.innerHTML = value || '';
    }
  }, [value]);

  return <div ref={editorRef} className="bg-white border border-gray-300 rounded-lg overflow-hidden" />;
};
