# Frontend Migration Guide: Base44 to Custom Backend

This guide outlines the remaining frontend changes needed to complete the migration from Base44 to the custom backend.

## Overview

The backend has been fully created with:
- Express.js server with PostgreSQL
- JWT authentication
- Cloudinary integration for file uploads
- Nodemailer for emails
- All API endpoints ready

The frontend API client (`src/api/apiClient.js`) has been created to replace the Base44 SDK.

## Required Frontend File Updates

### 1. Remove Base44 Files

Delete these files (no longer needed):
```
src/api/base44Client.js
src/api/entities.js
src/api/integrations.js
```

### 2. Update Import Statements

In each file below, replace the Base44 imports with the new API client:

**Before:**
```javascript
import { base44 } from "@/api/base44Client";
```

**After:**
```javascript
import { User, ContactInquiry, BlogPost, Image, NewsletterSubscriber } from "@/api/apiClient";
```

### 3. File-by-File Changes

#### `src/pages/Contact.jsx`
```javascript
// Change import
import { ContactInquiry } from "@/api/apiClient";

// Update mutation
const createInquiry = useMutation({
  mutationFn: async (data) => {
    return ContactInquiry.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      event_type: data.subject,
      message: data.message,
      quantity: data.quantity,
      whiteboard_image: data.whiteboardData
    });
  },
  // ... rest stays same
});
```

#### `src/pages/Layout.jsx`
```javascript
// Change import
import { User } from "@/api/apiClient";

// Update useEffect
useEffect(() => {
  const fetchUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };
  fetchUser();
}, []);
```

#### `src/pages/AdminInquiries.jsx`
```javascript
// Change import
import { User, ContactInquiry } from "@/api/apiClient";

// Update auth check
const currentUser = await User.me();

// Update query
const { data: inquiries, isLoading: inquiriesLoading } = useQuery({
  queryKey: ['contact-inquiries'],
  queryFn: () => ContactInquiry.findMany(),
  initialData: [],
  enabled: !!user && user.role === 'admin'
});

// Update mutations
const updateStatusMutation = useMutation({
  mutationFn: ({ id, status }) => ContactInquiry.updateStatus(id, status),
  // ...
});

const deleteMutation = useMutation({
  mutationFn: (id) => ContactInquiry.delete(id),
  // ...
});
```

#### `src/pages/Blog.jsx`
```javascript
// Change import
import { BlogPost } from "@/api/apiClient";

// Update query
const { data: posts, isLoading } = useQuery({
  queryKey: ['blog-posts', selectedCategory],
  queryFn: () => BlogPost.findMany({
    category: selectedCategory !== "all" ? selectedCategory : undefined
  }),
  initialData: [],
});

// Update single post query
const { data: singlePost, isLoading: singlePostLoading } = useQuery({
  queryKey: ['blog-post', postSlug],
  queryFn: () => BlogPost.findBySlug(postSlug),
  enabled: !!postSlug,
});

// Note: Replace created_date with created_at in all date formatting
```

#### `src/pages/MediaLibrary.jsx`
```javascript
// Change import
import { User, Image } from "@/api/apiClient";

// Update auth check
const currentUser = await User.me();

// Update query
const { data: images, isLoading: imagesLoading } = useQuery({
  queryKey: ['images'],
  queryFn: () => Image.findMany(),
  initialData: [],
  enabled: !!user && user.role === 'admin'
});

// Update upload mutation
const uploadMutation = useMutation({
  mutationFn: async (data) => {
    return Image.upload(data.file, {
      alt_text: data.name,
      category: data.description
    });
  },
  // ...
});

// Update delete mutation
const deleteMutation = useMutation({
  mutationFn: (id) => Image.delete(id),
  // ...
});

// Note: Replace image_url with url, created_date with uploaded_at
```

#### `src/components/NewsletterPopup.jsx`
```javascript
// Change import
import { NewsletterSubscriber } from "@/api/apiClient";

// Update mutation
const signupMutation = useMutation({
  mutationFn: async (data) => {
    await NewsletterSubscriber.subscribe(data.email);
    // Generate discount code locally since backend doesn't do this
    const code = generateDiscountCode();
    return { code };
  },
  // ...
});

// Simplify - remove resend code functionality or implement differently
```

#### `src/pages/AdminNewsletterSubscribers.jsx`
```javascript
// Change import
import { User, NewsletterSubscriber } from "@/api/apiClient";

// Update auth check
const currentUser = await User.me();

// Update query
const { data: subscribers = [], isLoading } = useQuery({
  queryKey: ['newsletter-subscribers'],
  queryFn: () => NewsletterSubscriber.findMany(),
  enabled: !!user,
});

// Update delete mutation
const deleteSubscriberMutation = useMutation({
  mutationFn: (id) => NewsletterSubscriber.delete(id),
  // ...
});

// Note: Replace created_date with subscribed_at
// Note: discount_code, code_used fields no longer exist - remove or adjust UI
```

### 4. Date Field Changes

The new backend uses different field names:
- `created_date` → `created_at`
- `image_url` → `url` (in images table)

Update all date formatting calls accordingly.

### 5. Remove @base44/sdk from package.json

Remove the dependency:
```bash
npm uninstall @base44/sdk
```

Add @tanstack/react-query if not present:
```bash
npm install @tanstack/react-query
```

### 6. Add concurrently for dev:all script

```bash
npm install -D concurrently
```

## Hardcoded Base44 URLs to Replace

These files contain Base44/Supabase URLs that should be replaced with Cloudinary URLs after uploading your images:

1. **`src/pages/Layout.jsx`** - Logo image
2. **`src/pages/Gallery.jsx`** - Gallery images
3. **`src/pages/About.jsx`** - Background image
4. **`src/components/home/FeaturedProducts.jsx`** - Product images

After setting up Cloudinary:
1. Upload your images to Cloudinary
2. Replace the URLs in these files with your Cloudinary URLs

## Testing Checklist

After making all changes, test:

- [ ] Contact form submission
- [ ] Admin login
- [ ] View contact inquiries (admin)
- [ ] Blog posts display
- [ ] Newsletter signup
- [ ] Newsletter subscribers list (admin)
- [ ] Media library upload (admin)
- [ ] Image display in gallery
- [ ] User authentication persistence
