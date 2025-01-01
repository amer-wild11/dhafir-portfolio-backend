import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { projects } = body;

    if (!projects) {
      return sendError(
        event,
        createError({ statusCode: 500, statusMessage: "Projects are required" })
      );
    }

    if (!Array.isArray(projects)) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: "Invalid input: 'projects' must be an array!",
        })
      );
    }

    for (const project of projects) {
      if (!project.id || project.arrange === undefined) {
        throw createError({
          statusCode: 400,
          statusMessage: "Each project must have 'id' and 'arrange'!",
        });
      }
      if (typeof project.arrange !== "number") {
        throw createError({
          statusCode: 400,
          statusMessage: "The 'arrange' value must be a number!",
        });
      }
    }

    const updatePromeises = projects.map(async (project) => {
      await prisma.project.update({
        where: { id: project.id },
        data: { arrange: project.arrange },
      });
    });

    await Promise.all(updatePromeises);

    return {
      success: true,
      message: "Projects updated successfully!",
    };
  } catch (err: any) {
    return sendError(event, err);
  }
});
