import { Router } from 'express';
import multer from 'multer';
import { uploadImage, removeBackground } from '../services/cloudinary.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// POST /api/designer/upload - Upload image for designer (public, no auth required)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary in designer-specific folder
    const cloudinaryResult = await uploadImage(req.file.buffer, {
      folder: 'caspary-hat-co/designer-uploads'
    });

    res.status(201).json({
      url: cloudinaryResult.url,
      publicId: cloudinaryResult.publicId,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height
    });
  } catch (error) {
    console.error('Designer upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST /api/designer/remove-background - Remove background from image using Cloudinary AI (public)
router.post('/remove-background', async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    // Use Cloudinary's background removal
    const result = await removeBackground(publicId);

    res.json({
      url: result.url,
      publicId: result.publicId
    });
  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({ error: 'Failed to remove background' });
  }
});

export default router;
