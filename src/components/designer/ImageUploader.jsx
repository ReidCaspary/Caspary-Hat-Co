import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { UploadFile } from "@/api/apiClient";

export default function ImageUploader({
  onAddImage,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageSize, setImageSize] = useState(100);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploading(true);
    setError(null);

    try {
      const result = await UploadFile(file);

      onAddImage({
        type: "image",
        url: result.file_url,
        width: imageSize,
        height: imageSize,
        x: 200,
        y: 120,
      });

      setPreviewUrl(null);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  }, [onAddImage, imageSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleSizeChange = (value) => {
    setImageSize(value);
    if (selectedElement) {
      // Maintain aspect ratio
      const ratio = selectedElement.height / selectedElement.width;
      onUpdateElement(selectedElement.id, {
        width: value,
        height: Math.round(value * ratio),
      });
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-gray-900">
        {selectedElement ? "Edit Image" : "Upload Logo"}
      </h3>

      {!selectedElement && (
        <>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-[var(--accent)] bg-[var(--accent)]/5"
                : "border-gray-300 hover:border-gray-400"
            } ${uploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-2" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : previewUrl ? (
              <div className="flex flex-col items-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-32 object-contain mb-2"
                />
                <p className="text-sm text-gray-600">Processing...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {isDragActive ? "Drop image here" : "Drag & drop your logo"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, SVG up to 10MB
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {/* Initial size selector */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm text-gray-600">Initial Size</Label>
              <span className="text-sm font-medium text-gray-900">{imageSize}px</span>
            </div>
            <Slider
              value={[imageSize]}
              min={50}
              max={200}
              step={10}
              onValueChange={([value]) => setImageSize(value)}
            />
          </div>
        </>
      )}

      {selectedElement && (
        <>
          {/* Preview of selected image */}
          <div className="bg-white p-4 rounded-lg border text-center">
            <img
              src={selectedElement.url}
              alt="Selected"
              className="max-w-full max-h-32 object-contain mx-auto"
            />
          </div>

          {/* Size control */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm text-gray-600">Size</Label>
              <span className="text-sm font-medium text-gray-900">
                {selectedElement.width}px
              </span>
            </div>
            <Slider
              value={[selectedElement.width]}
              min={30}
              max={250}
              step={5}
              onValueChange={([value]) => handleSizeChange(value)}
            />
          </div>

          {/* Delete button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteElement(selectedElement.id)}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Image
          </Button>
        </>
      )}

      {/* Tip */}
      <p className="text-xs text-gray-500 text-center">
        {selectedElement
          ? "Drag image on canvas to reposition"
          : "For best results, use PNG with transparent background"}
      </p>
    </div>
  );
}
