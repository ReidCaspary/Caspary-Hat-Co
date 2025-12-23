import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ImageApi } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Trash2,
  Copy,
  Check,
  Search,
  Grid,
  List,
  Image as ImageIcon,
  X
} from "lucide-react";
import { format } from "date-fns";
import { useDropzone } from "react-dropzone";

export default function Media() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['images'],
    queryFn: () => ImageApi.findMany({ limit: 500 }),
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => ImageApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ImageApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      setSelectedImage(null);
    }
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        await uploadMutation.mutateAsync(file);
      }
    } finally {
      setUploading(false);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    }
  });

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredImages = images.filter(img =>
    img.alt_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-600">Upload and manage your images</p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-[var(--accent)] bg-orange-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-[var(--accent)]' : 'text-gray-400'}`} />
        {uploading ? (
          <p className="text-gray-600">Uploading...</p>
        ) : isDragActive ? (
          <p className="text-[var(--accent)] font-medium">Drop images here</p>
        ) : (
          <>
            <p className="text-gray-600 mb-1">Drag & drop images here, or click to select</p>
            <p className="text-sm text-gray-400">PNG, JPG, GIF, WebP up to 10MB</p>
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Images */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No images found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-square">
                <img
                  src={image.url}
                  alt={image.alt_text || 'Image'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(image.url, image.id);
                  }}
                >
                  {copiedId === image.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this image?')) {
                      deleteMutation.mutate(image.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Preview</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">URL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredImages.map((image) => (
                <tr key={image.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img
                      src={image.url}
                      alt={image.alt_text || 'Image'}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600 truncate max-w-xs">{image.url}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {image.created_at ? format(new Date(image.created_at), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(image.url, image.id)}
                      >
                        {copiedId === image.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm('Delete this image?')) {
                            deleteMutation.mutate(image.id);
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
        </div>
      )}

      <p className="text-sm text-gray-500 text-center">
        {filteredImages.length} images
      </p>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Image Details</h3>
              <Button size="sm" variant="ghost" onClick={() => setSelectedImage(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-6">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt_text || 'Image'}
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">URL</p>
                  <div className="flex gap-2">
                    <Input value={selectedImage.url} readOnly className="text-sm" />
                    <Button onClick={() => copyToClipboard(selectedImage.url, selectedImage.id)}>
                      {copiedId === selectedImage.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                {selectedImage.created_at && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Uploaded</p>
                    <p>{format(new Date(selectedImage.created_at), 'MMMM d, yyyy h:mm a')}</p>
                  </div>
                )}
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (window.confirm('Delete this image?')) {
                      deleteMutation.mutate(selectedImage.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Image
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
