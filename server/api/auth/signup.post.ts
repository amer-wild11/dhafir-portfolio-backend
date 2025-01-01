import bcrypt from "bcrypt";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return "signup route is not avaliable!";
  const { email, password, name } = body;

  if (!password) {
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: "Password is required!" })
    );
  }

  if (!email) {
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: "Email is required!" })
    );
  }

  if (!name) {
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: "Name is required!" })
    );
  }

  const hashedPass = await bcrypt.hash(password, 10);

  const data = {
    email,
    password: hashedPass,
    name,
  };

  const admin = await prisma.admin.create({ data });

  return {
    admin,
  };
});
