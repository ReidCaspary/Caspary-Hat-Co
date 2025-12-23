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
