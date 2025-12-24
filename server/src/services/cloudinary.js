import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image from buffer (for multer uploads)
export const uploadImage = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'caspary-hat-co',
      resource_type: 'auto',
      ...options
    };

    cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format
        });
      }
    }).end(buffer);
  });
};

// Upload base64 image (for whiteboard drawings)
export const uploadBase64Image = async (base64String, options = {}) => {
  try {
    const uploadOptions = {
      folder: options.folder || 'caspary-hat-co/whiteboard',
      resource_type: 'auto',
      ...options
    };

    const result = await cloudinary.uploader.upload(base64String, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    throw error;
  }
};

// Delete image by public ID
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

// Remove background from image using Cloudinary AI
export const removeBackground = async (publicId) => {
  try {
    // Generate URL with background removal and PNG format for transparency
    const transformedUrl = cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { format: 'png' }
      ],
      secure: true
    });

    return {
      url: transformedUrl,
      publicId: publicId
    };
  } catch (error) {
    console.error('Cloudinary background removal error:', error);
    throw error;
  }
};

// Generate signed URL for private files
export const getSignedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    type: 'authenticated',
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  };

  return cloudinary.url(publicId, { ...defaultOptions, ...options });
};

export default cloudinary;
