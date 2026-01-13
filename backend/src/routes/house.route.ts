import express, {Router} from "express";
import {
  deleteHouseById,
  getUserHousesByUserId,
  postHouse,
  updateListingById,
  getHouseById,
  getAllHouses
} from "../controllers/house.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router:Router = express.Router();

router.post("/", verifyToken, postHouse);
router.get("/house/:id", getHouseById);
router.get("/:id", verifyToken, getUserHousesByUserId);
router.patch("/:id", verifyToken, updateListingById);
router.delete("/:id", verifyToken, deleteHouseById);
router.get("/", getAllHouses);

export default router;
