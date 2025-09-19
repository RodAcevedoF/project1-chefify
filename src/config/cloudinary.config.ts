import { v2 as baseCloudinary } from "cloudinary";
import "dotenv/config";

baseCloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
});
export const cloudinary = baseCloudinary;
