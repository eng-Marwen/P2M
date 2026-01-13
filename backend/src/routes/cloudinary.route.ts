import express, {Router} from "express";
import {
  deleteImage
} from "../controllers/cloudinary.controller";

const router:Router = express.Router();

router.post("/delete", deleteImage);

export default router;
