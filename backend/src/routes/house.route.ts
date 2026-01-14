import express, { Router } from "express";
import {
  deleteHouseById,
  getAllHouses,
  getHouseById,
  getUserHousesByUserId,
  postHouse,
  updateListingById,
} from "../controllers/house.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router: Router = express.Router();

router.post("/", verifyToken, postHouse);
router.get("/house/:id", getHouseById);
router.get("/:id", verifyToken, getUserHousesByUserId);
router.patch("/:id", verifyToken, updateListingById);
router.delete("/:id", verifyToken, deleteHouseById);
router.get("/", getAllHouses);

export default router;
