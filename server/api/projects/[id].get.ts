import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    // التحقق من وجود المعرف في البارامترات
    const { id: projectId } = event.context.params || {};
    if (!projectId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Project ID is required!",
      });
    }

    // جلب المشروع من قاعدة البيانات
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    // التحقق من وجود المشروع
    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: "Project not found!",
      });
    }

    // إرجاع بيانات المشروع
    return { success: true, project };
  } catch (error: any) {
    // معالجة الأخطاء بشكل موحد
    return sendError(event, error);
  }
});
