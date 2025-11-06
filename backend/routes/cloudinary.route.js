import express from "express";
import {
  deleteImage
} from "../controllers/cloudinary.controller.js";
const router = express.Router();

router.post("/delete", deleteImage);

export default router;
