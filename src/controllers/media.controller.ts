import type { ExtendedRequest } from '../types';
import type { Response } from 'express';
import { MediaService } from '../services';
import {
	mediaEntityConfig,
	successResponse,
	type MediaEntityType,
} from '../utils';
import { BadRequestError } from '../errors';

export const MediaController = {
	async uploadEntityImage(req: ExtendedRequest, res: Response) {
		const { type } = req.params as { type: MediaEntityType };

		if (!req.file?.buffer) {
			throw new BadRequestError('No image file received');
		}

		const folder = mediaEntityConfig[type]?.folder;
		if (!folder) {
			throw new BadRequestError(`Invalid media type: "${type}"`);
		}

		const result = await MediaService.upload(req.file.buffer, folder);

		return successResponse(
			res,
			{
				message: 'Image uploaded',
				url: result.url,
				publicId: result.publicId,
			},
			201,
		);
	},

	async replaceEntityImage(req: ExtendedRequest, res: Response) {
		const { id, type } = req.params as {
			id: string;
			type: MediaEntityType;
		};

		if (!req.file?.buffer) {
			throw new BadRequestError('No image file received');
		}

		const result = await MediaService.replaceEntityImage({
			entityId: id,
			type,
			buffer: req.file.buffer,
		});

		return successResponse(
			res,
			{
				message: `${type} image updated`,
				url: result.url,
				publicId: result.publicId,
			},
			200,
		);
	},

	async deleteEntityImage(req: ExtendedRequest, res: Response) {
		const { id, type } = req.params as {
			id: string;
			type: MediaEntityType;
		};

		await MediaService.deleteEntityImage(id, type);

		return successResponse(res, {
			message: `${type} image deleted`,
		});
	},
};
