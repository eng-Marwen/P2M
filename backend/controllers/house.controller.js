import House from "../models/house.model.js";

export const postHouse = async (req, res) => {
  const houseInfo = req.body || {};
  houseInfo.userRef = req.userId;

  // normalize optional area: accept numeric or string numbers; remove if empty/invalid
  if (Object.prototype.hasOwnProperty.call(houseInfo, "area")) {
    if (
      houseInfo.area === "" ||
      houseInfo.area === null ||
      houseInfo.area === undefined
    ) {
      delete houseInfo.area;
    } else {
      const areaNum = Number(houseInfo.area);
      if (!Number.isNaN(areaNum)) {
        houseInfo.area = areaNum;
      } else {
        delete houseInfo.area;
      }
    }
  }

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

export const updateListingById = async (req, res) => {
  const houseId = req.params.id;
  const updatedData = { ...(req.body || {}) };

  // normalize optional area on updates
  if (Object.prototype.hasOwnProperty.call(updatedData, "area")) {
    if (
      updatedData.area === "" ||
      updatedData.area === null ||
      updatedData.area === undefined
    ) {
      delete updatedData.area;
    } else {
      const areaNum = Number(updatedData.area);
      if (!Number.isNaN(areaNum)) {
        updatedData.area = areaNum;
      } else {
        delete updatedData.area;
      }
    }
  }

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

export const getUserHousesByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.userId !== userId) {
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
};

export const getHouseById = async (req, res) => {
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
};

export const getAllHouses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const pages = parseInt(req.query.page) || 1;
    const skip = (pages - 1) * limit;
    const parkingRaw = req.query.parking;
    const offerRaw = req.query.offer;
    const furnishedRaw = req.query.furnished;
    const typeRaw = req.query.type;
    const search = req.query.search || "";
    const sort = req.query.sort || "createdAt";
    const orderRaw = (req.query.order || "desc").toString().toLowerCase();

    // parse optional maxPrice query
    const maxPriceRaw = req.query.maxPrice;

    // normalize boolean-like query params into Mongo-friendly values
    const parseBoolValue = (v) => {
      if (v === undefined || v === "undefined" || v === "all")
        return { $in: [true, false] };
      if (v === "true" || v === "1") return true;
      if (v === "false" || v === "0") return false;
      return { $in: [true, false] };
    };

    const furnished = parseBoolValue(furnishedRaw);
    const offer = parseBoolValue(offerRaw);
    const parking = parseBoolValue(parkingRaw);

    // type filter: either a specific type or both
    const type =
      typeRaw === undefined || typeRaw === "undefined" || typeRaw === "all"
        ? { $in: ["sale", "rent"] }
        : typeRaw;

    // build base filter
    const filter = {
      name: { $regex: search, $options: "i" },
      type,
      furnished,
      offer,
      parking,
    };

    if (maxPriceRaw !== undefined && maxPriceRaw !== "") {
      const maxPrice = Number(maxPriceRaw);
      if (!Number.isNaN(maxPrice)) {
        // Match documents where:
        // - discountedPrice exists, > 0 and <= maxPrice (effective price is discounted)
        // OR
        // - regularPrice <= maxPrice (covers listings without a usable discountedPrice)
        filter.$or = [
          { discountedPrice: { $exists: true, $gt: 0, $lte: maxPrice } },
          { regularPrice: { $lte: maxPrice } },
        ];
      }
    }

    // convert order to numeric sort order
    const sortOrder = orderRaw === "asc" || orderRaw === "1" ? 1 : -1;

    const houses = await House.find(filter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await House.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: houses.length,
      totalResults: total,
      data: houses,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
