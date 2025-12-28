import { Router } from 'express';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Helper to get gallery items with their images
const getGalleryItemsWithImages = async (whereClause = '', params = []) => {
  const query = `
    SELECT
      gi.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', gii.id,
            'image_url', gii.image_url,
            'display_order', gii.display_order
          ) ORDER BY gii.display_order
        ) FILTER (WHERE gii.id IS NOT NULL),
        '[]'
      ) as images
    FROM gallery_items gi
    LEFT JOIN gallery_item_images gii ON gi.id = gii.gallery_item_id
    ${whereClause}
    GROUP BY gi.id
    ORDER BY gi.display_order, gi.created_at DESC
  `;

  const result = await pool.query(query, params);
  return result.rows;
};

// GET /api/gallery - List active gallery items (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    let whereClause = 'WHERE gi.active = true';
    const params = [];

    if (category) {
      whereClause += ' AND gi.category = $1';
      params.push(category);
    }

    const items = await getGalleryItemsWithImages(whereClause, params);

    // Get unique categories
    const categoriesResult = await pool.query(
      'SELECT DISTINCT category FROM gallery_items WHERE active = true AND category IS NOT NULL ORDER BY category'
    );

    res.json({
      items,
      categories: categoriesResult.rows.map(r => r.category)
    });
  } catch (error) {
    console.error('Get gallery items error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// GET /api/gallery/all - List all gallery items including inactive (admin only)
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const items = await getGalleryItemsWithImages();

    const countResult = await pool.query('SELECT COUNT(*) FROM gallery_items');

    res.json({
      items,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get all gallery items error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// GET /api/gallery/categories - Get distinct categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM gallery_items WHERE active = true AND category IS NOT NULL ORDER BY category'
    );

    res.json({
      categories: result.rows.map(r => r.category)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// PUT /api/gallery/reorder - Bulk reorder gallery items (admin only)
// NOTE: This must come BEFORE /:id routes to avoid matching "reorder" as an id
router.put('/reorder', authenticate, requireAdmin, async (req, res) => {
  try {
    const { order } = req.body;

    if (!order || !Array.isArray(order)) {
      return res.status(400).json({ error: 'Order array is required' });
    }

    // Update each item's display_order
    for (let i = 0; i < order.length; i++) {
      await pool.query(
        'UPDATE gallery_items SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [i, order[i]]
      );
    }

    res.json({ message: 'Gallery items reordered successfully' });
  } catch (error) {
    console.error('Reorder gallery items error:', error);
    res.status(500).json({ error: 'Failed to reorder gallery items' });
  }
});

// GET /api/gallery/:id - Get single gallery item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const items = await getGalleryItemsWithImages('WHERE gi.id = $1', [id]);

    if (items.length === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    res.json(items[0]);
  } catch (error) {
    console.error('Get gallery item error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery item' });
  }
});

// POST /api/gallery - Create gallery item (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, category, description, images, active } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Get the max display order
    const maxOrderResult = await pool.query(
      'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM gallery_items'
    );
    const nextOrder = maxOrderResult.rows[0].next_order;

    // Insert the gallery item
    const itemResult = await pool.query(
      `INSERT INTO gallery_items (title, category, description, display_order, active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, category, description || null, nextOrder, active !== false]
    );

    const galleryItem = itemResult.rows[0];

    // Insert images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imageUrl = typeof img === 'string' ? img : img.url || img.image_url;

        if (imageUrl) {
          await pool.query(
            `INSERT INTO gallery_item_images (gallery_item_id, image_url, display_order)
             VALUES ($1, $2, $3)`,
            [galleryItem.id, imageUrl, i]
          );
        }
      }
    }

    // Fetch the complete item with images
    const items = await getGalleryItemsWithImages('WHERE gi.id = $1', [galleryItem.id]);

    res.status(201).json(items[0]);
  } catch (error) {
    console.error('Create gallery item error:', error);
    res.status(500).json({ error: 'Failed to create gallery item' });
  }
});

// PUT /api/gallery/:id - Update gallery item (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, active } = req.body;

    // Check if item exists
    const existing = await pool.query(
      'SELECT * FROM gallery_items WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    const result = await pool.query(
      `UPDATE gallery_items SET
        title = COALESCE($1, title),
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        active = COALESCE($4, active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title, category, description, active, id]
    );

    // Fetch the complete item with images
    const items = await getGalleryItemsWithImages('WHERE gi.id = $1', [id]);

    res.json(items[0]);
  } catch (error) {
    console.error('Update gallery item error:', error);
    res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

// DELETE /api/gallery/:id - Delete gallery item (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM gallery_items WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

// POST /api/gallery/:id/images - Add images to gallery item (admin only)
router.post('/:id/images', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body;

    // Check if item exists
    const existing = await pool.query(
      'SELECT * FROM gallery_items WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    // Get max display order for this item
    const maxOrderResult = await pool.query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM gallery_item_images WHERE gallery_item_id = $1',
      [id]
    );
    let nextOrder = maxOrderResult.rows[0].next_order;

    // Insert new images
    for (const img of images) {
      const imageUrl = typeof img === 'string' ? img : img.url || img.image_url;

      if (imageUrl) {
        await pool.query(
          `INSERT INTO gallery_item_images (gallery_item_id, image_url, display_order)
           VALUES ($1, $2, $3)`,
          [id, imageUrl, nextOrder++]
        );
      }
    }

    // Update parent's updated_at
    await pool.query(
      'UPDATE gallery_items SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Fetch the complete item with images
    const items = await getGalleryItemsWithImages('WHERE gi.id = $1', [id]);

    res.json(items[0]);
  } catch (error) {
    console.error('Add images error:', error);
    res.status(500).json({ error: 'Failed to add images' });
  }
});

// PUT /api/gallery/:id/images/reorder - Reorder images within gallery item (admin only)
// NOTE: This must come BEFORE /:id/images/:imageId to avoid matching "reorder" as an imageId
router.put('/:id/images/reorder', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;

    if (!order || !Array.isArray(order)) {
      return res.status(400).json({ error: 'Order array is required' });
    }

    // Update each image's display_order
    for (let i = 0; i < order.length; i++) {
      await pool.query(
        'UPDATE gallery_item_images SET display_order = $1 WHERE id = $2 AND gallery_item_id = $3',
        [i, order[i], id]
      );
    }

    // Update parent's updated_at
    await pool.query(
      'UPDATE gallery_items SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Fetch the complete item with images
    const items = await getGalleryItemsWithImages('WHERE gi.id = $1', [id]);

    res.json(items[0]);
  } catch (error) {
    console.error('Reorder images error:', error);
    res.status(500).json({ error: 'Failed to reorder images' });
  }
});

// DELETE /api/gallery/:id/images/:imageId - Remove image from gallery item (admin only)
router.delete('/:id/images/:imageId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const result = await pool.query(
      'DELETE FROM gallery_item_images WHERE id = $1 AND gallery_item_id = $2 RETURNING id',
      [imageId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Update parent's updated_at
    await pool.query(
      'UPDATE gallery_items SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Fetch the complete item with images
    const items = await getGalleryItemsWithImages('WHERE gi.id = $1', [id]);

    res.json(items[0]);
  } catch (error) {
    console.error('Remove image error:', error);
    res.status(500).json({ error: 'Failed to remove image' });
  }
});

export default router;
