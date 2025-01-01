import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");

  if (!authHeader) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "Authorization token is required!",
      })
    );
  }

  const token = authHeader.split(" ")[1];
  const secret_key = process.env.JWT_SECRET || "wild-secret";

  try {
    const decoded = jwt.verify(token, secret_key);
    event.context.admin = decoded;
  } catch (er) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid or expired token!",
    });
  }
});
