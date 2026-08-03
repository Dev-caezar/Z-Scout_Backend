import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/**
 * Uploads a buffer to Cloudinary.
 *
 * @param {Buffer} buffer - File buffer (from multer memoryStorage)
 * @param {string} folder - Cloudinary folder path
 * @param {"image"|"video"} resourceType - defaults to "image" to stay
 *   backward-compatible with existing calls in uploadPlayerImages
 */
export const uploadToCloudinary = (buffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
