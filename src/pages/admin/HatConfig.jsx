import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HatConfig, Image as ImageApi } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Upload,
  Palette,
  HardHat,
  Layers,
  GripVertical,
  Check,
  ToggleLeft,
  ToggleRight,
  Settings
} from "lucide-react";
import { useDropzone } from "react-dropzone";

// Tab component
function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// Hat Types Tab Content
function HatTypesTab() {
  const queryClient = useQueryClient();
  const [editingHat, setEditingHat] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: hatTypes = [], isLoading } = useQuery({
    queryKey: ["hat-types"],
    queryFn: () => HatConfig.getHatTypes(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => HatConfig.createHatType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hat-types"] });
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => HatConfig.updateHatType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hat-types"] });
      setEditingHat(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => HatConfig.deleteHatType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hat-types"] });
    },
  });

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading hat types...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">{hatTypes.length} hat types configured</p>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Hat Type
        </Button>
      </div>

      {/* Hat Types List */}
      <div className="space-y-4">
        {hatTypes.map((hatType) => (
          <div
            key={hatType.id}
            className="bg-white rounded-lg border p-4 flex items-center gap-4"
          >
            {/* Preview Image */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {hatType.preview_image_url ? (
                <img
                  src={hatType.preview_image_url}
                  alt={hatType.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <HardHat className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{hatType.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                  {hatType.slug}
                </span>
                {!hatType.active && (
                  <span className="text-xs px-2 py-0.5 bg-red-100 rounded-full text-red-600">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">{hatType.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {hatType.parts?.length || 0} colorizable parts
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingHat(hatType)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm(`Delete "${hatType.name}"?`)) {
                    deleteMutation.mutate(hatType.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {hatTypes.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <HardHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hat types configured yet</p>
            <Button className="mt-4" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Hat Type
            </Button>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {(editingHat || isCreating) && (
        <HatTypeModal
          hatType={editingHat}
          onClose={() => {
            setEditingHat(null);
            setIsCreating(false);
          }}
          onSave={(data) => {
            if (editingHat) {
              updateMutation.mutate({ id: editingHat.id, data });
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

// Hat Type Edit Modal
function HatTypeModal({ hatType, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    slug: hatType?.slug || "",
    name: hatType?.name || "",
    description: hatType?.description || "",
    category: hatType?.category || "",
    preview_image_url: hatType?.preview_image_url || "",
    front_image_url: hatType?.front_image_url || "",
    back_image_url: hatType?.back_image_url || "",
    front_marker_color: hatType?.front_marker_color || "",
    mesh_marker_color: hatType?.mesh_marker_color || "",
    brim_marker_color: hatType?.brim_marker_color || "",
    rope_marker_color: hatType?.rope_marker_color || "",
    active: hatType?.active !== false,
    parts: hatType?.parts || [],
  });

  const [uploading, setUploading] = useState(null);
  const [samplingFor, setSamplingFor] = useState(null); // Which part we're sampling color for
  const colorSampleCanvasRef = React.useRef(null);

  const uploadImage = async (file, field) => {
    setUploading(field);
    try {
      const result = await ImageApi.upload(file, { category: "hats" });
      setFormData((prev) => ({ ...prev, [field]: result.url }));
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(null);
    }
  };

  const addPart = () => {
    setFormData((prev) => ({
      ...prev,
      parts: [
        ...prev.parts,
        { partId: "", name: "", description: "", defaultColor: "#ffffff" },
      ],
    }));
  };

  const updatePart = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const removePart = (index) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index),
    }));
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  };

  // Handle clicking on image to sample color
  const handleImageClick = (e) => {
    if (!samplingFor || !colorSampleCanvasRef.current) return;

    const canvas = colorSampleCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext("2d");
    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;

    const hex = "#" + [pixel[0], pixel[1], pixel[2]]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("");

    const fieldName = `${samplingFor}_marker_color`;
    setFormData((prev) => ({ ...prev, [fieldName]: hex }));
    setSamplingFor(null);
  };

  // Load image to canvas for color sampling
  React.useEffect(() => {
    if (formData.front_image_url && colorSampleCanvasRef.current) {
      const canvas = colorSampleCanvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = formData.front_image_url;
    }
  }, [formData.front_image_url]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const markerParts = [
    { id: "front", label: "Front Panel", color: formData.front_marker_color },
    { id: "mesh", label: "Mesh/Back", color: formData.mesh_marker_color },
    { id: "brim", label: "Brim/Bill", color: formData.brim_marker_color },
    { id: "rope", label: "Rope", color: formData.rope_marker_color },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h3 className="font-semibold text-lg">
            {hatType ? "Edit Hat Type" : "Add Hat Type"}
          </h3>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="The Classic"
                required
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="classic"
                  required
                />
                <Button type="button" variant="outline" onClick={generateSlug}>
                  Generate
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Classic Trucker Hat with Mesh Back..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="Mesh Back"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, active: !prev.active }))
                  }
                  className="text-gray-600"
                >
                  {formData.active ? (
                    <ToggleRight className="w-8 h-8 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                </button>
                <span>Active</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div>
            <Label className="mb-2 block">Images</Label>
            <div className="grid grid-cols-3 gap-4">
              {/* Preview Image */}
              <ImageUploadBox
                label="Preview"
                value={formData.preview_image_url}
                uploading={uploading === "preview_image_url"}
                onUpload={(file) => uploadImage(file, "preview_image_url")}
                onClear={() =>
                  setFormData((prev) => ({ ...prev, preview_image_url: "" }))
                }
              />
              {/* Front Image */}
              <ImageUploadBox
                label="Front View"
                value={formData.front_image_url}
                uploading={uploading === "front_image_url"}
                onUpload={(file) => uploadImage(file, "front_image_url")}
                onClear={() =>
                  setFormData((prev) => ({ ...prev, front_image_url: "" }))
                }
              />
              {/* Back Image */}
              <ImageUploadBox
                label="Back View"
                value={formData.back_image_url}
                uploading={uploading === "back_image_url"}
                onUpload={(file) => uploadImage(file, "back_image_url")}
                onClear={() =>
                  setFormData((prev) => ({ ...prev, back_image_url: "" }))
                }
              />
            </div>
          </div>

          {/* Color Sampling Section */}
          {formData.front_image_url && (
            <div>
              <Label className="mb-2 block">
                <Palette className="w-4 h-4 inline mr-1" />
                Sample Marker Colors from Image
              </Label>
              <p className="text-xs text-gray-500 mb-3">
                Click a part button below, then click on the image where that color appears.
                These colors identify which parts of your image can be recolored.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Color buttons */}
                <div className="space-y-2">
                  {markerParts.map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => setSamplingFor(samplingFor === part.id ? null : part.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        samplingFor === part.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium text-sm">{part.label}</span>
                      <div className="flex items-center gap-2">
                        {part.color ? (
                          <>
                            <div
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: part.color }}
                            />
                            <span className="text-xs text-gray-500 font-mono">
                              {part.color}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">Click to sample</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Image canvas for sampling */}
                <div className="relative">
                  <canvas
                    ref={colorSampleCanvasRef}
                    onClick={handleImageClick}
                    className={`w-full h-auto rounded-lg border-2 ${
                      samplingFor
                        ? "cursor-crosshair border-blue-500"
                        : "cursor-default border-gray-200"
                    }`}
                    style={{ maxHeight: "250px", objectFit: "contain" }}
                  />
                  {samplingFor && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Click to sample {markerParts.find(p => p.id === samplingFor)?.label}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Colorizable Parts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Colorizable Parts</Label>
              <Button type="button" size="sm" variant="outline" onClick={addPart}>
                <Plus className="w-4 h-4 mr-1" />
                Add Part
              </Button>
            </div>
            <div className="space-y-3">
              {formData.parts.map((part, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <Input
                    placeholder="Part ID (e.g., front)"
                    value={part.partId}
                    onChange={(e) => updatePart(index, "partId", e.target.value)}
                    className="w-28"
                  />
                  <Input
                    placeholder="Display Name"
                    value={part.name}
                    onChange={(e) => updatePart(index, "name", e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={part.defaultColor || "#ffffff"}
                      onChange={(e) =>
                        updatePart(index, "defaultColor", e.target.value)
                      }
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">Default</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => removePart(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {formData.parts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No parts added. Click "Add Part" to add colorizable sections.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Hat Type"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Image Upload Box Component
function ImageUploadBox({ label, value, uploading, onUpload, onClear }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && onUpload(files[0]),
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: false,
  });

  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {value ? (
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-[var(--accent)] bg-orange-50"
              : "border-gray-300 hover:border-gray-400"
          } ${uploading ? "opacity-50" : ""}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">Upload</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Color Presets Tab Content
function ColorPresetsTab() {
  const queryClient = useQueryClient();
  const [editingColor, setEditingColor] = useState(null);
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });

  const { data: colors = [], isLoading } = useQuery({
    queryKey: ["color-presets"],
    queryFn: () => HatConfig.getColorPresets(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => HatConfig.createColorPreset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["color-presets"] });
      setNewColor({ name: "", hex: "#000000" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => HatConfig.updateColorPreset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["color-presets"] });
      setEditingColor(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => HatConfig.deleteColorPreset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["color-presets"] });
    },
  });

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading colors...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Color */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-medium mb-3">Add New Color</h3>
        <div className="flex gap-4 items-end">
          <div>
            <Label>Color</Label>
            <input
              type="color"
              value={newColor.hex}
              onChange={(e) =>
                setNewColor((prev) => ({ ...prev, hex: e.target.value }))
              }
              className="w-12 h-10 rounded cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <Label>Name</Label>
            <Input
              value={newColor.name}
              onChange={(e) =>
                setNewColor((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Navy Blue"
            />
          </div>
          <div>
            <Label>Hex</Label>
            <Input
              value={newColor.hex}
              onChange={(e) =>
                setNewColor((prev) => ({ ...prev, hex: e.target.value }))
              }
              placeholder="#000000"
              className="w-28 font-mono"
            />
          </div>
          <Button
            onClick={() => createMutation.mutate(newColor)}
            disabled={!newColor.name || !newColor.hex}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {colors.map((color) => (
          <div
            key={color.id}
            className={`bg-white rounded-lg border p-3 ${
              !color.active ? "opacity-50" : ""
            }`}
          >
            <div
              className="aspect-square rounded-lg mb-2 border"
              style={{ backgroundColor: color.hex }}
            />
            {editingColor?.id === color.id ? (
              <div className="space-y-2">
                <Input
                  value={editingColor.name}
                  onChange={(e) =>
                    setEditingColor((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="text-sm"
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() =>
                      updateMutation.mutate({
                        id: color.id,
                        data: { name: editingColor.name, hex: editingColor.hex },
                      })
                    }
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingColor(null)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-medium text-sm truncate">{color.name}</p>
                <p className="text-xs text-gray-500 font-mono">{color.hex}</p>
                <div className="flex gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingColor(color)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateMutation.mutate({
                        id: color.id,
                        data: { active: !color.active },
                      })
                    }
                  >
                    {color.active ? (
                      <ToggleRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => {
                      if (window.confirm(`Delete "${color.name}"?`)) {
                        deleteMutation.mutate(color.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {colors.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No color presets configured yet</p>
        </div>
      )}

      <p className="text-sm text-gray-500">{colors.length} colors configured</p>
    </div>
  );
}

// Color Combinations Tab Content
function ColorCombinationsTab() {
  const queryClient = useQueryClient();
  const [editingCombo, setEditingCombo] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: combinations = [], isLoading } = useQuery({
    queryKey: ["color-combinations"],
    queryFn: () => HatConfig.getColorCombinations(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => HatConfig.createColorCombination(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["color-combinations"] });
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => HatConfig.updateColorCombination(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["color-combinations"] });
      setEditingCombo(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => HatConfig.deleteColorCombination(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["color-combinations"] });
    },
  });

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading combinations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">{combinations.length} color combinations</p>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Combination
        </Button>
      </div>

      {/* Combinations List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {combinations.map((combo) => (
          <div
            key={combo.id}
            className={`bg-white rounded-lg border p-4 ${
              !combo.active ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">{combo.name}</h3>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingCombo(combo)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => {
                    if (window.confirm(`Delete "${combo.name}"?`)) {
                      deleteMutation.mutate(combo.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <ColorSwatch color={combo.front_color} label="Front" />
              <ColorSwatch color={combo.mesh_color} label="Mesh" />
              <ColorSwatch color={combo.brim_color} label="Brim" />
              {combo.rope_color && (
                <ColorSwatch color={combo.rope_color} label="Rope" />
              )}
            </div>
          </div>
        ))}
      </div>

      {combinations.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No color combinations configured yet</p>
          <Button className="mt-4" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Combination
          </Button>
        </div>
      )}

      {/* Edit/Create Modal */}
      {(editingCombo || isCreating) && (
        <CombinationModal
          combination={editingCombo}
          onClose={() => {
            setEditingCombo(null);
            setIsCreating(false);
          }}
          onSave={(data) => {
            if (editingCombo) {
              updateMutation.mutate({ id: editingCombo.id, data });
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

// Color Swatch Display
function ColorSwatch({ color, label }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-10 h-10 rounded-lg border shadow-inner"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}

// Combination Edit Modal
function CombinationModal({ combination, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    name: combination?.name || "",
    front_color: combination?.front_color || "#172c63",
    mesh_color: combination?.mesh_color || "#ffffff",
    brim_color: combination?.brim_color || "#172c63",
    rope_color: combination?.rope_color || "",
    active: combination?.active !== false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">
            {combination ? "Edit Combination" : "Add Combination"}
          </h3>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Classic Navy"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ColorPickerField
              label="Front Panel"
              value={formData.front_color}
              onChange={(hex) =>
                setFormData((prev) => ({ ...prev, front_color: hex }))
              }
            />
            <ColorPickerField
              label="Mesh"
              value={formData.mesh_color}
              onChange={(hex) =>
                setFormData((prev) => ({ ...prev, mesh_color: hex }))
              }
            />
            <ColorPickerField
              label="Brim"
              value={formData.brim_color}
              onChange={(hex) =>
                setFormData((prev) => ({ ...prev, brim_color: hex }))
              }
            />
            <ColorPickerField
              label="Rope (optional)"
              value={formData.rope_color}
              onChange={(hex) =>
                setFormData((prev) => ({ ...prev, rope_color: hex }))
              }
            />
          </div>

          {/* Preview */}
          <div>
            <Label className="mb-2 block">Preview</Label>
            <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
              <ColorSwatch color={formData.front_color} label="Front" />
              <ColorSwatch color={formData.mesh_color} label="Mesh" />
              <ColorSwatch color={formData.brim_color} label="Brim" />
              {formData.rope_color && (
                <ColorSwatch color={formData.rope_color} label="Rope" />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Color Picker Field
function ColorPickerField({ label, value, onChange }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer"
        />
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
}

// Settings Tab Content
function SettingsTab() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["hat-designer-settings"],
    queryFn: () => HatConfig.getSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => HatConfig.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hat-designer-settings"] });
    },
  });

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading settings...</div>;
  }

  const isEnabled = settings?.enabled !== false;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-lg mb-4">Hat Designer Visibility</h3>
        <p className="text-gray-600 mb-6">
          Control whether the hat designer tool is visible to visitors on the website.
          When disabled, the designer link will be hidden from the navigation and the designer page will show a message.
        </p>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => updateMutation.mutate({ enabled: !isEnabled })}
            disabled={updateMutation.isPending}
            className="flex items-center gap-3 p-4 rounded-lg border-2 transition-all hover:bg-gray-50"
          >
            {isEnabled ? (
              <ToggleRight className="w-10 h-10 text-green-600" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-gray-400" />
            )}
            <div className="text-left">
              <p className="font-medium">
                Hat Designer is {isEnabled ? "Enabled" : "Disabled"}
              </p>
              <p className="text-sm text-gray-500">
                {isEnabled
                  ? "Visitors can access the hat designer tool"
                  : "Hat designer is hidden from visitors"}
              </p>
            </div>
          </button>
        </div>

        {updateMutation.isPending && (
          <p className="text-sm text-gray-500 mt-4">Saving...</p>
        )}
      </div>
    </div>
  );
}

// Main Component
export default function HatConfigPage() {
  const [activeTab, setActiveTab] = useState("hat-types");

  const tabs = [
    { id: "hat-types", label: "Hat Types", icon: <HardHat className="w-4 h-4" /> },
    { id: "colors", label: "Color Presets", icon: <Palette className="w-4 h-4" /> },
    { id: "combinations", label: "Combinations", icon: <Layers className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hat Designer Config</h1>
        <p className="text-gray-600">
          Manage hat types, color presets, and color combinations for the designer
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "hat-types" && <HatTypesTab />}
        {activeTab === "colors" && <ColorPresetsTab />}
        {activeTab === "combinations" && <ColorCombinationsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}
