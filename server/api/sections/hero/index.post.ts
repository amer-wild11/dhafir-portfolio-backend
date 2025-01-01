import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { before_image, after_image, background } = body;

  const data = {
    before_image,
    after_image,
    background,
  };
  const hero = await prisma.hero_section.create({
    data,
  });

  return { hero };
});
