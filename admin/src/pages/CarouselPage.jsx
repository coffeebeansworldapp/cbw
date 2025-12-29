import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCarouselSlides,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  toggleCarouselSlide,
  reorderCarouselSlides,
} from '../api/carousel';
import { useAuth } from '../context/useAuth';
import { ImageUpload } from '../components/ImageUpload';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Image,
  X,
  ExternalLink,
} from 'lucide-react';

export function CarouselPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  const { data: slidesData, isLoading } = useQuery({
    queryKey: ['carousel'],
    queryFn: getCarouselSlides,
  });

  const createMutation = useMutation({
    mutationFn: createCarouselSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCarouselSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCarouselSlide,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carousel'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleCarouselSlide,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carousel'] }),
  });

  const reorderMutation = useMutation({
    mutationFn: reorderCarouselSlides,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carousel'] }),
  });

  const slides = slidesData?.slides || [];
  const canEdit = hasRole('OWNER', 'MANAGER');

  const openModal = (slide = null) => {
    setEditingSlide(slide);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingSlide(null);
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

    const newSlides = [...slides];
    const [removed] = newSlides.splice(dragIndex, 1);
    newSlides.splice(dropIndex, 0, removed);

    const slideIds = newSlides.map((s) => s._id);
    reorderMutation.mutate(slideIds);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home Carousel</h1>
          <p className="text-gray-500 mt-1">
            Manage hero slides displayed on the home page
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Slide
          </button>
        )}
      </div>

      {/* Slides List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : slides.length === 0 ? (
          <div className="p-8 text-center">
            <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No carousel slides yet
            </h3>
            <p className="text-gray-500 mb-4">
              Add your first slide to display on the home page
            </p>
            {canEdit && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800"
              >
                <Plus className="h-5 w-5" />
                Add Slide
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {slides.map((slide, index) => (
              <div
                key={slide._id}
                draggable={canEdit}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  !slide.active ? 'opacity-60' : ''
                }`}
              >
                {/* Drag Handle */}
                {canEdit && (
                  <div className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical className="h-5 w-5" />
                  </div>
                )}

                {/* Image Preview */}
                <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {slide.imageUrl ? (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {slide.title}
                  </h3>
                  {slide.subtitle && (
                    <p className="text-sm text-gray-500 truncate">
                      {slide.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {slide.ctaType || 'NONE'}
                    </span>
                    {slide.ctaLabel && (
                      <span className="text-xs text-gray-500">
                        "{slide.ctaLabel}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMutation.mutate(slide._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        slide.active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={slide.active ? 'Hide slide' : 'Show slide'}
                    >
                      {slide.active ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => openModal(slide)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit slide"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide._id, slide.title)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete slide"
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
        <SlideModal
          slide={editingSlide}
          onClose={closeModal}
          onSave={(data) => {
            if (editingSlide) {
              updateMutation.mutate({ id: editingSlide._id, data });
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

function SlideModal({ slide, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    title: slide?.title || '',
    subtitle: slide?.subtitle || '',
    imageUrl: slide?.imageUrl || '',
    cloudinaryPublicId: slide?.cloudinaryPublicId || '',
    ctaLabel: slide?.ctaLabel || 'Shop Now',
    ctaType: slide?.ctaType || 'CATEGORY',
    ctaValue: slide?.ctaValue || '',
    active: slide?.active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
      imageUrl: url,
      cloudinaryPublicId: id,
    }));
  };

  const handleImageRemove = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: '',
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
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {slide ? 'Edit Slide' : 'Add New Slide'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="Premium Coffee Collection"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="Discover our finest beans"
              />
            </div>

            <ImageUpload
              label="Slide Image *"
              currentImageUrl={formData.imageUrl}
              onUploadComplete={handleImageUpload}
              onRemove={handleImageRemove}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Label
                </label>
                <input
                  type="text"
                  name="ctaLabel"
                  value={formData.ctaLabel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Type
                </label>
                <select
                  name="ctaType"
                  value={formData.ctaType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                >
                  <option value="NONE">None</option>
                  <option value="PRODUCT">Product</option>
                  <option value="CATEGORY">Category</option>
                  <option value="COLLECTION">Collection</option>
                  <option value="URL">External URL</option>
                </select>
              </div>
            </div>

            {formData.ctaType !== 'NONE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Value
                  <span className="text-gray-400 font-normal ml-1">
                    ({formData.ctaType === 'PRODUCT' && 'Product ID'}
                    {formData.ctaType === 'CATEGORY' && 'Category slug'}
                    {formData.ctaType === 'COLLECTION' && 'Collection/filter'}
                    {formData.ctaType === 'URL' && 'Full URL'})
                  </span>
                </label>
                <input
                  type="text"
                  name="ctaValue"
                  value={formData.ctaValue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder={
                    formData.ctaType === 'URL'
                      ? 'https://...'
                      : formData.ctaType === 'CATEGORY'
                      ? 'premium'
                      : 'Enter ID or slug'
                  }
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="text-sm text-gray-700">
                Active (visible on home page)
              </label>
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
                {isLoading ? 'Saving...' : slide ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CarouselPage;
