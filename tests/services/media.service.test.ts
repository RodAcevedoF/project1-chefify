import { test, expect, mock } from "bun:test";
import { mockUploader } from "../mocks/cloudinaryMocks";
import { cloudinary } from "../../src/config";
import { MediaService } from "../../src/services";

cloudinary.uploader = mockUploader as unknown as typeof cloudinary.uploader;

test("MediaService.upload should return mocked url and publicId", async () => {
  const buffer = Buffer.from("test-image");
  const folder = "test-folder";

  const result = await MediaService.upload(buffer, folder);

  expect(result.url).toMatch(/mocked.cloudinary/);
  expect(result.publicId).toBe("mocked-stream-id");
});

test("MediaService.deleteEntityImage should delete image and update entity", async () => {
  const entityId = "64b2a1234567896541230654";
  const type = "user";

  const mockEntity = {
    _id: entityId,
    imgPublicId: "old-img-id",
  };

  const updateById = mock(() => Promise.resolve());
  const findById = mock(() => Promise.resolve(mockEntity));
  const mockRepo = { findById, updateById } as unknown as any;

  const mockUploader = mock(() => Promise.resolve());

  await MediaService.deleteEntityImage(entityId, type, mockUploader, mockRepo);

  expect(mockUploader).toHaveBeenCalledWith("old-img-id");
  expect(updateById).toHaveBeenCalledWith(entityId, {
    imgUrl: undefined,
    imgPublicId: undefined,
  });
});
