import House from "../models/house.model.js";   


export const postHouse = async (req, res) => {
  const houseInfo = req.body;
  houseInfo.userRef = req.userId;
  try {
    if (!houseInfo) {
      throw new Error("HOUSE INFO IS MISSING");
    }
    const newHouse = await House.create(houseInfo);
    res.status(201).json({
      status: "success",
      message: "HOUSE ADDED SUCCESSFULLY",
      data: newHouse,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
      
    });
  }
};
