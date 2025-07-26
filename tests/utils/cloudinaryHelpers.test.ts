import { uploadToCloudinary } from "../../src/utils";
import { mockUploader } from "../mocks/cloudinaryMocks";
import { describe, it, expect } from "bun:test";
describe("uploadToCloudinary", () => {
  it("should call upload and return secure_url", async () => {
    const file = Buffer.from("image.jpg");

    const result = await uploadToCloudinary(file, "uploads", mockUploader);

    expect(mockUploader.upload_stream).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: "uploads",
        resource_type: "image"
      }),
      expect.any(Function)
    );

    expect(result).toEqual({
      secure_url: "https://mocked.cloudinary.com/fake-stream-upload.jpg",
      public_id: "mocked-stream-id"
    });
  });
});
