import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type ResourceType = 'video' | 'image' | 'raw' | 'auto';

export const uploadToCloudinary = async (
    fileBuffer: Buffer,
    folder: string,
    resourceType: ResourceType = 'auto'
): Promise<{ url: string; publicId: string }> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `kushal-stream/${folder}`,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error('Cloudinary upload failed'));
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        uploadStream.end(fileBuffer);
    });
};

/**
 * Extracts the public ID from a Cloudinary URL
 * Example: https://res.cloudinary.com/cloudname/video/upload/v12345/kushal-stream/videos/filename.mp4
 * Returns: kushal-stream/videos/filename
 */
export const extractPublicId = (url: string): string | null => {
    if (!url.includes('cloudinary.com')) return null;

    // Split by '/' and find the part after 'upload/'
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    // The public ID is everything after the version (v12345) until the extension
    // We join the parts after version and remove the extension
    const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
    const lastDotIndex = publicIdWithExtension.lastIndexOf('.');

    if (lastDotIndex === -1) return publicIdWithExtension;
    return publicIdWithExtension.substring(0, lastDotIndex);
};

export const deleteFromCloudinary = async (
    publicId: string,
    resourceType: ResourceType = 'auto'
): Promise<any> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
            publicId,
            { resource_type: resourceType },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
    });
};

export default cloudinary;
