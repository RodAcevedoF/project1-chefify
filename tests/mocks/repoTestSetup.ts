import { beforeAll, afterAll, beforeEach, afterEach } from "bun:test";
import { connectDB, clearDB, disconnectDB } from "../mocks/mongoServerMock";

export function setupRepoTestDB() {
  beforeAll(async () => {
    await connectDB();
    await clearDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });
}
