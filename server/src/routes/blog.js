import { Router } from 'express';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Helper to create slug from title
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// GET /api/blog - List published blog posts
router.get('/', async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    let query = 'SELECT * FROM blog_posts WHERE published = true';
    const params = [];

    if (category) {
      query += ' AND category = $1';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM blog_posts WHERE published = true';
    if (category) {
      countQuery += ' AND category = $1';
    }
    const countResult = await pool.query(countQuery, category ? [category] : []);

    // Get unique categories
    const categoriesResult = await pool.query(
      'SELECT DISTINCT category FROM blog_posts WHERE published = true AND category IS NOT NULL'
    );

    res.json({
      posts: result.rows,
      total: parseInt(countResult.rows[0].count),
      categories: categoriesResult.rows.map(r => r.category),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET /api/blog/all - List all blog posts including unpublished (admin only)
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      'SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [parseInt(limit), parseInt(offset)]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM blog_posts');

    res.json({
      posts: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get all blog posts error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET /api/blog/:slug - Get single blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      'SELECT * FROM blog_posts WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const post = result.rows[0];

    // Only return unpublished posts to admins
    if (!post.published) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// POST /api/blog - Create blog post (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, category, featured_image_url, author, published } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let slug = createSlug(title);

    // Ensure unique slug
    const existingSlug = await pool.query(
      'SELECT id FROM blog_posts WHERE slug = $1',
      [slug]
    );

    if (existingSlug.rows.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const result = await pool.query(
      `INSERT INTO blog_posts (title, slug, content, excerpt, category, featured_image_url, author, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        slug,
        content || null,
        excerpt || null,
        category || null,
        featured_image_url || null,
        author || req.user.name || 'Caspary Hat Co.',
        published || false
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// PUT /api/blog/:id - Update blog post (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category, featured_image_url, author, published } = req.body;

    // Get existing post
    const existing = await pool.query(
      'SELECT * FROM blog_posts WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const currentPost = existing.rows[0];

    // Update slug if title changed
    let slug = currentPost.slug;
    if (title && title !== currentPost.title) {
      slug = createSlug(title);

      // Check for slug conflicts (excluding current post)
      const existingSlug = await pool.query(
        'SELECT id FROM blog_posts WHERE slug = $1 AND id != $2',
        [slug, id]
      );

      if (existingSlug.rows.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const result = await pool.query(
      `UPDATE blog_posts SET
        title = COALESCE($1, title),
        slug = $2,
        content = COALESCE($3, content),
        excerpt = COALESCE($4, excerpt),
        category = COALESCE($5, category),
        featured_image_url = COALESCE($6, featured_image_url),
        author = COALESCE($7, author),
        published = COALESCE($8, published),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        title,
        slug,
        content,
        excerpt,
        category,
        featured_image_url,
        author,
        published,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE /api/blog/:id - Delete blog post (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM blog_posts WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

export default router;
