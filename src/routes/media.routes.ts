import { Router } from "express";
import { MediaController } from "../controllers";
import { uploadMedia, authenticate } from "../middlewares";

const router = Router();

router.post(
  "/:type",
  authenticate(),
  uploadMedia(),
  MediaController.uploadEntityImage
);

router.patch(
  "/:type/:id",
  authenticate(),
  uploadMedia(),
  MediaController.replaceEntityImage
);

router.delete("/:type/:id", authenticate(), MediaController.deleteEntityImage);

export default router;
