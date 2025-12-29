import { Router } from 'express';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ============================================
// PUBLIC ENDPOINT - Get hat designer settings
// ============================================

// GET /api/hat-config/settings - Get hat designer settings (public)
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT config_value FROM pricing_config WHERE config_key = 'hat_designer_settings'"
    );

    if (result.rows.length === 0) {
      // Return default if not found
      return res.json({ enabled: true });
    }

    res.json(result.rows[0].config_value);
  } catch (error) {
    console.error('Get hat designer settings error:', error);
    res.status(500).json({ error: 'Failed to fetch hat designer settings' });
  }
});

// ============================================
// PUBLIC ENDPOINT - Get full config for designer
// ============================================

// GET /api/hat-config - Get complete configuration for the designer
router.get('/', async (req, res) => {
  try {
    // Get active hat types with their parts and canvas config
    const hatTypesResult = await pool.query(`
      SELECT
        ht.*,
        json_agg(
          json_build_object(
            'id', hp.part_id,
            'name', hp.name,
            'description', hp.description,
            'defaultColor', hp.default_color
          ) ORDER BY hp.display_order
        ) FILTER (WHERE hp.id IS NOT NULL) as parts,
        json_build_object(
          'width', COALESCE(hcc.width, 400),
          'height', COALESCE(hcc.height, 300),
          'designArea', json_build_object(
            'front', json_build_object(
              'x', COALESCE(hcc.front_design_x, 100),
              'y', COALESCE(hcc.front_design_y, 60),
              'width', COALESCE(hcc.front_design_width, 200),
              'height', COALESCE(hcc.front_design_height, 120)
            ),
            'back', json_build_object(
              'x', COALESCE(hcc.back_design_x, 100),
              'y', COALESCE(hcc.back_design_y, 80),
              'width', COALESCE(hcc.back_design_width, 200),
              'height', COALESCE(hcc.back_design_height, 100)
            )
          )
        ) as canvas
      FROM hat_types ht
      LEFT JOIN hat_parts hp ON hp.hat_type_id = ht.id
      LEFT JOIN hat_canvas_config hcc ON hcc.hat_type_id = ht.id
      WHERE ht.active = true
      GROUP BY ht.id, hcc.id
      ORDER BY ht.display_order
    `);

    // Get active color presets
    const colorsResult = await pool.query(`
      SELECT name, hex
      FROM color_presets
      WHERE active = true
      ORDER BY display_order
    `);

    // Get active color combinations
    const combinationsResult = await pool.query(`
      SELECT name, front_color as front, mesh_color as mesh, brim_color as brim, rope_color as rope
      FROM color_combinations
      WHERE active = true
      ORDER BY display_order
    `);

    // Build hat types object keyed by slug
    const hatTypes = {};
    for (const row of hatTypesResult.rows) {
      // Build default colors from parts
      const defaultColors = {};
      if (row.parts) {
        for (const part of row.parts) {
          defaultColors[part.id] = part.defaultColor || '#ffffff';
        }
      }

      hatTypes[row.slug] = {
        id: row.slug,
        name: row.name,
        description: row.description,
        category: row.category,
        previewImage: row.preview_image_url,
        parts: row.parts || [],
        defaultColors,
        images: {
          front: row.front_image_url,
          back: row.back_image_url
        },
        // Marker colors used in the source images for color replacement
        markerColors: {
          front: row.front_marker_color,
          mesh: row.mesh_marker_color,
          brim: row.brim_marker_color,
          rope: row.rope_marker_color
        },
        canvas: row.canvas
      };
    }

    res.json({
      hatTypes,
      colorPresets: colorsResult.rows,
      colorCombinations: combinationsResult.rows
    });
  } catch (error) {
    console.error('Get hat config error:', error);
    res.status(500).json({ error: 'Failed to fetch hat configuration' });
  }
});

// ============================================
// ADMIN ENDPOINTS - Hat Types
// ============================================

// GET /api/hat-config/hat-types - List all hat types (admin)
router.get('/hat-types', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ht.*,
        json_agg(
          json_build_object(
            'id', hp.id,
            'partId', hp.part_id,
            'name', hp.name,
            'description', hp.description,
            'defaultColor', hp.default_color,
            'displayOrder', hp.display_order
          ) ORDER BY hp.display_order
        ) FILTER (WHERE hp.id IS NOT NULL) as parts,
        hcc.width, hcc.height,
        hcc.front_design_x, hcc.front_design_y, hcc.front_design_width, hcc.front_design_height,
        hcc.back_design_x, hcc.back_design_y, hcc.back_design_width, hcc.back_design_height
      FROM hat_types ht
      LEFT JOIN hat_parts hp ON hp.hat_type_id = ht.id
      LEFT JOIN hat_canvas_config hcc ON hcc.hat_type_id = ht.id
      GROUP BY ht.id, hcc.id
      ORDER BY ht.display_order
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get hat types error:', error);
    res.status(500).json({ error: 'Failed to fetch hat types' });
  }
});

// POST /api/hat-config/hat-types - Create hat type
router.post('/hat-types', authenticate, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      slug, name, description, category,
      preview_image_url, front_image_url, back_image_url,
      front_marker_color, mesh_marker_color, brim_marker_color, rope_marker_color,
      display_order, active, parts, canvas
    } = req.body;

    if (!slug || !name) {
      return res.status(400).json({ error: 'Slug and name are required' });
    }

    // Create hat type
    const hatResult = await client.query(
      `INSERT INTO hat_types (slug, name, description, category, preview_image_url, front_image_url, back_image_url, front_marker_color, mesh_marker_color, brim_marker_color, rope_marker_color, display_order, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [slug, name, description, category, preview_image_url, front_image_url, back_image_url, front_marker_color, mesh_marker_color, brim_marker_color, rope_marker_color, display_order || 0, active !== false]
    );

    const hatTypeId = hatResult.rows[0].id;

    // Create parts if provided
    if (parts && parts.length > 0) {
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        await client.query(
          `INSERT INTO hat_parts (hat_type_id, part_id, name, description, default_color, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [hatTypeId, part.partId || part.id, part.name, part.description, part.defaultColor || '#ffffff', i]
        );
      }
    }

    // Create canvas config
    const c = canvas || {};
    await client.query(
      `INSERT INTO hat_canvas_config (hat_type_id, width, height, front_design_x, front_design_y, front_design_width, front_design_height, back_design_x, back_design_y, back_design_width, back_design_height)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        hatTypeId,
        c.width || 400, c.height || 300,
        c.frontDesignX || 100, c.frontDesignY || 60, c.frontDesignWidth || 200, c.frontDesignHeight || 120,
        c.backDesignX || 100, c.backDesignY || 80, c.backDesignWidth || 200, c.backDesignHeight || 100
      ]
    );

    await client.query('COMMIT');

    res.status(201).json(hatResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create hat type error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A hat type with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create hat type' });
  } finally {
    client.release();
  }
});

// PUT /api/hat-config/hat-types/:id - Update hat type
router.put('/hat-types/:id', authenticate, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const {
      slug, name, description, category,
      preview_image_url, front_image_url, back_image_url,
      front_marker_color, mesh_marker_color, brim_marker_color, rope_marker_color,
      display_order, active, parts, canvas
    } = req.body;

    // Update hat type
    const hatResult = await client.query(
      `UPDATE hat_types SET
        slug = COALESCE($1, slug),
        name = COALESCE($2, name),
        description = $3,
        category = $4,
        preview_image_url = $5,
        front_image_url = $6,
        back_image_url = $7,
        front_marker_color = $8,
        mesh_marker_color = $9,
        brim_marker_color = $10,
        rope_marker_color = $11,
        display_order = COALESCE($12, display_order),
        active = COALESCE($13, active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [slug, name, description, category, preview_image_url, front_image_url, back_image_url, front_marker_color, mesh_marker_color, brim_marker_color, rope_marker_color, display_order, active, id]
    );

    if (hatResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Hat type not found' });
    }

    // Update parts if provided
    if (parts !== undefined) {
      // Delete existing parts
      await client.query('DELETE FROM hat_parts WHERE hat_type_id = $1', [id]);

      // Insert new parts
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        await client.query(
          `INSERT INTO hat_parts (hat_type_id, part_id, name, description, default_color, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, part.partId || part.id, part.name, part.description, part.defaultColor || '#ffffff', i]
        );
      }
    }

    // Update canvas config if provided
    if (canvas !== undefined) {
      const c = canvas || {};
      await client.query(
        `INSERT INTO hat_canvas_config (hat_type_id, width, height, front_design_x, front_design_y, front_design_width, front_design_height, back_design_x, back_design_y, back_design_width, back_design_height)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (hat_type_id) DO UPDATE SET
           width = EXCLUDED.width,
           height = EXCLUDED.height,
           front_design_x = EXCLUDED.front_design_x,
           front_design_y = EXCLUDED.front_design_y,
           front_design_width = EXCLUDED.front_design_width,
           front_design_height = EXCLUDED.front_design_height,
           back_design_x = EXCLUDED.back_design_x,
           back_design_y = EXCLUDED.back_design_y,
           back_design_width = EXCLUDED.back_design_width,
           back_design_height = EXCLUDED.back_design_height`,
        [
          id,
          c.width || 400, c.height || 300,
          c.frontDesignX || 100, c.frontDesignY || 60, c.frontDesignWidth || 200, c.frontDesignHeight || 120,
          c.backDesignX || 100, c.backDesignY || 80, c.backDesignWidth || 200, c.backDesignHeight || 100
        ]
      );
    }

    await client.query('COMMIT');

    res.json(hatResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update hat type error:', error);
    res.status(500).json({ error: 'Failed to update hat type' });
  } finally {
    client.release();
  }
});

// DELETE /api/hat-config/hat-types/:id - Delete hat type
router.delete('/hat-types/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM hat_types WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hat type not found' });
    }

    res.json({ message: 'Hat type deleted successfully' });
  } catch (error) {
    console.error('Delete hat type error:', error);
    res.status(500).json({ error: 'Failed to delete hat type' });
  }
});

// ============================================
// ADMIN ENDPOINTS - Color Presets
// ============================================

// GET /api/hat-config/colors - List all color presets
router.get('/colors', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM color_presets ORDER BY display_order'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get color presets error:', error);
    res.status(500).json({ error: 'Failed to fetch color presets' });
  }
});

// POST /api/hat-config/colors - Create color preset
router.post('/colors', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, hex, display_order, active } = req.body;

    if (!name || !hex) {
      return res.status(400).json({ error: 'Name and hex color are required' });
    }

    const result = await pool.query(
      `INSERT INTO color_presets (name, hex, display_order, active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, hex, display_order || 0, active !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create color preset error:', error);
    res.status(500).json({ error: 'Failed to create color preset' });
  }
});

// PUT /api/hat-config/colors/:id - Update color preset
router.put('/colors/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, hex, display_order, active } = req.body;

    const result = await pool.query(
      `UPDATE color_presets SET
        name = COALESCE($1, name),
        hex = COALESCE($2, hex),
        display_order = COALESCE($3, display_order),
        active = COALESCE($4, active)
       WHERE id = $5
       RETURNING *`,
      [name, hex, display_order, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Color preset not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update color preset error:', error);
    res.status(500).json({ error: 'Failed to update color preset' });
  }
});

// DELETE /api/hat-config/colors/:id - Delete color preset
router.delete('/colors/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM color_presets WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Color preset not found' });
    }

    res.json({ message: 'Color preset deleted successfully' });
  } catch (error) {
    console.error('Delete color preset error:', error);
    res.status(500).json({ error: 'Failed to delete color preset' });
  }
});

// PUT /api/hat-config/colors/reorder - Reorder color presets
router.put('/colors/reorder', authenticate, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { order } = req.body; // Array of { id, display_order }

    for (const item of order) {
      await client.query(
        'UPDATE color_presets SET display_order = $1 WHERE id = $2',
        [item.display_order, item.id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Colors reordered successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reorder colors error:', error);
    res.status(500).json({ error: 'Failed to reorder colors' });
  } finally {
    client.release();
  }
});

// ============================================
// ADMIN ENDPOINTS - Color Combinations
// ============================================

// GET /api/hat-config/combinations - List all color combinations
router.get('/combinations', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM color_combinations ORDER BY display_order'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get color combinations error:', error);
    res.status(500).json({ error: 'Failed to fetch color combinations' });
  }
});

// POST /api/hat-config/combinations - Create color combination
router.post('/combinations', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, front_color, mesh_color, brim_color, rope_color, display_order, active } = req.body;

    if (!name || !front_color || !mesh_color || !brim_color) {
      return res.status(400).json({ error: 'Name and front, mesh, brim colors are required' });
    }

    const result = await pool.query(
      `INSERT INTO color_combinations (name, front_color, mesh_color, brim_color, rope_color, display_order, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, front_color, mesh_color, brim_color, rope_color, display_order || 0, active !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create color combination error:', error);
    res.status(500).json({ error: 'Failed to create color combination' });
  }
});

// PUT /api/hat-config/combinations/:id - Update color combination
router.put('/combinations/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, front_color, mesh_color, brim_color, rope_color, display_order, active } = req.body;

    const result = await pool.query(
      `UPDATE color_combinations SET
        name = COALESCE($1, name),
        front_color = COALESCE($2, front_color),
        mesh_color = COALESCE($3, mesh_color),
        brim_color = COALESCE($4, brim_color),
        rope_color = $5,
        display_order = COALESCE($6, display_order),
        active = COALESCE($7, active)
       WHERE id = $8
       RETURNING *`,
      [name, front_color, mesh_color, brim_color, rope_color, display_order, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Color combination not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update color combination error:', error);
    res.status(500).json({ error: 'Failed to update color combination' });
  }
});

// DELETE /api/hat-config/combinations/:id - Delete color combination
router.delete('/combinations/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM color_combinations WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Color combination not found' });
    }

    res.json({ message: 'Color combination deleted successfully' });
  } catch (error) {
    console.error('Delete color combination error:', error);
    res.status(500).json({ error: 'Failed to delete color combination' });
  }
});

// ============================================
// ADMIN ENDPOINT - Hat Designer Settings
// ============================================

// PUT /api/hat-config/settings - Update hat designer settings
router.put('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const { enabled } = req.body;

    const result = await pool.query(
      `INSERT INTO pricing_config (config_key, config_value, updated_at)
       VALUES ('hat_designer_settings', $1::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (config_key) DO UPDATE SET
         config_value = $1::jsonb,
         updated_at = CURRENT_TIMESTAMP
       RETURNING config_value`,
      [JSON.stringify({ enabled: enabled !== false })]
    );

    res.json(result.rows[0].config_value);
  } catch (error) {
    console.error('Update hat designer settings error:', error);
    res.status(500).json({ error: 'Failed to update hat designer settings' });
  }
});

export default router;
