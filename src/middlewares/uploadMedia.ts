import type { Response, NextFunction } from 'express';
import type { ExtendedRequest } from '../types';
import { MulterError } from 'multer';
import { myMulter } from '../config';
import { BadRequestError, UploadError, ValidationError } from '../errors';

export const uploadMedia = (fieldName = 'mediafile', required = true) => {
	const uploader = myMulter.single(fieldName);

	return (req: ExtendedRequest, res: Response, next: NextFunction) => {
		uploader(req, res, (error) => {
			if (error instanceof MulterError) {
				return next(new ValidationError(`Multer error: ${error.message}`));
			}
			if (error) {
				return next(new UploadError(`Upload error: ${error.message}`));
			}

			if (!req.file || !req.file.buffer) {
				if (required) {
					return next(new BadRequestError('No media file received'));
				}
				return next();
			}

			next();
		});
	};
};
