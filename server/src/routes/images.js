import { Router } from 'express';
import multer from 'multer';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadImage, deleteImage } from '../services/cloudinary.js';

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

// GET /api/images - List all images
router.get('/', async (req, res) => {
  try {
    const { category, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM images';
    const params = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY uploaded_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM images';
    if (category) {
      countQuery += ' WHERE category = $1';
    }
    const countResult = await pool.query(countQuery, category ? [category] : []);

    // Get unique categories
    const categoriesResult = await pool.query(
      'SELECT DISTINCT category FROM images WHERE category IS NOT NULL'
    );

    res.json({
      images: result.rows,
      total: parseInt(countResult.rows[0].count),
      categories: categoriesResult.rows.map(r => r.category),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// GET /api/images/:id - Get single image
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM images WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// POST /api/images/upload - Upload image (admin only)
router.post('/upload', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { alt_text, category } = req.body;

    // Upload to Cloudinary
    const cloudinaryResult = await uploadImage(req.file.buffer, {
      folder: category ? `caspary-hat-co/${category}` : 'caspary-hat-co/media'
    });

    // Save to database
    const result = await pool.query(
      `INSERT INTO images (filename, url, cloudinary_public_id, alt_text, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.file.originalname,
        cloudinaryResult.url,
        cloudinaryResult.publicId,
        alt_text || null,
        category || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST /api/images/upload-multiple - Upload multiple images (admin only)
router.post('/upload-multiple', authenticate, requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const { category } = req.body;
    const uploadedImages = [];

    for (const file of req.files) {
      try {
        // Upload to Cloudinary
        const cloudinaryResult = await uploadImage(file.buffer, {
          folder: category ? `caspary-hat-co/${category}` : 'caspary-hat-co/media'
        });

        // Save to database
        const result = await pool.query(
          `INSERT INTO images (filename, url, cloudinary_public_id, alt_text, category)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [
            file.originalname,
            cloudinaryResult.url,
            cloudinaryResult.publicId,
            null,
            category || null
          ]
        );

        uploadedImages.push(result.rows[0]);
      } catch (uploadError) {
        console.error(`Failed to upload ${file.originalname}:`, uploadError);
      }
    }

    res.status(201).json({
      uploaded: uploadedImages,
      count: uploadedImages.length
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// PUT /api/images/:id - Update image metadata (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, category } = req.body;

    const result = await pool.query(
      `UPDATE images SET
        alt_text = COALESCE($1, alt_text),
        category = COALESCE($2, category)
       WHERE id = $3
       RETURNING *`,
      [alt_text, category, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// DELETE /api/images/:id - Delete image (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get image to get Cloudinary public ID
    const image = await pool.query(
      'SELECT cloudinary_public_id FROM images WHERE id = $1',
      [id]
    );

    if (image.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from Cloudinary
    if (image.rows[0].cloudinary_public_id) {
      try {
        await deleteImage(image.rows[0].cloudinary_public_id);
      } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError);
        // Continue with database deletion anyway
      }
    }

    // Delete from database
    await pool.query('DELETE FROM images WHERE id = $1', [id]);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;
