import express from "express";
import { postHouse } from "../controllers/house.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router.post("/", verifyToken, postHouse);

router.get("/", (req, res) => {
  res.send("House route is working");
});
router.patch("/", (req, res) => {
  res.send("House route is working");
});
router.delete("/", (req, res) => {
  res.send("House route is working");
});

export default router;
