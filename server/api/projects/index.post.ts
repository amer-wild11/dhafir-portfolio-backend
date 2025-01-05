import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { title, thumbnail, video, video_date } = body;

  if (!title) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Project title is required!",
      })
    );
  }
  if (!thumbnail) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Project thumbnail is required!",
      })
    );
  }

  if (!video_date) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Video date is required!",
      })
    );
  }

  if (!video) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Project video is required!",
      })
    );
  }

  const projects = await prisma.project.findMany();

  const data = {
    title,
    thumbnail,
    video,
    video_date,
    arrange: projects.length + 1,
  };

  const newProject = await prisma.project.create({ data });

  return {
    success: true,
    message: "Project created successfully!",
    project: newProject,
  };
});
