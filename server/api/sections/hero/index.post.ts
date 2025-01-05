import { defineEventHandler, readMultipartFormData } from "h3";
import { v2 as cloudinary } from "cloudinary";
import prisma from "~/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLD_CLOUD_NAME,
  api_key: process.env.CLD_API_KEY,
  api_secret: process.env.CLD_API_SECRET,
});
export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event);

    if (!form) {
      throw new Error("No form data submitted");
    }

    const before_image = form.find((field) => field.name === "before_image");
    const after_image = form.find((field) => field.name == "after_image");
    const background = form.find((field) => field.name == "background");

    if (!before_image || !before_image.data) {
      throw new Error("Before image is required");
    }

    if (!after_image || !after_image.data) {
      throw new Error("After image is required");
    }

    if (!background || !background.data) {
      throw new Error("After image is required");
    }

    const backgroundValue = background.data.toString("utf-8");

    const before_image_response = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(before_image.data);
    });

    const after_image_response = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(after_image.data);
    });

    const data = {
      before_image: before_image_response.secure_url,
      after_image: after_image_response.secure_url,
      before_image_public_id: before_image_response.public_id,
      after_image_public_id: after_image_response.public_id,
      background: backgroundValue,
    };

    const heroSection = await prisma.hero_section.create({ data });
    return {
      success: true,
      hero: heroSection,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Something went wrong",
    };
  }
});
