import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Hat configuration seed data
async function seedHatConfig() {
  // Color presets
  const colorPresets = [
    { name: "Navy", hex: "#172c63", display_order: 0 },
    { name: "Black", hex: "#000000", display_order: 1 },
    { name: "White", hex: "#ffffff", display_order: 2 },
    { name: "Gray", hex: "#6b7280", display_order: 3 },
    { name: "Red", hex: "#dc2626", display_order: 4 },
    { name: "Orange", hex: "#d18f63", display_order: 5 },
    { name: "Green", hex: "#16a34a", display_order: 6 },
    { name: "Royal Blue", hex: "#2563eb", display_order: 7 },
    { name: "Maroon", hex: "#7f1d1d", display_order: 8 },
    { name: "Tan", hex: "#d4a574", display_order: 9 },
    { name: "Camo Green", hex: "#4a5c3a", display_order: 10 },
    { name: "Pink", hex: "#ec4899", display_order: 11 },
  ];

  for (const color of colorPresets) {
    await pool.query(
      `INSERT INTO color_presets (name, hex, display_order, active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT DO NOTHING`,
      [color.name, color.hex, color.display_order]
    );
  }

  // Color combinations
  const colorCombinations = [
    { name: "Classic Navy", front: "#172c63", mesh: "#ffffff", brim: "#172c63", rope: "#172c63", display_order: 0 },
    { name: "All Black", front: "#000000", mesh: "#000000", brim: "#000000", rope: "#000000", display_order: 1 },
    { name: "Texas Orange", front: "#d18f63", mesh: "#ffffff", brim: "#d18f63", rope: "#d18f63", display_order: 2 },
    { name: "Camo", front: "#4a5c3a", mesh: "#4a5c3a", brim: "#4a5c3a", rope: "#4a5c3a", display_order: 3 },
  ];

  for (const combo of colorCombinations) {
    await pool.query(
      `INSERT INTO color_combinations (name, front_color, mesh_color, brim_color, rope_color, display_order, active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       ON CONFLICT DO NOTHING`,
      [combo.name, combo.front, combo.mesh, combo.brim, combo.rope, combo.display_order]
    );
  }

  // Hat types
  const hatTypes = [
    {
      slug: "classic",
      name: "The Classic",
      description: "Classic Trucker Hat with Mesh Back. Available in 5 or 6 Panels.",
      category: "Mesh Back",
      preview_image_url: "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.19_acadc270_ik9j3h.jpg",
      front_image_url: "/hats/classic-front.png",
      back_image_url: "/hats/classic-back.png",
      display_order: 0,
      parts: [
        { part_id: "front", name: "Front Panel", description: "The front fabric panels", default_color: "#172c63", display_order: 0 },
        { part_id: "brim", name: "Bill", description: "The hat bill/brim", default_color: "#172c63", display_order: 1 },
        { part_id: "mesh", name: "Mesh", description: "The mesh back panels", default_color: "#ffffff", display_order: 2 },
      ],
      canvas: { width: 400, height: 300, front_x: 100, front_y: 60, front_w: 200, front_h: 120, back_x: 100, back_y: 80, back_w: 200, back_h: 100 }
    },
    {
      slug: "caddie",
      name: "The Caddie",
      description: "Classic Rope Hat with Mesh or Fabric Back. Perfect for a vintage look.",
      category: "Rope Hat",
      preview_image_url: "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.18_17db9e80_ltlg0x.jpg",
      front_image_url: "/hats/caddie-front.png",
      back_image_url: "/hats/caddie-back.png",
      display_order: 1,
      parts: [
        { part_id: "front", name: "Front Panel", description: "The front fabric panels", default_color: "#172c63", display_order: 0 },
        { part_id: "brim", name: "Bill", description: "The hat bill/brim", default_color: "#172c63", display_order: 1 },
        { part_id: "mesh", name: "Mesh", description: "The mesh back panels", default_color: "#ffffff", display_order: 2 },
        { part_id: "rope", name: "Rope", description: "The decorative rope", default_color: "#ffffff", display_order: 3 },
      ],
      canvas: { width: 400, height: 300, front_x: 100, front_y: 50, front_w: 200, front_h: 130, back_x: 100, back_y: 80, back_w: 200, back_h: 100 }
    }
  ];

  for (const hatType of hatTypes) {
    // Insert hat type
    const result = await pool.query(
      `INSERT INTO hat_types (slug, name, description, category, preview_image_url, front_image_url, back_image_url, display_order, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         category = EXCLUDED.category,
         preview_image_url = EXCLUDED.preview_image_url,
         front_image_url = EXCLUDED.front_image_url,
         back_image_url = EXCLUDED.back_image_url,
         display_order = EXCLUDED.display_order
       RETURNING id`,
      [hatType.slug, hatType.name, hatType.description, hatType.category,
       hatType.preview_image_url, hatType.front_image_url, hatType.back_image_url, hatType.display_order]
    );

    const hatTypeId = result.rows[0].id;

    // Insert parts
    for (const part of hatType.parts) {
      await pool.query(
        `INSERT INTO hat_parts (hat_type_id, part_id, name, description, default_color, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [hatTypeId, part.part_id, part.name, part.description, part.default_color, part.display_order]
      );
    }

    // Insert canvas config
    const c = hatType.canvas;
    await pool.query(
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
      [hatTypeId, c.width, c.height, c.front_x, c.front_y, c.front_w, c.front_h, c.back_x, c.back_y, c.back_w, c.back_h]
    );
  }
}

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@casparyhatco.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, passwordHash, 'Admin', 'admin']
    );

    console.log(`Admin user created/verified: ${adminEmail}`);

    // Seed sample blog posts
    const blogPosts = [
      {
        title: 'The Art of Custom Hat Making',
        slug: 'art-of-custom-hat-making',
        content: 'Custom hat making is a craft that combines tradition with modern innovation. At Caspary Hat Co., we take pride in creating unique pieces that stand out at any event...',
        excerpt: 'Discover the craftsmanship behind our custom hats.',
        category: 'Behind the Scenes',
        published: true,
        author: 'Caspary Hat Co.'
      },
      {
        title: 'Top 5 Hat Styles for Corporate Events',
        slug: 'top-5-hat-styles-corporate-events',
        content: 'When planning a corporate event, the right branded merchandise can make all the difference. Custom hats offer a unique way to promote your brand while providing attendees with a memorable keepsake...',
        excerpt: 'Find the perfect hat style for your next corporate event.',
        category: 'Style Guide',
        published: true,
        author: 'Caspary Hat Co.'
      }
    ];

    for (const post of blogPosts) {
      await pool.query(
        `INSERT INTO blog_posts (title, slug, content, excerpt, category, published, author)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (slug) DO NOTHING`,
        [post.title, post.slug, post.content, post.excerpt, post.category, post.published, post.author]
      );
    }

    console.log('Sample blog posts created');

    // Seed hat configuration
    await seedHatConfig();
    console.log('Hat configuration seeded');

    console.log('Database seeding completed successfully!');
    console.log('\n--- IMPORTANT ---');
    console.log(`Default admin credentials:`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('Please change these in production!');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
