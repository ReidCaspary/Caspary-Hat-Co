# Caspary Hat Co. - Complete Setup Guide

This guide will walk you through everything needed to get your custom hat company website fully operational.

## 1. Install Software Prerequisites

- [ ] **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- [ ] **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- [ ] **Git** (if not already installed)

## 2. Sign Up for Required Services

### Cloudinary (Image Hosting)
- [ ] Sign up at [cloudinary.com](https://cloudinary.com/)
- [ ] Get your credentials from Dashboard > Settings > Access Keys:
  - Cloud Name
  - API Key
  - API Secret

### Email Service (Choose One)

**Option A: Gmail (Easiest for Development)**
- [ ] Use your Gmail account
- [ ] Enable 2-factor authentication
- [ ] Generate an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- [ ] Save the 16-character password

**Option B: SendGrid (Better for Production)**
- [ ] Sign up at [sendgrid.com](https://sendgrid.com/)
- [ ] Create an API key
- [ ] Verify your sender email

## 3. Database Setup

```bash
# Start PostgreSQL service
# Windows: Search for "Services" and start PostgreSQL
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
psql -U postgres
CREATE DATABASE caspary_hat_co;
\q
```

## 4. Project Setup

```bash
# Navigate to project
cd "C:/Projects/Caspary Hat Co"

# Install all dependencies
npm run install:all
```

## 5. Configure Backend Environment

```bash
# Copy environment template
cp server/.env.example server/.env
```

Edit `server/.env` with your credentials:

```env
# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/caspary_hat_co

# JWT (Generate a random string)
JWT_SECRET=your-super-secret-random-string-change-this

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email - Gmail Example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=noreply@casparyhatco.com

# Email - SendGrid Alternative
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=your-sendgrid-api-key

# Admin
ADMIN_EMAIL=admin@casparyhatco.com
ADMIN_PASSWORD=ChangeThisPassword123!
ADMIN_NOTIFICATION_EMAIL=sales@casparyhats.com

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

## 6. Configure Frontend Environment

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3001
```

## 7. Initialize Database

```bash
# Run migrations to create tables
npm run db:migrate

# Seed initial data (creates admin user)
npm run db:seed
```

**IMPORTANT:** The seed script will output your admin credentials. Save them!

## 8. Upload Images to Cloudinary

You'll need to replace the old Base44 image URLs. Here's how:

### Step 1: Download or Prepare Your Images

You need:
- Company logo
- Gallery images (hats you've made)
- Product images (hat styles)
- Background/hero images

### Step 2: Upload to Cloudinary

1. Log into [Cloudinary Dashboard](https://cloudinary.com/console)
2. Go to Media Library
3. Create folders:
   - `caspary-hat-co/logos`
   - `caspary-hat-co/gallery`
   - `caspary-hat-co/products`
   - `caspary-hat-co/backgrounds`
4. Upload images to appropriate folders
5. Copy the image URLs (they look like: `https://res.cloudinary.com/your-cloud-name/image/upload/...`)

### Step 3: Update Image URLs in Code

Replace Base44 URLs with your Cloudinary URLs in these files:

**`src/pages/Layout.jsx`** - Logo (appears twice)
```javascript
// Line ~116 and ~273
src="https://res.cloudinary.com/YOUR-CLOUD/image/upload/v1234567890/caspary-hat-co/logos/logo.png"
```

**`src/pages/Gallery.jsx`** - Gallery images
```javascript
// Lines ~50-120 (multiple image URLs in the gallery array)
images: [
  "https://res.cloudinary.com/YOUR-CLOUD/image/upload/.../hat1.jpg",
  "https://res.cloudinary.com/YOUR-CLOUD/image/upload/.../hat2.jpg",
  // etc...
]
```

**`src/pages/About.jsx`** - Background image
```javascript
// Line ~25
backgroundImage: 'url(https://res.cloudinary.com/YOUR-CLOUD/image/upload/.../background.jpg)'
```

**`src/components/home/HeroSection.jsx`** - Hero background
```javascript
backgroundImage: 'url(https://res.cloudinary.com/YOUR-CLOUD/image/upload/.../hero.jpg)'
```

**`src/components/home/FeaturedProducts.jsx`** - Product images
```javascript
// Multiple image URLs in the products array
image: "https://res.cloudinary.com/YOUR-CLOUD/image/upload/.../product1.jpg"
```

## 9. Start Development Servers

```bash
# Start both frontend and backend
npm run dev:all

# Or start separately in different terminals:
npm run dev          # Frontend: http://localhost:5173
npm run dev:backend  # Backend: http://localhost:3001
```

## 10. Test the Application

Visit http://localhost:5173 and verify:

- [ ] Website loads successfully
- [ ] Images display correctly
- [ ] Contact form submits (check email inbox)
- [ ] Newsletter signup works
- [ ] Admin login works (use credentials from step 7)
- [ ] Admin can access:
  - [ ] Media Library (upload images)
  - [ ] Contact Inquiries
  - [ ] Newsletter Subscribers

### Admin Access

1. Click "Get Quote" or navigate to any admin link
2. Login with credentials from `npm run db:seed` output
3. Access admin pages:
   - http://localhost:5173/media-library
   - http://localhost:5173/admin/inquiries
   - http://localhost:5173/admin/newsletter-subscribers

## 11. Optional: Production Deployment

For deploying to production:

### Database
- [ ] Set up production PostgreSQL (Railway, Supabase, or Heroku Postgres)
- [ ] Update `DATABASE_URL` in production environment

### Frontend (Vercel/Netlify)
- [ ] Push code to GitHub
- [ ] Connect repository to Vercel/Netlify
- [ ] Set environment variable: `VITE_API_URL=https://your-backend-url.com`
- [ ] Deploy

### Backend (Railway/Render/Heroku)
- [ ] Deploy `server/` directory
- [ ] Set all environment variables from `server/.env`
- [ ] Run migrations: `npm run db:migrate`
- [ ] Run seed: `npm run db:seed`
- [ ] Update `CORS_ORIGIN` to your frontend URL

### Domain
- [ ] Purchase domain (Namecheap, GoDaddy, etc.)
- [ ] Point DNS to your hosting provider

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
# Windows: Services > PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Verify database exists
psql -U postgres -l
```

### Port Already in Use

```bash
# Change PORT in server/.env to 3002 or another free port
# Update VITE_API_URL in frontend .env accordingly
```

### Email Not Sending

- Verify SMTP credentials are correct
- Check Gmail App Password is 16 characters, no spaces
- For Gmail: Enable 2-Factor Auth and use App Password
- Test with a simple email first

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules server/node_modules
npm run install:all
```

### Frontend Can't Connect to Backend

- Verify backend is running on correct port
- Check `VITE_API_URL` in `.env` matches backend port
- Check CORS settings in `server/src/index.js`
- Restart both servers after environment changes

### Images Not Loading

- Verify Cloudinary credentials in `server/.env`
- Check image URLs are correct in code
- Ensure images are set to public in Cloudinary

## Quick Reference Card

```
Development URLs:
├── Frontend: http://localhost:5173
├── Backend:  http://localhost:3001
└── API Test: http://localhost:3001/api/health

Database:
├── Host: localhost
├── Port: 5432
└── Name: caspary_hat_co

Admin Access:
├── Email:    (from npm run db:seed output)
└── Password: (from npm run db:seed output)

External Services:
├── Cloudinary: https://cloudinary.com/console
└── Email:      Gmail App Passwords or SendGrid

Useful Commands:
├── npm run dev:all      # Start everything
├── npm run db:migrate   # Reset database
├── npm run db:seed      # Add admin user
└── npm install:all      # Reinstall dependencies
```

## Project Structure

```
caspary-hat-co/
├── src/                      # React frontend
│   ├── api/
│   │   └── apiClient.js     # API communication
│   ├── pages/               # Page components
│   ├── components/          # Reusable components
│   └── main.jsx            # Entry point
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── config/         # Database setup
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, etc.
│   │   ├── services/       # Cloudinary, Email
│   │   └── index.js        # Server entry
│   ├── .env               # Backend config (DO NOT COMMIT)
│   └── package.json
├── .env                    # Frontend config (DO NOT COMMIT)
├── README.md              # Project overview
├── SETUP.md              # This file
└── MIGRATION_GUIDE.md    # Migration notes
```

## Support

If you encounter issues:

1. Check the Troubleshooting section above
2. Verify all environment variables are set correctly
3. Check the console for error messages
4. Ensure all services (PostgreSQL, Cloudinary, Email) are configured

## Security Notes

- Never commit `.env` files to version control
- Change default admin password immediately
- Use strong JWT_SECRET in production
- Enable HTTPS in production
- Regularly update dependencies
- Keep Cloudinary and email credentials secure

---

**Ready to launch!** Follow steps 1-10 in order, and your website will be fully functional.
