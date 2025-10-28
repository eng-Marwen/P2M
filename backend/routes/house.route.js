import express from "express";
import { postHouse } from "../controllers/house.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router.post("/", verifyToken, postHouse);

export default router;
