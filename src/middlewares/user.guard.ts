import { ownership } from "./ownership";
import { UserService } from "../services";

export const userGuard = ownership({
  findById: () => UserService.getUserById,
  field: "_id",
  resourceName: "user",
});
