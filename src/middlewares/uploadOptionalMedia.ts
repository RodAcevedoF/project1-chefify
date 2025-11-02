import type {
	Response,
	NextFunction,
	Request as ExpressRequest,
} from 'express';
import type { ExtendedRequest } from '../types';
import { MulterError } from 'multer';
import { myMulter } from '../config';
import { UploadError } from '../errors';

export const uploadOptionalMedia = (fieldName = 'mediafile') => {
	const uploader = myMulter.single(fieldName);

	return (req: ExtendedRequest, res: Response, next: NextFunction) => {
		uploader(req as unknown as ExpressRequest, res, (error) => {
			if (error instanceof MulterError) {
				return next(new UploadError(`Multer error: ${error.message}`));
			}
			if (error) {
				return next(new UploadError(`Upload error: ${error.message}`));
			}

			next();
		});
	};
};

export default uploadOptionalMedia;
