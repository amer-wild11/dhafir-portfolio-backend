import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const section = await prisma.about_section.findFirst();
  return { section };
});
