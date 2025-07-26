import { uploadToCloudinary, deleteFromCloudinary } from "../utils";
import {
  mediaEntityConfig,
  type MediaEntityType,
  getRepository
} from "../utils";
import { NotFoundError, BadRequestError } from "../errors";

interface UploadResult {
  url: string;
  publicId: string;
}

export const MediaService = {
  async upload(buffer: Buffer, folder: string): Promise<UploadResult> {
    const result = await uploadToCloudinary(buffer, folder);
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  },

  async replace(options: {
    buffer: Buffer;
    folder: string;
    previousPublicId?: string;
  }): Promise<UploadResult> {
    if (options.previousPublicId) {
      await deleteFromCloudinary(options.previousPublicId);
    }

    return this.upload(options.buffer, options.folder);
  },

  /* async replaceEntityImage(options: {
    entityId: string;
    type: MediaEntityType;
    buffer: Buffer;
  }): Promise<UploadResult> {
    const config = mediaEntityConfig[options.type];
    if (!config) {
      throw new BadRequestError("Invalid media type");
    }

    const entity = await config.repo.findById(options.entityId);
    if (!entity) {
      throw new NotFoundError(
        `${options.type} "${options.entityId}" not found`
      );
    }

    const result = await this.replace({
      buffer: options.buffer,
      folder: config.folder,
      previousPublicId: entity.imgPublicId
    });

    await config.repo.updateById(entity._id, {
      imgUrl: result.url,
      imgPublicId: result.publicId
    });

    return result;
  } */

  async replaceEntityImage({
    entityId,
    type,
    buffer
  }: {
    entityId: string;
    type: MediaEntityType;
    buffer: Buffer;
  }) {
    const config = mediaEntityConfig[type];
    if (!config) throw new BadRequestError("Invalid media type");

    const repo = getRepository(type);
    const entity = await repo.findById(entityId);
    if (!entity) throw new NotFoundError(`${type} "${entityId}" not found`);

    const result = await this.replace({
      buffer,
      folder: config.folder,
      previousPublicId: entity.imgPublicId
    });

    await repo.updateById(entity._id, {
      imgUrl: result.url,
      imgPublicId: result.publicId
    });

    return result;
  },
  /* async deleteEntityImage(
    entityId: string,
    type: MediaEntityType
  ): Promise<void> {
    const config = mediaEntityConfig[type];
    if (!config) {
      throw new BadRequestError("Invalid media type");
    }

    const entity = await config.repo.findById(entityId);
    if (!entity) {
      throw new NotFoundError(`${type} "${entityId}" not found`);
    }

    if (entity.imgPublicId) {
      await deleteFromCloudinary(entity.imgPublicId);

      await config.repo.updateById(entityId, {
        imgUrl: undefined,
        imgPublicId: undefined
      });
    }
  } */
  async deleteEntityImage(
    entityId: string,
    type: MediaEntityType
  ): Promise<void> {
    const config = mediaEntityConfig[type];
    if (!config) throw new BadRequestError("Invalid media type");

    const repo = getRepository(type);
    const entity = await repo.findById(entityId);
    if (!entity) throw new NotFoundError(`${type} "${entityId}" not found`);

    if (entity.imgPublicId) {
      await deleteFromCloudinary(entity.imgPublicId);
      await repo.updateById(entityId, {
        imgUrl: undefined,
        imgPublicId: undefined
      });
    }
  }
};
