import React, { useState } from "react";
import { Image } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image as ImageIcon, Check } from "lucide-react";

/**
 * ImagePicker Component
 * 
 * A reusable component for selecting images from the Media Library
 * 
 * Usage:
 * <ImagePicker 
 *   onSelect={(imageUrl) => console.log('Selected:', imageUrl)}
 *   buttonText="Choose Image"
 * />
 */
export default function ImagePicker({ onSelect, buttonText = "Select Image" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ['images-picker'],
    queryFn: () => Image.findMany(),
    initialData: [],
    enabled: isOpen
  });

  const handleSelect = (image) => {
    setSelectedImage(image);
  };

  const handleConfirm = () => {
    if (selectedImage && onSelect) {
      onSelect(selectedImage.url, selectedImage);
      setIsOpen(false);
      setSelectedImage(null);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
      >
        <ImageIcon className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[var(--primary)]">
              Select Image from Media Library
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="text-center py-12 text-[var(--gray-medium)]">Loading images...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-[var(--gray-medium)]">
              No images available. Upload images in the Media Library first.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => handleSelect(image)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all duration-200 ${
                      selectedImage?.id === image.id
                        ? 'border-[var(--accent)] shadow-lg scale-95'
                        : 'border-transparent hover:border-[var(--primary)]/30'
                    }`}
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedImage?.id === image.id && (
                      <div className="absolute top-2 right-2 w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-semibold truncate">{image.filename}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedImage(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedImage}
                  className="bg-[var(--primary)] hover:bg-[var(--accent)] text-white"
                >
                  Confirm Selection
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}