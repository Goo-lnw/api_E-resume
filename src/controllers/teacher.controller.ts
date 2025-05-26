import {
  getTeacher,
  getTeacherByEmail,
  insertTeacherService,
} from "../services/teacher.service";

export const teacherController = {
  getTeacherController: async (req: any) => {
    const page: number = parseInt(req.query.page) || 1;
    const limit: number = parseInt(req.query.limit) || 10;
    const users = await getTeacher(page, limit);
    if (Object.keys(users).length == 0) {
      return req.status(204, { message: "No teacher found" });
    }
    return users;
  },

  getTeacherEmail: async (req: any) => {
    const email: string = req.params.mail;
    const teacher: object = await getTeacherByEmail(email);
    if (Object.keys(teacher).length == 0) {
      return req.status(204, { message: "No teacher found" });
    }
    return req.status(200, teacher);
  },

  insertTeacher: async (req: any) => {
    try {
      const data = req.body;
      const result = await insertTeacherService(data);
      if (!result) {
        return { status: 400, message: "Failed to insert teacher" };
      }
      return {
        status: 200,
        message: "Teacher inserted successfully",
        data: result,
      };
    } catch (error) {
      console.error("Error inserting teacher:", error);
      return { status: 500, message: "Internal server error" };
    }
  },
};
