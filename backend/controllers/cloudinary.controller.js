
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



export const deleteImage = async (req, res) => {
  const { publicId } = req.body;

  if (!publicId) {
    return res.status(400).json({ message: "Public ID is required" });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ message: "Image deleted successfully", result });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Error deleting image", error });
  }
};
