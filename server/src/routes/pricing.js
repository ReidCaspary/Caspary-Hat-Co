import { Router } from 'express';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/pricing/config - Get pricing configuration (public)
router.get('/config', async (req, res) => {
  try {
    const result = await pool.query('SELECT config_key, config_value FROM pricing_config');

    const config = {};
    result.rows.forEach(row => {
      if (row.config_key === 'pricing_tiers') {
        config.tiers = row.config_value;
      } else if (row.config_key === 'pricing_settings') {
        config.settings = row.config_value;
      }
    });

    // If no config exists, return defaults
    if (!config.tiers) {
      config.tiers = [
        { min_quantity: 50, max_quantity: 99, price_per_hat: 16.00 },
        { min_quantity: 100, max_quantity: 149, price_per_hat: 14.00 },
        { min_quantity: 150, max_quantity: 249, price_per_hat: 13.00 },
        { min_quantity: 250, max_quantity: 499, price_per_hat: 12.00 },
        { min_quantity: 500, max_quantity: 999, price_per_hat: 11.00 }
      ];
    }

    if (!config.settings) {
      config.settings = {
        variable: {
          max_price: 11.00,
          min_price: 10.00,
          anchor_quantity: 5000,
          exponent: 1.05
        },
        min_order_quantity: 50,
        max_ui_quantity: 1000
      };
    }

    res.json(config);
  } catch (error) {
    console.error('Get pricing config error:', error);
    res.status(500).json({ error: 'Failed to fetch pricing configuration' });
  }
});

// PUT /api/pricing/config - Update pricing configuration (admin only)
router.put('/config', authenticate, requireAdmin, async (req, res) => {
  try {
    const { tiers, settings } = req.body;
    console.log('Received pricing update request:', { tiers, settings });

    // Validate tiers
    if (tiers) {
      if (!Array.isArray(tiers)) {
        return res.status(400).json({ error: 'Tiers must be an array' });
      }

      for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i];
        if (tier.min_quantity == null || tier.max_quantity == null || tier.price_per_hat == null) {
          return res.status(400).json({ error: `Tier ${i + 1} is missing required fields` });
        }
        if (tier.min_quantity < 1) {
          return res.status(400).json({ error: `Tier ${i + 1}: min_quantity must be at least 1` });
        }
        if (tier.min_quantity > tier.max_quantity) {
          return res.status(400).json({ error: `Tier ${i + 1}: min_quantity must be less than max_quantity` });
        }
        if (tier.price_per_hat <= 0) {
          return res.status(400).json({ error: `Tier ${i + 1}: price must be positive` });
        }
      }

      // Check for overlapping ranges
      const sortedTiers = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
      for (let i = 1; i < sortedTiers.length; i++) {
        if (sortedTiers[i].min_quantity <= sortedTiers[i - 1].max_quantity) {
          return res.status(400).json({ error: 'Tier ranges cannot overlap' });
        }
      }
    }

    // Validate settings
    if (settings) {
      if (settings.min_order_quantity && settings.min_order_quantity < 1) {
        return res.status(400).json({ error: 'Minimum order quantity must be at least 1' });
      }
      if (settings.variable) {
        if (settings.variable.min_price >= settings.variable.max_price) {
          return res.status(400).json({ error: 'Variable min_price must be less than max_price' });
        }
      }
    }

    // Update tiers if provided
    if (tiers) {
      console.log('Saving tiers:', JSON.stringify(tiers));
      await pool.query(
        `INSERT INTO pricing_config (config_key, config_value, updated_at)
         VALUES ('pricing_tiers', $1, CURRENT_TIMESTAMP)
         ON CONFLICT (config_key)
         DO UPDATE SET config_value = $1, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(tiers)]
      );
      console.log('Tiers saved successfully');
    }

    // Update settings if provided
    if (settings) {
      console.log('Saving settings:', JSON.stringify(settings));
      await pool.query(
        `INSERT INTO pricing_config (config_key, config_value, updated_at)
         VALUES ('pricing_settings', $1, CURRENT_TIMESTAMP)
         ON CONFLICT (config_key)
         DO UPDATE SET config_value = $1, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(settings)]
      );
      console.log('Settings saved successfully');
    }

    // Fetch and return updated config
    const result = await pool.query('SELECT config_key, config_value FROM pricing_config');
    const config = {};
    result.rows.forEach(row => {
      if (row.config_key === 'pricing_tiers') {
        config.tiers = row.config_value;
      } else if (row.config_key === 'pricing_settings') {
        config.settings = row.config_value;
      }
    });

    res.json(config);
  } catch (error) {
    console.error('Update pricing config error:', error);
    res.status(500).json({ error: 'Failed to update pricing configuration' });
  }
});

export default router;
