// Hat Designer Configuration
// This file contains default/fallback config.
// Production config is fetched from the API.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============================================
// FALLBACK COLOR PRESETS
// Used when API is unavailable
// ============================================
export const COLOR_PRESETS = [
  { name: "Navy", hex: "#172c63" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
  { name: "Gray", hex: "#6b7280" },
  { name: "Red", hex: "#dc2626" },
  { name: "Orange", hex: "#d18f63" },
  { name: "Green", hex: "#16a34a" },
  { name: "Royal Blue", hex: "#2563eb" },
  { name: "Maroon", hex: "#7f1d1d" },
  { name: "Tan", hex: "#d4a574" },
  { name: "Camo Green", hex: "#4a5c3a" },
  { name: "Pink", hex: "#ec4899" },
];

// ============================================
// POPULAR COLOR COMBINATIONS
// Pre-defined color schemes users can apply
// ============================================
export const COLOR_COMBINATIONS = [
  { name: "Classic Navy", front: "#172c63", mesh: "#ffffff", brim: "#172c63", rope: "#172c63" },
  { name: "All Black", front: "#000000", mesh: "#000000", brim: "#000000", rope: "#000000" },
  { name: "Texas Orange", front: "#d18f63", mesh: "#ffffff", brim: "#d18f63", rope: "#d18f63" },
  { name: "Camo", front: "#4a5c3a", mesh: "#4a5c3a", brim: "#4a5c3a", rope: "#4a5c3a" },
];

// ============================================
// HAT TYPES
// Add new hat types by copying the structure
// ============================================
export const HAT_TYPES = {
  classic: {
    id: "classic",
    name: "The Classic",
    description: "Classic Trucker Hat with Mesh Back. Available in 5 or 6 Panels.",
    category: "Mesh Back",
    // Preview image for style selector
    previewImage: "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.19_acadc270_ik9j3h.jpg",
    // Colorizable parts for this hat type
    parts: [
      { id: "front", name: "Front Panel", description: "The front fabric panels" },
      { id: "brim", name: "Bill", description: "The hat bill/brim" },
      { id: "mesh", name: "Mesh", description: "The mesh back panels" },
    ],
    // Default colors when this hat type is selected
    defaultColors: {
      front: "#172c63",
      brim: "#172c63",
      mesh: "#ffffff",
    },
    // Hat images for colorization (user will provide white hat images)
    images: {
      front: "/hats/classic-front.png",
      back: "/hats/classic-back.png",
    },
    // Canvas configuration
    canvas: {
      width: 400,
      height: 300,
      designArea: {
        front: { x: 100, y: 60, width: 200, height: 120 },
        back: { x: 100, y: 80, width: 200, height: 100 },
      },
    },
  },
  caddie: {
    id: "caddie",
    name: "The Caddie",
    description: "Classic Rope Hat with Mesh or Fabric Back. Perfect for a vintage look.",
    category: "Rope Hat",
    // Preview image for style selector
    previewImage: "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.18_17db9e80_ltlg0x.jpg",
    // Colorizable parts for this hat type (includes rope)
    parts: [
      { id: "front", name: "Front Panel", description: "The front fabric panels" },
      { id: "brim", name: "Bill", description: "The hat bill/brim" },
      { id: "mesh", name: "Mesh", description: "The mesh back panels" },
      { id: "rope", name: "Rope", description: "The decorative rope" },
    ],
    // Default colors when this hat type is selected
    defaultColors: {
      front: "#172c63",
      brim: "#172c63",
      mesh: "#ffffff",
      rope: "#ffffff",
    },
    // Hat images for colorization (user will provide white hat images)
    images: {
      front: "/hats/caddie-front.png",
      back: "/hats/caddie-back.png",
    },
    // Canvas configuration
    canvas: {
      width: 400,
      height: 300,
      designArea: {
        front: { x: 100, y: 50, width: 200, height: 130 },
        back: { x: 100, y: 80, width: 200, height: 100 },
      },
    },
  },
};

// Helper to get all hat types as an array
export const getHatTypesArray = () => Object.values(HAT_TYPES);

// Helper to get default colors for a hat type
export const getDefaultColors = (hatTypeId, hatTypes = HAT_TYPES) => {
  const hatType = hatTypes[hatTypeId];
  return hatType ? { ...hatType.defaultColors } : { front: "#ffffff", brim: "#ffffff", mesh: "#ffffff" };
};

// ============================================
// API FETCH WITH FALLBACK
// Fetches config from API, falls back to static config
// ============================================
export const fetchHatConfig = async () => {
  try {
    const response = await fetch(`${API_URL}/api/hat-config`);
    if (!response.ok) {
      throw new Error('Failed to fetch hat configuration');
    }
    const data = await response.json();

    // If API returns data, use it
    if (data.hatTypes && Object.keys(data.hatTypes).length > 0) {
      return {
        hatTypes: data.hatTypes,
        colorPresets: data.colorPresets || COLOR_PRESETS,
        colorCombinations: data.colorCombinations || COLOR_COMBINATIONS,
      };
    }

    // Otherwise fall back to static config
    throw new Error('No hat types in API response');
  } catch (error) {
    console.warn('Using fallback hat configuration:', error.message);
    return {
      hatTypes: HAT_TYPES,
      colorPresets: COLOR_PRESETS,
      colorCombinations: COLOR_COMBINATIONS,
    };
  }
};

// Default config object for immediate use
export const DEFAULT_CONFIG = {
  hatTypes: HAT_TYPES,
  colorPresets: COLOR_PRESETS,
  colorCombinations: COLOR_COMBINATIONS,
};
