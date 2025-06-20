import { Router } from "express";
import userAuth from "../middlewares/AuthMiddleware.js";
import { generateImage } from "../controllers/gntImageController.js";

const router = Router();

router.post('/generate-image',userAuth,generateImage);

export default router;