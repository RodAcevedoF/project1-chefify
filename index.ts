import app from "./src/app.js";
import { connectDB } from "./src/config/mongoConfig.ts";
import config from "./src/config/config.ts";

async function startServer() {
  try {
    await connectDB();
    console.log("MongoDB connected");

    app.listen(config.port, "0.0.0.0", () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Connection error", err.stack);
    } else {
      console.error("Connection error", err);
    }
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
