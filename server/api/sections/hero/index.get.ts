import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const hero_section = await prisma.hero_section.findFirst();

  return {
    section: hero_section,
  };
});
