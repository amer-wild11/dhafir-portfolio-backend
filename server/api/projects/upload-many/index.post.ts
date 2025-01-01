export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { projects } = body;

  if (!projects) {
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: "Projects is required!" })
    );
  }

  // if (!Array.isArray(JSON.parse(projects))) {
  //   return sendError(
  //     event,
  //     createError({
  //       statusCode: 500,
  //       statusMessage: "Projects must be an array!",
  //     })
  //   );
  // }
  return projects;
});
