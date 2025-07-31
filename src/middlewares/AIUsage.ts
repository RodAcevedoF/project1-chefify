import type { NextFunction, Request, Response } from "express";
import { User } from "../models";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../errors";

export async function limitAIUsage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  if (!userId) return next(new UnauthorizedError("User not authenticated"));

  const user = await User.findById(userId);
  if (!user) return next(new NotFoundError("User not found"));

  const now = new Date();

  if (!user.iaUsage) {
    user.iaUsage = {
      count: 1,
      lastReset: now,
    };
    await user.save();
    return next();
  }

  const diffInHours =
    (now.getTime() - user.iaUsage.lastReset.getTime()) / (1000 * 60 * 60);

  if (diffInHours >= 24) {
    user.iaUsage.count = 1;
    user.iaUsage.lastReset = now;
  } else {
    if (user.iaUsage.count >= 3) {
      return next(
        new ForbiddenError("You have reached the daily AI suggestion limit")
      );
    }
    user.iaUsage.count += 1;
  }

  await user.save();
  next();
}
