import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });
    console.log("Avatar has been uploaded successfully on cloudinary ");
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("Avatar deleted successfully.");
        }
      });
    } else {
      console.warn("Avatar does not exist:", localFilePath);
    }
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("Avatar deleted successfully.");
        }
      });
    } else {
      console.warn("Avatar does not exist:", localFilePath);
    }
  }
};

const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result;
  } catch (error) {
    console.error("Error deleting Avatar from Cloudinary:", error);
    return false;
  }
};

export { uploadOnCloudinary, deleteImageFromCloudinary };
