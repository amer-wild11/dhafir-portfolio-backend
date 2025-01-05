import { v2 as _cloudinary } from "cloudinary";

const cloudinary = () => {
  _cloudinary.config({
    cloud_name: process.env.CLD_CLOUND_NAME,
    api_key: process.env.CLD_API_KEY,
    api_secret: process.env.CLD_API_SECRET,
  });

  return _cloudinary;
};

export const uploadToCloudinary = (image: any) => {
  return new Promise((reslove, reject) => {
    cloudinary().uploader.upload(image, (err: any, data: any) => {
      if (err) {
        reject(err);
      }
      reslove(data);
    });
  });
};
