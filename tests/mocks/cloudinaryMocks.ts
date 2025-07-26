import { cloudinary } from "../../src/config";
import { jest } from "bun:test";

export const mockUploader = {
  upload: jest.fn(async (file: string, options: object) => ({
    secure_url: `https://mocked.cloudinary.com/${file}`,
    public_id: `mocked-id-${file}`
  })),

  upload_stream: jest.fn((options, callback) => {
    const stream = new (require("stream").Writable)();
    interface UploadStreamOptions {
      [key: string]: any;
    }

    interface UploadStreamCallback {
      (
        error: Error | null,
        result?: { secure_url: string; public_id: string }
      ): void;
    }

    interface WritableStream extends NodeJS.WritableStream {
      _write(
        chunk: any,
        encoding: string,
        done: (error?: Error | null) => void
      ): void;
    }

    stream._write = (
      chunk: any,
      encoding: string,
      done: (error?: Error | null) => void
    ): void => {
      // Simulamos subida y llamamos al callback
      (callback as UploadStreamCallback)(null, {
        secure_url: "https://mocked.cloudinary.com/fake-stream-upload.jpg",
        public_id: "mocked-stream-id"
      });
      done();
    };
    return stream;
  })
} as unknown as typeof cloudinary.uploader;
