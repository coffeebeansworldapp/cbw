import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProduct,
  createProduct,
  updateProduct,
  getCategories,
} from '../api/products';
import { MultiImageUpload } from '../components/ImageUpload';
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react';

const emptyVariant = { label: '', weightGrams: '', sku: '', price: '', stockQty: '' };

const getInitialFormData = (product) => {
  if (!product) {
    return {
      name: '',
      description: '',
      region: '',
      roast: 'Medium',
      category: '',
      features: '',
      processing: '',
      basePrice: '',
      image: '',
      images: [],
      variants: [{ ...emptyVariant }],
      active: true,
    };
  }
  return {
    name: product.name || '',
    description: product.description || '',
    region: product.region || '',
    roast: product.roast || 'Medium',
    category: product.category?._id || product.category || '',
    features: product.features?.join(', ') || '',
    processing: product.processing || '',
    basePrice: product.basePrice || '',
    image: product.image || '',
    images: product.images || [],
    variants: product.variants?.length
      ? product.variants.map((v) => ({
          _id: v._id,
          label: v.label || '',
          weightGrams: v.weightGrams || '',
          sku: v.sku || '',
          price: v.price || '',
          stockQty: v.stockQty || '',
        }))
      : [{ ...emptyVariant }],
    active: product.active ?? true,
  };
};

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: isEditing,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const categories = categoriesData?.data || [];

  const initialFormData = useMemo(
    () => getInitialFormData(productData?.data),
    [productData?.data]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Sync form data when product data loads
  const productId = productData?.data?._id;
  const [lastLoadedId, setLastLoadedId] = useState(null);
  if (productId && productId !== lastLoadedId) {
    setFormData(getInitialFormData(productData.data));
    setLastLoadedId(productId);
  }

  const saveMutation = useMutation({
    mutationFn: (data) => (isEditing ? updateProduct(id, data) : createProduct(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to save product';
      setErrors({ submit: message });
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...emptyVariant }],
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleImagesChange = (newImages) => {
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.region.trim()) newErrors.region = 'Region is required';
    if (!formData.roast) newErrors.roast = 'Roast level is required';
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) 
      newErrors.basePrice = 'Valid base price is required';
    if (!formData.image.trim()) newErrors.image = 'Primary image URL is required';

    formData.variants.forEach((v, i) => {
      if (!v.label.trim()) newErrors[`variant_${i}_label`] = 'Label required';
      if (!v.weightGrams || v.weightGrams <= 0)
        newErrors[`variant_${i}_weight`] = 'Valid weight required';
      if (!v.sku.trim()) newErrors[`variant_${i}_sku`] = 'SKU required';
      if (!v.price || v.price <= 0) newErrors[`variant_${i}_price`] = 'Valid price required';
      if (v.stockQty === '' || v.stockQty < 0)
        newErrors[`variant_${i}_stock`] = 'Valid stock required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      region: formData.region.trim(),
      roast: formData.roast,
      category: formData.category,
      features: formData.features
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      processing: formData.processing.trim(),
      basePrice: parseFloat(formData.basePrice),
      image: formData.image.trim(),
      images: formData.images,
      variants: formData.variants.map((v) => ({
        ...(v._id && { _id: v._id }),
        label: v.label.trim(),
        weightGrams: parseInt(v.weightGrams, 10),
        sku: v.sku.trim(),
        price: parseFloat(v.price),
        stockQty: parseInt(v.stockQty, 10),
      })),
      active: formData.active,
    };

    saveMutation.mutate(payload);
  };

  if (isEditing && productLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'New Product'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ? 'Update product details and variants' : 'Add a new coffee product'}
          </p>
        </div>
      </div>

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ethiopian Yirgacheffe"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region *</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.region ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ethiopia"
              />
              {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roast Level *
              </label>
              <select
                name="roast"
                value={formData.roast}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.roast ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="Light">Light</option>
                <option value="Medium">Medium</option>
                <option value="Dark">Dark</option>
              </select>
              {errors.roast && <p className="text-red-500 text-sm mt-1">{errors.roast}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the coffee's unique characteristics..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <input
                type="text"
                name="features"
                value={formData.features}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Organic, Fair Trade, Single Origin (comma separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Processing Method
              </label>
              <input
                type="text"
                name="processing"
                value={formData.processing}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Washed, Natural, Honey"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price * (reference only)
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.basePrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12.99"
              />
              {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Image URL *
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.image ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="/images/product.jpg or https://..."
              />
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Product is active and visible to customers
              </label>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
          <MultiImageUpload
            images={formData.images}
            onImagesChange={handleImagesChange}
            maxImages={5}
            label="Upload product images (up to 5)"
          />
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Variant {index + 1}
                  </span>
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Label *</label>
                    <input
                      type="text"
                      value={variant.label}
                      onChange={(e) =>
                        handleVariantChange(index, 'label', e.target.value)
                      }
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                        errors[`variant_${index}_label`]
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="250g"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Weight (g) *
                    </label>
                    <input
                      type="number"
                      value={variant.weightGrams}
                      onChange={(e) =>
                        handleVariantChange(index, 'weightGrams', e.target.value)
                      }
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                        errors[`variant_${index}_weight`]
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="250"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SKU *</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) =>
                        handleVariantChange(index, 'sku', e.target.value)
                      }
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                        errors[`variant_${index}_sku`]
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="ETH-YRG-250"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Price (AED) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(index, 'price', e.target.value)
                      }
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                        errors[`variant_${index}_price`]
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="26.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Stock *</label>
                    <input
                      type="number"
                      value={variant.stockQty}
                      onChange={(e) =>
                        handleVariantChange(index, 'stockQty', e.target.value)
                      }
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                        errors[`variant_${index}_stock`]
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
