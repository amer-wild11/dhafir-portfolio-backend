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

    const image = form.find((field) => field.name === "image");
    const background = form.find((field) => field.name == "background");
    const text = form.find((field) => field.name == "text");

    if (!image || !image.data) {
      throw new Error("Image is required");
    }
    if (!background || !background.data) {
      throw new Error("Background is required");
    }
    if (!text || !text.data) {
      throw new Error("About text is required");
    }

    const backgroundValue = background.data.toString("utf-8");
    const textValue = text.data.toString("utf-8");

    const image_response = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(image.data);
    });

    const data = {
      image: image_response.secure_url,
      image_public_id: image_response.public_id,
      background: backgroundValue,
      text: textValue,
    };

    const aboutSection = await prisma.about_section.create({ data });
    return {
      success: true,
      about: aboutSection,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Something went wrong",
    };
  }
});
