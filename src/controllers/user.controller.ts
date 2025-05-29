import { getUserByEmail, getSession } from "../services/user.service";
import pool from "../utils/db";
import { z } from "zod/v4";

export const UserController = {
  getStudentController: async (req: any) => {
    try {
      const session = await getSession(req);
      const student_id = session?.userId;
      if (!student_id) return;
      const user = await pool.query(
        "SELECT * FROM student WHERE student_id = ?",
        [student_id]
      );
      console.log(user[0]);
      return user[0];
    } catch (err) {
      console.log(err);
    }
  },

  editUserController: async (req: any) => {
    try {
      const userRole = req.user.role;
      const userId: number = parseInt(req.user.userId);
      if (userRole !== "student") {
        throw "you don't has a permission";
      }

      const data = req.body;
      // ถ้าค่่าไหนไม่มี จะไม่ถูกอัพเดท ห้่ามส่ง stringว่าง "" มา ***โดยเฉพาะ password
      // ถ้า edit password ส่งมาแต่ password ได้เลย ไม่ต้องส่งตัวอื่น
      // หรือแยกเส้น password change เลยดี
      const User = z.object({
        student_name: z.string().nonempty().optional(),
        student_email: z.string().email().nonempty().optional(),
        student_phone: z.string().min(10).max(15).nonempty().optional(),
        student_password: z.string().min(8).optional(),
        student_profile_image: z.string().nonempty().optional(),
      });

      const userResult: any = User.safeParse(data);

      if (!userResult.success) {
        for (const issue of userResult.error.issues) {
          console.error(`Validation failed: ${issue.message}\n`);
        }
        throw "Validation failed";
      }

      const validatedData: any = userResult.data;

      if (validatedData.student_password) {
        // if contain password hash pass
        const hashedPassword = await Bun.password.hash(
          validatedData.student_password
        );
        validatedData["student_password"] = hashedPassword;
      }

      const sql = `UPDATE student SET ? WHERE student_id = ?`;
      const [result]: any = await pool.query(sql, [validatedData, userId]);

      if (result.affectedRows == 0) {
        return req.status(404, {
          success: false,
          message: "user id didn't found",
        });
      }

      if (result.changedRows == 0) {
        throw "No data changed";
      }

      return req.status(200, {
        success: true,
        message: "User edited successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Unexpected error: ", error);
      return req.status(500, {
        success: false,
        message: "Unexpected error",
        detail: error,
      });
    }
  },

  deleteUserController: async (req: any) => {
    const userRole = req.user.role;
    const userId: number = parseInt(req.user.userId);
    if (userRole !== "student") {
      throw "you don't has a permission";
    }
    if (isNaN(userId)) {
      return req.status(400, { message: "Invalid student ID" });
    }
    const [result]: any = await pool.query(
      "DELETE FROM student WHERE student_id = ?",
      [userId]
    );
    console.log(result);

    if (result.affectedRows === 0) {
      return req.status(404, { message: "student not found" });
    }
    return req.status(200, { message: "student deleted successfully" });
  },
};
