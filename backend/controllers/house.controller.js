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

export const getUserHousesByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    if(req.userId !== userId){
      return res.status(403).json({
        status: "fail",
        message: "FORBIDDEN: You can only access your own houses",
      });
    }
    const userHouses = await House.find({ userRef: userId });
    res.status(200).json({
      status: "success",
      results: userHouses.length,
      data: userHouses,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
}
export const getHouseById= async (req, res) => {
  try {
    const houseId = req.params.id;
    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({
        status: "fail",
        message: "HOUSE NOT FOUND",
      });
    }
    res.status(200).json({
      status: "success",
      data: house,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const deleteHouseById = async (req, res) => {
  try {
    const houseId = req.params.id;
    const houseToDelete = await House.findById(houseId);
    if (!houseToDelete) {
      return res.status(404).json({
        status: "fail",
        message: "HOUSE NOT FOUND",
      });
    }
    if (houseToDelete.userRef.toString() !== req.userId) {
      return res.status(403).json({
        status: "fail",
        message: "FORBIDDEN: You can only delete your own houses",
      });
    }
    await House.findByIdAndDelete(houseId);
    res.status(200).json({
      status: "success",
      message: "HOUSE DELETED SUCCESSFULLY",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
}

export const updateListingById = async (req, res) => {
  const houseId = req.params.id;
  const updatedData = req.body;

  try {
    const updatedHouse = await House.findByIdAndUpdate(houseId, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedHouse) {
      return res.status(404).json({
        status: "fail",
        message: "HOUSE NOT FOUND",
      });
    }

    res.status(200).json({
      status: "success",
      message: "HOUSE UPDATED SUCCESSFULLY",
      data: updatedHouse,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};