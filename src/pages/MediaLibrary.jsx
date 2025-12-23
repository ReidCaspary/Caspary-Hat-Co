import React, { useState, useEffect } from "react";
import { User, Image } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Copy, Check, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function MediaLibrary() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    file: null
  });
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (currentUser.role !== 'admin') {
          window.location.href = '/';
        }
      } catch (error) {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const { data: images, isLoading: imagesLoading } = useQuery({
    queryKey: ['images'],
    queryFn: () => Image.findMany(),
    initialData: [],
    enabled: !!user && user.role === 'admin'
  });

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      return Image.upload(data.file, {
        alt_text: data.name,
        category: data.description
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      setUploadForm({ name: "", description: "", file: null });
      setUploadStatus({ type: 'success', message: 'Image uploaded successfully!' });
      setTimeout(() => setUploadStatus(null), 3000);
    },
    onError: (error) => {
      setUploadStatus({ type: 'error', message: 'Failed to upload image. Please try again.' });
      setTimeout(() => setUploadStatus(null), 3000);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => Image.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      setSelectedImage(null);
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.name) {
      setUploadStatus({ type: 'error', message: 'Please provide a name and select a file.' });
      return;
    }
    uploadMutation.mutate(uploadForm);
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[var(--gray-medium)]">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-[var(--primary)] mb-4">Media Library</h1>
          <div className="w-32 h-2 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] rounded-full mb-4" />
          <p className="text-lg text-[var(--gray-medium)]">Upload and manage images for your website</p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-[var(--primary)] mb-6">Upload New Image</h2>
          
          {uploadStatus && (
            <Alert className={`mb-6 ${uploadStatus.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              {uploadStatus.type === 'success' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription className={uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {uploadStatus.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                Image Name *
              </label>
              <Input
                type="text"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="Enter image name"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                Description
              </label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Add a description (optional)"
                rows={3}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                Select Image File *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-[var(--primary)]/30 rounded-lg cursor-pointer hover:border-[var(--accent)] transition-colors bg-[var(--primary)]/5 hover:bg-[var(--accent)]/5"
                >
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-[var(--primary)]" />
                    <p className="text-sm font-semibold text-[var(--primary)]">
                      {uploadForm.file ? uploadForm.file.name : 'Click to upload image'}
                    </p>
                    <p className="text-xs text-[var(--gray-medium)] mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={uploadMutation.isPending}
              className="w-full bg-[var(--primary)] hover:bg-[var(--accent)] text-white font-bold py-4 rounded-lg transition-all duration-300 shadow-lg"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
            </Button>
          </form>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-[var(--primary)] mb-6">Image Gallery</h2>
          
          {imagesLoading ? (
            <div className="text-center py-12 text-[var(--gray-medium)]">Loading images...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-[var(--gray-medium)]">
              No images uploaded yet. Upload your first image above!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[var(--primary)] truncate">{image.name}</h3>
                    {image.description && (
                      <p className="text-sm text-[var(--gray-medium)] truncate mt-1">{image.description}</p>
                    )}
                    <p className="text-xs text-[var(--gray-medium)] mt-2">
                      {new Date(image.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Detail Modal */}
        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[var(--primary)]">
                  {selectedImage.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    className="w-full h-auto"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-[var(--primary)] block mb-2">
                      Image URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={selectedImage.url}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        onClick={() => copyToClipboard(selectedImage.url)}
                        variant="outline"
                        className="flex-shrink-0"
                      >
                        {copiedUrl === selectedImage.url ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {selectedImage.description && (
                    <div>
                      <label className="text-sm font-semibold text-[var(--primary)] block mb-2">
                        Description
                      </label>
                      <p className="text-[var(--gray-medium)]">{selectedImage.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-[var(--primary)] block mb-2">
                      Upload Date
                    </label>
                    <p className="text-[var(--gray-medium)]">
                      {new Date(selectedImage.uploaded_at).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[var(--primary)] block mb-2">
                      Uploaded By
                    </label>
                    <p className="text-[var(--gray-medium)]">{selectedImage.created_by}</p>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this image?')) {
                          deleteMutation.mutate(selectedImage.id);
                        }
                      }}
                      variant="destructive"
                      className="w-full"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete Image'}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}