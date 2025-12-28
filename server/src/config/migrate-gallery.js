// Migration script for gallery tables
// Run with: node server/src/config/migrate-gallery.js

import pool from './database.js';

async function migrate() {
  console.log('Starting gallery migration...\n');

  try {
    // Create gallery_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created gallery_items table');

    // Create gallery_item_images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_item_images (
        id SERIAL PRIMARY KEY,
        gallery_item_id INTEGER REFERENCES gallery_items(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created gallery_item_images table');

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_gallery_items_active ON gallery_items(active)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON gallery_items(category)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_gallery_items_order ON gallery_items(display_order)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_gallery_item_images_item ON gallery_item_images(gallery_item_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_gallery_item_images_order ON gallery_item_images(display_order)');
    console.log('Created indexes');

    console.log('\nMigration completed successfully!');

  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
