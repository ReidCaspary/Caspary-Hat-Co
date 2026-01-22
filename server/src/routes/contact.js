import { Router } from 'express';
import multer from 'multer';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadImage, uploadBase64Image } from '../services/cloudinary.js';
import { sendContactConfirmation, sendAdminNotification } from '../services/email.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  }
});

// POST /api/contact - Submit contact inquiry
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      event_type,
      event_date,
      quantity,
      budget,
      shipping_address,
      whiteboard_image // Base64 string
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    let fileUrl = null;
    let whiteboardUrl = null;

    // Upload attached file if present
    if (req.file) {
      try {
        const result = await uploadImage(req.file.buffer, {
          folder: 'caspary-hat-co/inquiries'
        });
        fileUrl = result.url;
      } catch (uploadError) {
        console.error('File upload failed:', uploadError);
      }
    }

    // Upload whiteboard drawing if present
    if (whiteboard_image) {
      try {
        const result = await uploadBase64Image(whiteboard_image, {
          folder: 'caspary-hat-co/whiteboard'
        });
        whiteboardUrl = result.url;
      } catch (uploadError) {
        console.error('Whiteboard upload failed:', uploadError);
      }
    }

    // Parse shipping_address if it's a string (from FormData)
    let parsedShippingAddress = null;
    if (shipping_address) {
      try {
        parsedShippingAddress = typeof shipping_address === 'string'
          ? JSON.parse(shipping_address)
          : shipping_address;
      } catch (e) {
        console.error('Failed to parse shipping_address:', e);
      }
    }

    // Save to database
    const result = await pool.query(
      `INSERT INTO contact_inquiries
       (name, email, phone, message, event_type, event_date, quantity, budget, shipping_address, whiteboard_image_url, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name,
        email,
        phone || null,
        message || null,
        event_type || null,
        event_date || null,
        quantity ? parseInt(quantity) : null,
        budget || null,
        parsedShippingAddress,
        whiteboardUrl,
        fileUrl
      ]
    );

    const inquiry = result.rows[0];

    // Send emails (don't await to not block response)
    sendContactConfirmation(inquiry).catch(console.error);
    sendAdminNotification(inquiry).catch(console.error);

    res.status(201).json({
      message: 'Inquiry submitted successfully',
      id: inquiry.id
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

// GET /api/inquiries - List all inquiries (admin only)
router.get('/inquiries', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM contact_inquiries';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM contact_inquiries';
    if (status) {
      countQuery += ' WHERE status = $1';
    }
    const countResult = await pool.query(countQuery, status ? [status] : []);

    res.json({
      inquiries: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// GET /api/inquiries/:id - Get single inquiry (admin only)
router.get('/inquiries/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM contact_inquiries WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({ error: 'Failed to fetch inquiry' });
  }
});

// PUT /api/inquiries/:id/status - Update inquiry status (admin only)
router.put('/inquiries/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'in_progress', 'completed', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE contact_inquiries SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({ error: 'Failed to update inquiry status' });
  }
});

// DELETE /api/inquiries/:id - Delete inquiry (admin only)
router.delete('/inquiries/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM contact_inquiries WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

export default router;
