# Caspary Hat Co. Website

Custom hat company website with React frontend and Node.js/Express backend.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Cloudinary account
- SMTP email service (Gmail, SendGrid, etc.)

## Project Structure

```
caspary-hat-co/
├── src/                  # React frontend (Vite)
├── server/               # Node.js/Express backend
│   ├── src/
│   │   ├── config/       # Database, migrations
│   │   ├── middleware/   # Auth middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Cloudinary, email
│   │   └── index.js      # Server entry point
│   └── package.json
├── package.json          # Frontend dependencies
└── README.md
```

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately
npm install
cd server && npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE caspary_hat_co;
```

2. Copy environment file and configure:
```bash
cd server
cp .env.example .env
# Edit .env with your database URL and other settings
```

3. Run database migrations:
```bash
npm run db:migrate
```

4. Seed initial data (creates admin user):
```bash
npm run db:seed
```

### 3. Configure Environment Variables

**Backend (`server/.env`):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/caspary_hat_co
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend (`.env`):**
```env
VITE_API_URL=http://localhost:3001
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev:all

# Or start separately:
npm run dev          # Frontend on http://localhost:5173
npm run dev:backend  # Backend on http://localhost:3001
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Contact
- `POST /api/contact` - Submit contact inquiry
- `GET /api/inquiries` - List inquiries (admin only)

### Blog
- `GET /api/blog` - List published posts
- `POST /api/blog` - Create post (admin only)
- `PUT /api/blog/:id` - Update post (admin only)
- `DELETE /api/blog/:id` - Delete post (admin only)

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe
- `GET /api/newsletter/subscribers` - List subscribers (admin only)

### Images
- `GET /api/images` - List images
- `POST /api/images/upload` - Upload image (admin only)
- `DELETE /api/images/:id` - Delete image (admin only)

## Default Admin Credentials

After running `npm run db:seed`:
- Email: admin@casparyhatco.com
- Password: admin123

**Change these immediately in production!**

## Production Deployment

1. Set `NODE_ENV=production` in backend .env
2. Update `CORS_ORIGIN` to your production frontend URL
3. Build frontend: `npm run build`
4. Use a process manager like PM2 for the backend
5. Set up reverse proxy (nginx) for both frontend and backend

## Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- shadcn/ui components
- React Query
- React Router

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT authentication
- Cloudinary (image hosting)
- Nodemailer (email)
