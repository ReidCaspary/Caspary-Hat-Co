# Caspary Hat Co. - Complete Documentation

## Overview

Caspary Hat Co. is a custom hat company website featuring:
- Public-facing marketing pages
- Interactive hat designer tool
- Contact form with whiteboard drawing
- Admin dashboard for managing content
- Blog, gallery, and newsletter functionality

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI component library |
| **React Query** | Server state management |
| **React Router** | Client-side routing |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express.js** | Web framework |
| **PostgreSQL** | Database |
| **JWT** | Authentication |
| **Multer** | File uploads |

---

## External Services

### 1. Netlify (Frontend Hosting)
- **URL:** https://netlify.com
- **Purpose:** Hosts the React frontend
- **Dashboard:** https://app.netlify.com
- **Your Site:** https://casparyhats.netlify.app (and casparyhats.com)

**Configuration:**
- Build command: `npm run build`
- Publish directory: `dist`
- `_redirects` file handles SPA routing

**Environment Variables:**
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (Railway) |

---

### 2. Railway (Backend Hosting + Database)
- **URL:** https://railway.app
- **Purpose:** Hosts Express.js backend and PostgreSQL database
- **Dashboard:** https://railway.app/dashboard

**Services in your Railway project:**
1. **Server** - Node.js/Express backend
2. **PostgreSQL** - Database

**Server Environment Variables:**
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:xxx@xxx.proxy.rlwy.net:xxxxx/railway` |
| `JWT_SECRET` | Secret for signing JWT tokens | Random string |
| `CORS_ORIGIN` | Allowed frontend origins | `https://casparyhats.com` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port (auto-set by Railway) | `3001` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Your cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Your API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Your API secret |
| `RESEND_API_KEY` | Resend email API key | `re_xxxxx` |
| `EMAIL_FROM` | Default from address | `Caspary Hat Co. <sales@casparyhats.com>` |
| `ADMIN_EMAIL` | Admin login email | `reidc@casparyhats.com` |
| `ADMIN_PASSWORD` | Admin login password | Your password |
| `ADMIN_NOTIFICATION_EMAIL` | Where to send notifications | `sales@casparyhats.com` |
| `FRONTEND_URL` | Frontend URL for email links | `https://casparyhats.com` |

---

### 3. Cloudinary (Image Hosting)
- **URL:** https://cloudinary.com
- **Purpose:** Stores and serves all images (uploads, gallery, etc.)
- **Dashboard:** https://cloudinary.com/console

**Features Used:**
- Image upload via API
- Background removal for hat designer
- Image transformations and optimization

**Folder Structure in Cloudinary:**
```
caspary-hat-co/
├── logos/
├── gallery/
├── products/
├── backgrounds/
├── uploads/        (user-uploaded files)
└── designer/       (hat designer images)
```

---

### 4. Resend (Email Service)
- **URL:** https://resend.com
- **Purpose:** Sends transactional emails
- **Dashboard:** https://resend.com/emails

**Emails Sent:**
1. Contact form confirmation (to customer)
2. New inquiry notification (to admin)
3. Newsletter welcome email

**Domain Verification:**
- Add your domain in Resend dashboard
- Add DNS records as instructed
- Once verified, use your domain in `EMAIL_FROM`

---

### 5. GoDaddy (Domain Registrar)
- **URL:** https://godaddy.com
- **Purpose:** Domain registration and DNS management
- **Domain:** casparyhats.com

**DNS Records:**
| Type | Name | Value |
|------|------|-------|
| A | @ | 75.2.60.5 (Netlify) |
| CNAME | www | apex-loadbalancer.netlify.com |

---

## Project Structure

```
caspary-hat-co/
├── src/                          # React frontend
│   ├── api/
│   │   └── apiClient.js          # API communication layer
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── home/                 # Homepage sections
│   │   ├── designer/             # Hat designer components
│   │   └── Whiteboard.jsx        # Drawing canvas
│   ├── pages/
│   │   ├── admin/                # Admin dashboard pages
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Gallery.jsx
│   │   ├── Contact.jsx
│   │   ├── Blog.jsx
│   │   ├── Designer.jsx
│   │   └── Layout.jsx            # Main layout wrapper
│   ├── utils/                    # Utility functions
│   └── main.jsx                  # App entry point
│
├── server/                       # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # PostgreSQL connection
│   │   │   ├── schema.sql        # Database schema
│   │   │   ├── migrate.js        # Migration script
│   │   │   └── seed.js           # Seed data script
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.js           # Login/register
│   │   │   ├── contact.js        # Contact form
│   │   │   ├── blog.js           # Blog posts
│   │   │   ├── gallery.js        # Gallery items
│   │   │   ├── images.js         # Media library
│   │   │   ├── newsletter.js     # Newsletter
│   │   │   ├── designer.js       # Hat designer
│   │   │   ├── hatConfig.js      # Hat configuration
│   │   │   └── pricing.js        # Pricing tiers
│   │   ├── services/
│   │   │   ├── cloudinary.js     # Image upload
│   │   │   └── email.js          # Email sending
│   │   └── index.js              # Server entry point
│   ├── .env                      # Environment variables (DO NOT COMMIT)
│   └── package.json
│
├── public/
│   └── _redirects                # Netlify SPA routing
│
├── .env                          # Frontend env vars
├── package.json
├── DOCUMENTATION.md              # This file
├── SETUP.md                      # Setup guide
└── README.md                     # Project overview
```

---

## Database Schema

### Tables

**users**
- id, email, password_hash, name, role, created_at

**contact_inquiries**
- id, name, email, phone, message, event_type, event_date, quantity, budget, whiteboard_image_url, file_url, status, created_at

**blog_posts**
- id, title, slug, content, excerpt, category, featured_image_url, author, published, created_at, updated_at

**newsletter_subscribers**
- id, email, subscribed_at, active

**images**
- id, filename, url, cloudinary_public_id, alt_text, category, uploaded_at

**gallery_items**
- id, title, category, description, display_order, active, created_at, updated_at

**gallery_item_images**
- id, gallery_item_id, image_url, display_order, created_at

**hat_types**
- id, slug, name, description, category, preview_image_url, front_image_url, back_image_url, marker colors, display_order, active

**hat_parts**
- id, hat_type_id, part_id, name, description, default_color, display_order

**hat_canvas_config**
- id, hat_type_id, dimensions and design area coordinates

**color_presets**
- id, name, hex, display_order, active

**color_combinations**
- id, name, front_color, mesh_color, brim_color, rope_color, display_order, active

**pricing_config**
- id, config_key, config_value (JSONB), updated_at

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/contact | Submit inquiry |
| GET | /api/inquiries | List inquiries (admin) |
| PUT | /api/inquiries/:id/status | Update status (admin) |
| DELETE | /api/inquiries/:id | Delete inquiry (admin) |

### Blog
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/blog | List published posts |
| GET | /api/blog/all | List all posts (admin) |
| GET | /api/blog/:slug | Get post by slug |
| POST | /api/blog | Create post (admin) |
| PUT | /api/blog/:id | Update post (admin) |
| DELETE | /api/blog/:id | Delete post (admin) |

### Gallery
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/gallery | List active items |
| GET | /api/gallery/all | List all items (admin) |
| POST | /api/gallery | Create item (admin) |
| PUT | /api/gallery/:id | Update item (admin) |
| DELETE | /api/gallery/:id | Delete item (admin) |

### Newsletter
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/newsletter/subscribe | Subscribe |
| POST | /api/newsletter/unsubscribe | Unsubscribe |
| GET | /api/newsletter/subscribers | List (admin) |

### Images
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/images | List images |
| POST | /api/images/upload | Upload image (admin) |
| DELETE | /api/images/:id | Delete image (admin) |

### Pricing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/pricing/config | Get pricing tiers |
| PUT | /api/pricing/config | Update pricing (admin) |

### Hat Config
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/hat-config | Get full config |
| Various | /api/hat-config/* | Manage hat types, colors, etc. (admin) |

---

## Admin Dashboard

**URL:** https://casparyhats.com/admin

### Features:
1. **Dashboard** - Overview and quick stats
2. **Contact Inquiries** - View and manage customer inquiries
3. **Newsletter Subscribers** - Manage email list
4. **Gallery** - Manage portfolio images
5. **Media Library** - Upload and manage images
6. **Blog Posts** - Create and edit blog content
7. **Pricing** - Configure pricing tiers
8. **Hat Designer Config** - Manage hat types and colors

---

## Deployment Workflow

### Making Changes

1. **Edit code locally**
2. **Test locally:**
   ```bash
   npm run dev:all
   ```
3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. **Automatic deployment:**
   - Netlify auto-deploys frontend on push
   - Railway auto-deploys backend on push

### Database Changes

If you modify `schema.sql`:
```bash
# Set DATABASE_URL to Railway's public URL, then:
cd server
npm run db:migrate
```

---

## Maintenance Tasks

### Backup Database
```bash
pg_dump "postgresql://postgres:xxx@xxx.proxy.rlwy.net:xxxxx/railway" > backup.sql
```

### Restore Database
```bash
psql "postgresql://postgres:xxx@xxx.proxy.rlwy.net:xxxxx/railway" < backup.sql
```

### Check Logs
- **Frontend:** Netlify dashboard → Deploys → View logs
- **Backend:** Railway dashboard → Server service → Logs

### Update Dependencies
```bash
npm update
cd server && npm update
```

---

## Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| Netlify | 100GB bandwidth/month | $19/month for more |
| Railway | $5 free credit/month | Usage-based after |
| Cloudinary | 25GB storage, 25GB bandwidth | Pay as you go |
| Resend | 3,000 emails/month | $20/month for more |
| GoDaddy | N/A | ~$20/year for domain |

---

## Troubleshooting

### Frontend not loading
- Check Netlify deploy logs
- Verify `VITE_API_URL` is set correctly

### API errors (500)
- Check Railway logs
- Verify `DATABASE_URL` is correct
- Ensure all env variables are set

### Emails not sending
- Check `RESEND_API_KEY` is set
- Verify domain in Resend dashboard
- Check Railway logs for email errors

### Images not uploading
- Verify Cloudinary credentials
- Check file size limits (10MB max)

### Can't login to admin
- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Railway
- Run `npm run db:seed` if user doesn't exist

---

## Support Contacts

- **Netlify:** https://www.netlify.com/support/
- **Railway:** https://railway.app/help
- **Cloudinary:** https://support.cloudinary.com/
- **Resend:** https://resend.com/docs

---

## Quick Reference

```
Production URLs:
├── Website:     https://casparyhats.com
├── Admin:       https://casparyhats.com/admin
├── API:         https://caspary-hat-co-production.up.railway.app
└── API Health:  https://caspary-hat-co-production.up.railway.app/api/health

Local Development:
├── Frontend:    http://localhost:5173
├── Backend:     http://localhost:3001
└── API Health:  http://localhost:3001/api/health

Commands:
├── npm run dev:all       # Start frontend + backend
├── npm run dev           # Start frontend only
├── npm run dev:backend   # Start backend only
├── npm run build         # Build frontend
├── npm run db:migrate    # Run database migrations
└── npm run db:seed       # Seed initial data
```

---

*Last updated: December 2024*
