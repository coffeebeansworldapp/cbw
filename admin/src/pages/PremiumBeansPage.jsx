import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPremiumBeans,
  createPremiumBean,
  updatePremiumBean,
  deletePremiumBean,
  togglePremiumBean,
  reorderPremiumBeans,
} from '../api/premiumBeans';
import { getProducts } from '../api/products';
import { useAuth } from '../context/useAuth';
import { ImageUpload } from '../components/ImageUpload';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Star,
  X,
  ExternalLink,
} from 'lucide-react';

export function PremiumBeansPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBean, setEditingBean] = useState(null);
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  const { data: beansData, isLoading } = useQuery({
    queryKey: ['premium-beans'],
    queryFn: getPremiumBeans,
  });

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts({ limit: 100 }), // Get some products for linking
  });

  const createMutation = useMutation({
    mutationFn: createPremiumBean,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-beans'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePremiumBean(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-beans'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePremiumBean,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['premium-beans'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: togglePremiumBean,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['premium-beans'] }),
  });

  const reorderMutation = useMutation({
    mutationFn: reorderPremiumBeans,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['premium-beans'] }),
  });

  const beans = beansData?.beans || [];
  const products = productsData?.data || [];
  const canEdit = hasRole('OWNER', 'MANAGER');

  const openModal = (bean = null) => {
    setEditingBean(bean);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingBean(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('dragIndex', index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'));
    if (dragIndex === dropIndex) return;

    const newBeans = [...beans];
    const [removed] = newBeans.splice(dragIndex, 1);
    newBeans.splice(dropIndex, 0, removed);

    const beanIds = newBeans.map((b) => b._id);
    reorderMutation.mutate(beanIds);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Premium Beans</h1>
          <p className="text-gray-500 mt-1">
            Manage the luxury beans section shown on current home screen carousel
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Premium Bean
          </button>
        )}
      </div>

      {/* Beans List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : beans.length === 0 ? (
          <div className="p-8 text-center">
            <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No premium beans yet
            </h3>
            <p className="text-gray-500 mb-4">
              Add products to the luxury collection displayed on the home page
            </p>
            {canEdit && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800"
              >
                <Plus className="h-5 w-5" />
                Add Premium Bean
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {beans.map((bean, index) => (
              <div
                key={bean._id}
                draggable={canEdit}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  !bean.active ? 'opacity-60' : ''
                }`}
              >
                {/* Drag Handle */}
                {canEdit && (
                  <div className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical className="h-5 w-5" />
                  </div>
                )}

                {/* Image Preview */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-orange-50 flex-shrink-0 flex items-center justify-center p-2">
                  {bean.image ? (
                    <img
                      src={bean.image}
                      alt={bean.titleMain}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Star className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 truncate">
                      {bean.titleMain} {bean.titleSub}
                    </h3>
                    {bean.productId && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                        LINKED
                      </span>
                    )}
                    {bean.cloudinaryPublicId && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium border border-blue-200">
                        CLOUDINARY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-800 font-medium uppercase tracking-wider">
                    {bean.kicker}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {bean.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {bean.pills?.map((pill, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMutation.mutate(bean._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        bean.active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={bean.active ? 'Hide bean' : 'Show bean'}
                    >
                      {bean.active ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => openModal(bean)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit bean"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(bean._id, `${bean.titleMain} ${bean.titleSub}`)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete bean"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <BeanModal
          bean={editingBean}
          products={products}
          onClose={closeModal}
          onSave={(data) => {
            if (editingBean) {
              updateMutation.mutate({ id: editingBean._id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function BeanModal({ bean, products, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    beanId: bean?.beanId || '',
    kicker: bean?.kicker || 'Coffee Beans World • Premium Collection',
    titleMain: bean?.titleMain || '',
    titleSub: bean?.titleSub || '',
    desc: bean?.desc || '',
    pills: bean?.pills?.join(', ') || '',
    image: bean?.image || '',
    cloudinaryPublicId: bean?.cloudinaryPublicId || '',
    imgScale: bean?.imgScale || 1.0,
    imgX: bean?.imgX || 0,
    productId: bean?.productId || '',
    active: bean?.active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      pills: formData.pills.split(',').map(s => s.trim()).filter(Boolean),
      productId: formData.productId || null
    };
    onSave(submissionData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = ({ url, id }) => {
    setFormData((prev) => ({
      ...prev,
      image: url,
      cloudinaryPublicId: id,
    }));
  };

  const handleImageRemove = () => {
    setFormData((prev) => ({
      ...prev,
      image: '',
      cloudinaryPublicId: '',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {bean ? 'Edit Premium Bean' : 'Add New Premium Bean'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bean Slug (Unique ID) *
                </label>
                <input
                  type="text"
                  name="beanId"
                  value={formData.beanId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="jamaica-blue-mountain"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kicker (Small top text)
                </label>
                <input
                  type="text"
                  name="kicker"
                  value={formData.kicker}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Title *
                </label>
                <input
                  type="text"
                  name="titleMain"
                  value={formData.titleMain}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Jamaica"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Title *
                </label>
                <input
                  type="text"
                  name="titleSub"
                  value={formData.titleSub}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Blue Mountain"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="desc"
                value={formData.desc}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Describe the flavor profile..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pills (Comma separated)
              </label>
              <input
                type="text"
                name="pills"
                value={formData.pills}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="100% Arabica, Roast: Medium, Origin: Jamaica"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <ImageUpload
                label="Bean Image *"
                currentImageUrl={formData.image}
                onUploadComplete={handleImageUpload}
                onRemove={handleImageRemove}
              />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Linked Product (for Shop button)
                  </label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="">None (Shows all collection)</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Img Scale
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="imgScale"
                      value={formData.imgScale}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Img Shift X
                    </label>
                    <input
                      type="number"
                      name="imgX"
                      value={formData.imgX}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700">
                    Active (visible in showcase)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : bean ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PremiumBeansPage;
