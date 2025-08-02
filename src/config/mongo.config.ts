import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
      throw new Error("DB_URL is not defined in environment variables");
    }
    await mongoose.connect(dbUrl);
  } catch (err) {
    console.error("Connection error", err);
  }
};
