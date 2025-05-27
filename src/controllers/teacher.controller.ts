import { getPagination } from "../services/pagination.service";
import { getUserByEmail } from "../services/user.service";
import { pool } from "../utils/db";
import { z } from "zod/v4";
import bcrypt from "bcryptjs";
import { Password } from "bun";

export const teacherController = {
  getTeacherController: async (req: any) => {
    const page: number = parseInt(req.query.page) || 1;
    const limit: number = parseInt(req.query.limit) || 10;
    const users = await getPagination("teacher", page, limit);
    if (Object.keys(users).length == 0) {
      return req.status(204, { message: "No teacher found" });
    }
    return users.data;
  },

  getTeacherEmail: async (req: any) => {
    const email: string = req.params.mail;
    const teacher: object = await getUserByEmail(email);
    if (Object.keys(teacher).length == 0) {
      return req.status(204, { message: "No teacher found" });
    }
    return req.status(200, teacher);
  },

  createTeacher: async (req: any) => {
    try {
      const data = req.body;
      const User = z.object({
        teacher_name: z.string(),
        teacher_email: z.string().email(),
        teacher_phone: z.string().min(10).max(15),
        teacher_password: z.string().min(6),
        teacher_profile_image: z.string().optional(),
      });
      const userResult = User.safeParse(data);
      if (!userResult.success) {
        for (const issue of userResult.error.issues) {
          console.error(`Validation failed: ${issue.message}\n`);
        }
        throw "Validation failed";
      }

      const res = userResult.data;
      // hash pass
      const hashedPassword = await bcrypt.hash(res.teacher_password, 10);

      const result = await pool.query(
        "INSERT INTO teacher (teacher_name, teacher_email, teacher_phone, teacher_password, teacher_profile_image) VALUES (?, ?, ?, ?, ?)",
        [
          res.teacher_name,
          res.teacher_email,
          res.teacher_phone,
          hashedPassword,
          res.teacher_profile_image || null,
        ]
      );
      return req.status(200, {
        success: true,
        message: "Teacher inserted successfully",
        data: result,
      });
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        console.error("Unexpected error: ", error);
        return req.status(500, {
          success: false,
          message: "duplicate Email",
        });
      }

      console.error("Unexpected error: ", error);
      return req.status(500, {
        success: false,
        message: "Unexpected error",
      });
    }
  },

  editTeacher: async (req: any) => {
    try {
      const data = req.body;
      // ถ้าค่่าไหนไม่มี จะไม่ถูกอัพเดท
      const User = z.object({
        teacher_id: z.int(),
        teacher_name: z.string().nonempty().optional(),
        teacher_email: z.string().email().nonempty().optional(),
        teacher_phone: z.string().min(10).max(15).nonempty().optional(),
        teacher_password: z.string().min(6).nonempty().optional(),
        teacher_profile_image: z.string().nonempty().optional(),
      });

      const userResult: any = User.safeParse(data);

      if (!userResult.success) {
        for (const issue of userResult.error.issues) {
          console.error(`Validation failed: ${issue.message}\n`);
        }
        throw "Validation failed";
      }

      const validatedData: any = userResult.data;
      const teacher_id = validatedData.teacher_id;
      delete validatedData.teacher_id; // ตัด id ออก ไม่งั้นอาจมีการนำ id ไปใช้ใน "SET ?"

      if (validatedData.teacher_password) {
        // if contain password hash pass
        const hashedPassword = await bcrypt.hash(
          validatedData.teacher_password,
          10
        );
        validatedData["teacher_password"] = hashedPassword;
      }

      const sql = `UPDATE teacher SET ? WHERE teacher_id = ?`;
      const result = await pool.query(sql, [validatedData, teacher_id]);

      return req.status(200, {
        success: true,
        message: "Teacher edited successfully",
        data: result,
      });
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        console.error("Unexpected error: ", error);
        return req.status(500, {
          success: false,
          message: "duplicate Email",
        });
      }

      console.error("Unexpected error: ", error);
      return req.status(500, {
        success: false,
        message: "Unexpected error",
      });
    }
  },

  deleteTeacher: async (req: any) => {
    const teacher_id: number = parseInt(req.params.id);
    if (isNaN(teacher_id)) {
      return req.status(400, { message: "Invalid teacher ID" });
    }
    const result = await pool.query(
      "DELETE FROM teacher WHERE teacher_id = ?",
      [teacher_id]
    );
    if (result.affectedRows === 0) {
      return req.status(404, { message: "Teacher not found" });
    }
    return req.status(200, { message: "Teacher deleted successfully" });
  },
};
