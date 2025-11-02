import { cloudinary } from '../config/cloudinary.config';
import { UploadError } from '../errors';
import streamifier from 'streamifier';

interface CloudinaryUploadResult {
	secure_url: string;
	public_id: string;
}

export const uploadToCloudinary = async (
	buffer: Buffer,
	folder: string,
	uploader = cloudinary.uploader,
): Promise<CloudinaryUploadResult> => {
	try {
		return new Promise((resolve, reject) => {
			const stream = uploader.upload_stream(
				{
					folder,
					upload_preset: undefined,
					resource_type: 'image',
				},
				(error, result) => {
					if (error || !result) {
						return reject(new UploadError(`Upload failed: ${error?.message}`));
					}

					resolve({
						secure_url: result.secure_url,
						public_id: result.public_id,
					});
				},
			);
			streamifier.createReadStream(buffer).pipe(stream);
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		throw new UploadError(`Cloudinary error: ${message}`);
	}
};
export const deleteFromCloudinary = async (
	publicId: string,
	uploader = cloudinary.uploader,
): Promise<void> => {
	if (!publicId) return;

	try {
		await uploader.destroy(publicId, { resource_type: 'image' });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		throw new UploadError(`Cloudinary error: ${message}`);
	}
};
