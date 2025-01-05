import {
  defineEventHandler,
  readMultipartFormData,
  sendError,
  createError,
} from "h3";
import { v2 as cloudinary } from "cloudinary";
import prisma from "~/lib/prisma";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLD_CLOUD_NAME,
  api_key: process.env.CLD_API_KEY,
  api_secret: process.env.CLD_API_SECRET,
});

// Helper function to upload an image to Cloudinary
const uploadToCloudinary = (fileData: Buffer, folder: string) => {
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileData);
  });
};

// Helper function to delete an image from Cloudinary
const deleteFromCloudinary = (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

// Event handler
export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event);
    if (!form) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: "No form data submitted",
        })
      );
    }

    const aboutSection = await prisma.about_section.findFirst();
    if (!aboutSection) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: "About section not found",
        })
      );
    }

    const image = form.find((field) => field.name === "image");
    const background = form.find((field) => field.name === "background");
    const text = form.find((field) => field.name === "text");

    if (!image && !background && !text) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: "No parameters provided",
        })
      );
    }

    const updates: any = {};

    // Handle "before_image"
    if (image) {
      if (aboutSection.image_public_id) {
        await deleteFromCloudinary(aboutSection.image_public_id);
      }
      const image_response = await uploadToCloudinary(image.data, "uploads");
      updates.image = image_response.secure_url;
    }

    // Handle "background" (string link)
    if (background) {
      updates.background = background.data.toString("utf-8");
    }

    if (text) {
      updates.text = text.data.toString("utf-8");
    }

    // Update the database
    await prisma.about_section.update({
      where: { id: aboutSection.id },
      data: updates,
    });

    return {
      success: true,
      message: "About section updated successfully",
    };
  } catch (error: any) {
    // Handle and log errors
    console.error("Error updating about section:", error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: error.message || "Internal Server Error",
      })
    );
  }
});
