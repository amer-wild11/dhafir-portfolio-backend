import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const { id: projectId } = event.context.params || {};

    if (!projectId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Project ID is required!",
      });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: "Project not found!",
        })
      );
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return {
      success: true,
      message: "Project deleted successfully!",
    };
  } catch (err: any) {
    return sendError(event, err);
  }
});
