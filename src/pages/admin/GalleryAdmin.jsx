import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GalleryItem, Image } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  Image as ImageIcon,
  GripVertical,
  Check,
  ChevronUp,
  ChevronDown,
  Upload,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function GalleryAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['gallery-items-admin'],
    queryFn: () => GalleryItem.findMany({ includeInactive: true }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => GalleryItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-items-admin'] });
      setIsCreating(false);
      setEditingItem(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => GalleryItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-items-admin'] });
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => GalleryItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-items-admin'] });
    }
  });

  const reorderMutation = useMutation({
    mutationFn: (order) => GalleryItem.reorder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-items-admin'] });
    }
  });

  const addImagesMutation = useMutation({
    mutationFn: ({ id, images }) => GalleryItem.addImages(id, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-items-admin'] });
    }
  });

  const removeImageMutation = useMutation({
    mutationFn: ({ itemId, imageId }) => GalleryItem.removeImage(itemId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-items-admin'] });
    }
  });

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (formData) => {
    if (editingItem?.id) {
      await updateMutation.mutateAsync({ id: editingItem.id, data: formData });
      // If there are new images to add
      if (formData.newImages && formData.newImages.length > 0) {
        await addImagesMutation.mutateAsync({ id: editingItem.id, images: formData.newImages });
      }
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    reorderMutation.mutate(newItems.map(item => item.id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-600">Manage your portfolio gallery items</p>
        </div>
        <Button
          onClick={() => { setIsCreating(true); setEditingItem({}); }}
          className="bg-[#172c63] hover:bg-[#0f1d42] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Gallery Item
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search gallery items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Gallery Items List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No gallery items yet</p>
            <Button
              className="mt-4 bg-[#172c63] hover:bg-[#0f1d42] text-white"
              onClick={() => { setIsCreating(true); setEditingItem({}); }}
            >
              Create your first gallery item
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-16">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-20">Preview</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Images</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0 || reorderMutation.isPending}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <span className="text-xs text-gray-400">{index + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === filteredItems.length - 1 || reorderMutation.isPending}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0].image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{item.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 bg-[var(--orange)]/10 text-[var(--orange)] rounded text-sm font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600">
                      {item.images?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      item.active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {item.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm('Delete this gallery item?')) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit/Create Modal */}
      <Dialog open={!!editingItem} onOpenChange={() => { setEditingItem(null); setIsCreating(false); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create Gallery Item' : 'Edit Gallery Item'}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <GalleryItemForm
              item={editingItem}
              onSave={handleSave}
              onCancel={() => { setEditingItem(null); setIsCreating(false); }}
              isLoading={createMutation.isPending || updateMutation.isPending}
              onRemoveImage={(imageId) => {
                if (editingItem.id) {
                  removeImageMutation.mutate({ itemId: editingItem.id, imageId });
                }
              }}
              onReorderImages={async (order) => {
                if (editingItem.id) {
                  await GalleryItem.reorderImages(editingItem.id, order);
                  queryClient.invalidateQueries({ queryKey: ['gallery-items-admin'] });
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GalleryItemForm({ item, onSave, onCancel, isLoading, onRemoveImage, onReorderImages }) {
  const [formData, setFormData] = useState({
    title: item.title || '',
    category: item.category || '',
    description: item.description || '',
    active: item.active !== false,
  });
  const [existingImages, setExistingImages] = useState(item.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImages, setNewImages] = useState([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [reorderingImages, setReorderingImages] = useState(false);
  const fileInputRef = React.useRef(null);

  // Move image left or right in the order
  const moveImage = async (index, direction) => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= existingImages.length) return;

    // Swap images in local state
    const newOrder = [...existingImages];
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setExistingImages(newOrder);

    // Save to backend
    if (item.id && onReorderImages) {
      setReorderingImages(true);
      try {
        await onReorderImages(newOrder.map(img => img.id));
      } finally {
        setReorderingImages(false);
      }
    }
  };

  // Media library images
  const { data: mediaImages = [] } = useQuery({
    queryKey: ['images-picker'],
    queryFn: () => Image.findMany(),
    enabled: showImagePicker
  });

  // Handle file upload
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          continue;
        }

        // Upload to Cloudinary via API
        const result = await Image.upload(file, { category: 'gallery' });
        if (result?.url) {
          setNewImages(prev => [...prev, result.url]);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setNewImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectFromLibrary = (imageUrl) => {
    setNewImages(prev => [...prev, imageUrl]);
    setShowImagePicker(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Combine form data with images
    const submitData = {
      ...formData,
      images: item.id ? undefined : newImages.map(url => ({ url })),
      newImages: item.id ? newImages : undefined,
    };

    onSave(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Custom Event Hats"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Event, Business, Team Hats"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          placeholder="Brief description of this gallery item"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={formData.active}
          onChange={handleChange}
          className="rounded"
        />
        <Label htmlFor="active" className="cursor-pointer">Active (visible on gallery page)</Label>
      </div>

      {/* Existing Images (only shown when editing) */}
      {item.id && existingImages.length > 0 && (
        <div>
          <Label>Current Images (drag to reorder or use arrows)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
            {existingImages.map((img, index) => (
              <div key={img.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                  <img
                    src={img.image_url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Remove this image?')) {
                      onRemoveImage(img.id);
                      setExistingImages(prev => prev.filter(i => i.id !== img.id));
                    }
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Position indicator */}
                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
                {/* Reorder buttons */}
                <div className="absolute bottom-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    disabled={index === 0 || reorderingImages}
                    onClick={() => moveImage(index, 'left')}
                    className="w-6 h-6 bg-white/90 hover:bg-white rounded flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="w-4 h-4 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    disabled={index === existingImages.length - 1 || reorderingImages}
                    onClick={() => moveImage(index, 'right')}
                    className="w-6 h-6 bg-white/90 hover:bg-white rounded flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {reorderingImages && (
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving order...
            </p>
          )}
        </div>
      )}

      {/* Add New Images */}
      <div>
        <Label>Add Images</Label>
        <div className="space-y-3 mt-2">
          {/* File Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-all
              ${dragActive ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-gray-300 hover:border-gray-400'}
              ${uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
            `}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(Array.from(e.target.files))}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-[var(--primary)]">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, GIF, WebP up to 10MB</p>
              </div>
            )}
          </div>

          {/* URL Input & Media Library */}
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Or paste image URL..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImageUrl();
                }
              }}
            />
            <Button type="button" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={handleAddImageUrl}>
              Add
            </Button>
            <Button type="button" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={() => setShowImagePicker(true)}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Media
            </Button>
          </div>

          {/* New Images Preview */}
          {newImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {newImages.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-green-400">
                    <img
                      src={url}
                      alt={`New image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center text-red-500 text-xs p-2 text-center">
                      Invalid URL
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                    New
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Picker Modal */}
      <Dialog open={showImagePicker} onOpenChange={setShowImagePicker}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select from Media Library</DialogTitle>
          </DialogHeader>
          {mediaImages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No images in media library. Upload images in the Media section first.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 py-4">
              {mediaImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => handleSelectFromLibrary(image.url)}
                  className="cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-[var(--primary)] transition-all"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-[#172c63] hover:bg-[#0f1d42] text-white">
          {isLoading ? 'Saving...' : (item.id ? 'Save Changes' : 'Create Gallery Item')}
        </Button>
      </div>
    </form>
  );
}
