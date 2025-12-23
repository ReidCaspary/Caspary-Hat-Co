import { Router } from 'express';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { sendNewsletterWelcome } from '../services/email.js';

const router = Router();

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if already subscribed
    const existing = await pool.query(
      'SELECT id, active FROM newsletter_subscribers WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      if (existing.rows[0].active) {
        return res.json({ message: 'Already subscribed to newsletter' });
      }

      // Reactivate subscription
      await pool.query(
        'UPDATE newsletter_subscribers SET active = true, subscribed_at = CURRENT_TIMESTAMP WHERE id = $1',
        [existing.rows[0].id]
      );

      return res.json({ message: 'Subscription reactivated' });
    }

    // Create new subscription
    await pool.query(
      'INSERT INTO newsletter_subscribers (email) VALUES ($1)',
      [email.toLowerCase()]
    );

    // Send welcome email (don't await to not block response)
    sendNewsletterWelcome(email).catch(console.error);

    res.status(201).json({ message: 'Successfully subscribed to newsletter' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe to newsletter' });
  }
});

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await pool.query(
      'UPDATE newsletter_subscribers SET active = false WHERE email = $1 RETURNING id',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from newsletter' });
  }
});

// GET /api/newsletter/subscribers - List subscribers (admin only)
router.get('/subscribers', authenticate, requireAdmin, async (req, res) => {
  try {
    const { active, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT id, email, subscribed_at, active FROM newsletter_subscribers';
    const params = [];

    if (active !== undefined) {
      query += ' WHERE active = $1';
      params.push(active === 'true');
    }

    query += ' ORDER BY subscribed_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get counts
    const totalResult = await pool.query('SELECT COUNT(*) FROM newsletter_subscribers');
    const activeResult = await pool.query('SELECT COUNT(*) FROM newsletter_subscribers WHERE active = true');

    res.json({
      subscribers: result.rows,
      total: parseInt(totalResult.rows[0].count),
      active_count: parseInt(activeResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

// DELETE /api/newsletter/subscribers/:id - Delete subscriber (admin only)
router.delete('/subscribers/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM newsletter_subscribers WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

export default router;
