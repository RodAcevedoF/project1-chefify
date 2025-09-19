import { UserService } from "../services";
import { ownership } from "./ownership";

export const authGuard = ownership({
  findById: () => UserService.getUserById,
  field: "_id",
  resourceName: "user",
});
