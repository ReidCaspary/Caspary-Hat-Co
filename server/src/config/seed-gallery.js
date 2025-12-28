// Seed script for gallery items
// Run with: node server/src/config/seed-gallery.js

import pool from './database.js';

const initialGalleryData = [
  {
    title: "Custom Event Hats",
    category: "Event",
    description: "Elegant Custom Memorabilia for Events",
    display_order: 0,
    images: [
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.19_acadc270_ik9j3h.jpg",
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517516/WhatsApp_Image_2025-11-03_at_15.52.15_6119fab8_mtukfz.jpg",
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517514/Dancers_zlksmi.jpg"
    ]
  },
  {
    title: "Custom Corporate Hats",
    category: "Business",
    description: "Premium Custom Hats for Corporate Branding",
    display_order: 1,
    images: [
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.18_17db9e80_ltlg0x.jpg",
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517513/100_Cotton_gmcwn1.jpg"
    ]
  },
  {
    title: "Team Hats",
    category: "Team Hats",
    description: "Custom Team Hats with Embroidered Mascot and Colors",
    display_order: 2,
    images: [
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517514/The_thunder_Baseball_jgryfz.jpg",
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517514/The_Mud_Dogs_zcblz4.jpg"
    ]
  }
];

async function seedGallery() {
  console.log('Starting gallery seed...\n');

  try {
    // Check if gallery items already exist
    const existingItems = await pool.query('SELECT COUNT(*) FROM gallery_items');
    const count = parseInt(existingItems.rows[0].count);

    if (count > 0) {
      console.log(`Gallery already has ${count} items. Skipping seed.`);
      console.log('To re-seed, first delete existing items:');
      console.log('  DELETE FROM gallery_items;');
      process.exit(0);
    }

    // Insert each gallery item
    for (const item of initialGalleryData) {
      console.log(`Creating: ${item.title}`);

      // Insert gallery item
      const itemResult = await pool.query(
        `INSERT INTO gallery_items (title, category, description, display_order, active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id`,
        [item.title, item.category, item.description, item.display_order]
      );

      const galleryItemId = itemResult.rows[0].id;

      // Insert images for this item
      for (let i = 0; i < item.images.length; i++) {
        await pool.query(
          `INSERT INTO gallery_item_images (gallery_item_id, image_url, display_order)
           VALUES ($1, $2, $3)`,
          [galleryItemId, item.images[i], i]
        );
      }

      console.log(`  - Added ${item.images.length} images`);
    }

    console.log('\nGallery seed completed successfully!');
    console.log(`Inserted ${initialGalleryData.length} gallery items.`);

  } catch (error) {
    console.error('Error seeding gallery:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedGallery();
