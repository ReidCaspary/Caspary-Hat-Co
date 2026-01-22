-- Caspary Hat Co. Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact inquiries table
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    event_type VARCHAR(100),
    event_date DATE,
    quantity INTEGER,
    budget VARCHAR(100),
    shipping_address JSONB,
    whiteboard_image_url TEXT,
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add shipping_address column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_inquiries' AND column_name = 'shipping_address') THEN
        ALTER TABLE contact_inquiries ADD COLUMN shipping_address JSONB;
    END IF;
END $$;

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    category VARCHAR(100),
    featured_image_url TEXT,
    author VARCHAR(255),
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT true
);

-- Images/Media library table
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    cloudinary_public_id VARCHAR(255),
    alt_text VARCHAR(255),
    category VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hat types table (classic, caddie, etc.)
CREATE TABLE IF NOT EXISTS hat_types (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    preview_image_url TEXT,
    front_image_url TEXT,
    back_image_url TEXT,
    -- Marker colors: the colors used in the source image for each part
    -- These are sampled from the uploaded image and used for color replacement
    front_marker_color VARCHAR(7),
    mesh_marker_color VARCHAR(7),
    brim_marker_color VARCHAR(7),
    rope_marker_color VARCHAR(7),
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Colorizable parts for each hat type
CREATE TABLE IF NOT EXISTS hat_parts (
    id SERIAL PRIMARY KEY,
    hat_type_id INTEGER REFERENCES hat_types(id) ON DELETE CASCADE,
    part_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_color VARCHAR(7) DEFAULT '#ffffff',
    display_order INTEGER DEFAULT 0
);

-- Canvas configuration per hat type
CREATE TABLE IF NOT EXISTS hat_canvas_config (
    id SERIAL PRIMARY KEY,
    hat_type_id INTEGER UNIQUE REFERENCES hat_types(id) ON DELETE CASCADE,
    width INTEGER DEFAULT 400,
    height INTEGER DEFAULT 300,
    front_design_x INTEGER DEFAULT 100,
    front_design_y INTEGER DEFAULT 60,
    front_design_width INTEGER DEFAULT 200,
    front_design_height INTEGER DEFAULT 120,
    back_design_x INTEGER DEFAULT 100,
    back_design_y INTEGER DEFAULT 80,
    back_design_width INTEGER DEFAULT 200,
    back_design_height INTEGER DEFAULT 100
);

-- Color presets available for selection
CREATE TABLE IF NOT EXISTS color_presets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    hex VARCHAR(7) NOT NULL,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true
);

-- Pre-defined color combinations
CREATE TABLE IF NOT EXISTS color_combinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    front_color VARCHAR(7) NOT NULL,
    mesh_color VARCHAR(7) NOT NULL,
    brim_color VARCHAR(7) NOT NULL,
    rope_color VARCHAR(7),
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true
);

-- Add marker color columns to hat_types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hat_types' AND column_name = 'front_marker_color') THEN
        ALTER TABLE hat_types ADD COLUMN front_marker_color VARCHAR(7);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hat_types' AND column_name = 'mesh_marker_color') THEN
        ALTER TABLE hat_types ADD COLUMN mesh_marker_color VARCHAR(7);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hat_types' AND column_name = 'brim_marker_color') THEN
        ALTER TABLE hat_types ADD COLUMN brim_marker_color VARCHAR(7);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hat_types' AND column_name = 'rope_marker_color') THEN
        ALTER TABLE hat_types ADD COLUMN rope_marker_color VARCHAR(7);
    END IF;
END $$;

-- Gallery items table
CREATE TABLE IF NOT EXISTS gallery_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery item images (multiple images per gallery item)
CREATE TABLE IF NOT EXISTS gallery_item_images (
    id SERIAL PRIMARY KEY,
    gallery_item_id INTEGER REFERENCES gallery_items(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(active);
CREATE INDEX IF NOT EXISTS idx_hat_types_active ON hat_types(active);
CREATE INDEX IF NOT EXISTS idx_hat_types_slug ON hat_types(slug);
CREATE INDEX IF NOT EXISTS idx_hat_parts_hat_type ON hat_parts(hat_type_id);
CREATE INDEX IF NOT EXISTS idx_color_presets_active ON color_presets(active);
CREATE INDEX IF NOT EXISTS idx_gallery_items_active ON gallery_items(active);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_items_order ON gallery_items(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_item_images_item ON gallery_item_images(gallery_item_id);
CREATE INDEX IF NOT EXISTS idx_gallery_item_images_order ON gallery_item_images(display_order);

-- Pricing configuration table
CREATE TABLE IF NOT EXISTS pricing_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(50) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default pricing configuration
INSERT INTO pricing_config (config_key, config_value) VALUES
('pricing_tiers', '[
    {"min_quantity": 50, "max_quantity": 99, "price_per_hat": 16.00},
    {"min_quantity": 100, "max_quantity": 149, "price_per_hat": 14.00},
    {"min_quantity": 150, "max_quantity": 249, "price_per_hat": 13.00},
    {"min_quantity": 250, "max_quantity": 499, "price_per_hat": 12.00},
    {"min_quantity": 500, "max_quantity": 999, "price_per_hat": 11.00}
]'::jsonb),
('pricing_settings', '{
    "variable": {
        "max_price": 11.00,
        "min_price": 10.00,
        "anchor_quantity": 5000,
        "exponent": 1.05
    },
    "min_order_quantity": 50,
    "max_ui_quantity": 1000
}'::jsonb),
('hat_designer_settings', '{
    "enabled": true
}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;
