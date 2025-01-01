import prisma from "~/lib/prisma";
import bcrypt from "bcrypt";
import { useTransformers } from "~/composables/transformers";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const transformers = useTransformers();
  const { adminTransformer } = transformers;
  const { email, password } = body;
  if (!email) {
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: "Email is required!" })
    );
  }
  if (!password) {
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: "Password is required!" })
    );
  }

  const admin = await prisma.admin.findUnique({
    where: {
      email,
    },
  });

  if (!admin) {
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: "Wrong email!" })
    );
  }

  const isPasswordCorrect = await bcrypt.compare(password, admin.password);

  if (!isPasswordCorrect) {
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: "Wrong password!" })
    );
  }

  const secret_key = process.env.JWT_SECRET || "wild-secret";
  const token = jwt.sign({ email: admin.email, id: admin.id }, secret_key, {
    expiresIn: process.env.JWT_EXPIRATION || "1d",
  });

  return {
    admin: adminTransformer(admin),
    success: true,
    message: "Login successful!",
    token,
  };
});
