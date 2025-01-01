import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    // قراءة البيانات المرسلة
    const body = await readBody(event);

    const { id, title, thumbnail, video, arrange } = body;

    // التحقق من وجود الحقل الأساسي (id)
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Project ID is required!",
      });
    }

    // التحقق من وجود المشروع في قاعدة البيانات
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw createError({
        statusCode: 404,
        statusMessage: "Project not found!",
      });
    }

    // تحديث المشروع
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(video !== undefined && { video }),
        ...(arrange !== undefined && { arrange }),
      },
    });

    // إرجاع استجابة النجاح
    return {
      success: true,
      message: "Project updated successfully!",
      project: updatedProject,
    };
  } catch (error: any) {
    // إدارة الأخطاء
    return sendError(event, error);
  }
});
