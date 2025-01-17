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

    const heroSection = await prisma.hero_section.findFirst();
    if (!heroSection) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: "Hero section not found",
        })
      );
    }

    const newBeforeImage = form.find((field) => field.name === "before_image");
    const newAfterImage = form.find((field) => field.name === "after_image");
    const newBackground = form.find((field) => field.name === "background");

    if (!newBeforeImage && !newAfterImage && !newBackground) {
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
    if (newBeforeImage) {
      if (heroSection.before_image_public_id) {
        await deleteFromCloudinary(heroSection.before_image_public_id);
      }
      const beforeImageResponse = await uploadToCloudinary(
        newBeforeImage.data,
        "uploads"
      );
      updates.before_image = beforeImageResponse.secure_url;
      updates.before_image_public_id = beforeImageResponse.public_id;
    }

    // Handle "after_image"
    if (newAfterImage) {
      if (heroSection.after_image_public_id) {
        await deleteFromCloudinary(heroSection.after_image_public_id);
      }
      const afterImageResponse = await uploadToCloudinary(
        newAfterImage.data,
        "uploads"
      );
      updates.after_image = afterImageResponse.secure_url;
      updates.after_image_public_id = afterImageResponse.public_id;
    }

    // Handle "background" (string link)
    if (newBackground) {
      updates.background = newBackground.data.toString();
    }

    // Update the database
    await prisma.hero_section.update({
      where: { id: heroSection.id },
      data: updates,
    });

    return {
      success: true,
      message: "Hero section updated successfully",
    };
  } catch (error: any) {
    // Handle and log errors
    console.error("Error updating hero section:", error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: error.message || "Internal Server Error",
      })
    );
  }
});
