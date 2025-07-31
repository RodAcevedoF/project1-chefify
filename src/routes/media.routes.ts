import { Router } from "express";
import { MediaController } from "../controllers";
import { uploadMedia } from "../middlewares/uploadMedia";
import { authenticate } from "../middlewares/authenticate";

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
