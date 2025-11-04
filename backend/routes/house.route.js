import express from "express";
import {getUserHousesById, postHouse,deleteHouseById } from "../controllers/house.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router.post("/", verifyToken, postHouse);

router.get("/:id", verifyToken, getUserHousesById);

router.patch("/", (req, res) => {
  res.send("House route is working");
});
router.delete("/:id", verifyToken, deleteHouseById);

export default router;
