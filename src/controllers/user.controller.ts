import { getUserByEmail } from "../services/user.service";
import pool from "../utils/db";
import { z } from "zod/v4";

export const UserController = {
  loginController: async ({ body, set, jwt }: any) => {
    try {
      const { email, password } = body;

      const users = await getUserByEmail(email);
      if (!users || Object.keys(users).length === 0) {
        console.log("User not found:", email);
        set.status = 401;
        return { message: "Invalid credentials" };
      }
      // console.log(users);

      const isValid = await Bun.password.verify(password, users.password);
      if (!isValid) {
        set.status = 401;
        return { message: "Invalid credentials" };
      }

      const token = await jwt.sign({ email: users.member_email });

      return {
        token,
        message: "Login successful",
        status: 200,
        data: users,
      };
    } catch (error) {
      console.error("Error in loginController:", error);
      set.status = 500;
      return { error: "Internal Server Error" };
    }
  },

  registerController: async (req: any) => {
    try {
      const data = req.body;

      const user = await getUserByEmail(data.student_email);
      // console.log("user in registerController:", user);

      if (user && Object.keys(user).length > 0) {
        return { message: "User already exists", status: 409 };
      }

      const hashedPassword = await Bun.password.hash(data.student_password);
      const result = await pool.query(
        "INSERT INTO student (student_name, student_email, student_phone, student_password, student_profile_image) VALUES (?, ?, ?, ?, ?)",
        [
          data.student_name,
          data.student_email,
          data.student_phone,
          hashedPassword,
          data.student_profile_image || null,
        ]
      );

      return {
        message: "User registered successfully",
        status: 201,
        data: result,
      };
    } catch (err: any) {
      if (err.code === "ER_DUP_ENTRY") {
        return {
          message: "Email already exists",
          status: 409,
        };
      }
      throw err;
    }
  },

  editUserController: async (req: any) => {
    try {
      const data = req.body;
      // ถ้าค่่าไหนไม่มี จะไม่ถูกอัพเดท
      const User = z.object({
        student_id: z.int(),
        student_name: z.string().nonempty().optional(),
        student_email: z.string().email().nonempty().optional(),
        student_phone: z.string().min(10).max(15).nonempty().optional(),
        student_password: z.string().min(6).nonempty().optional(),
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
      const student_id = validatedData.student_id;
      delete validatedData.student_id; // ตัด id ออก ไม่งั้นอาจมีการนำ id ไปใช้ใน "SET ?"

      if (validatedData.student_password) {
        // if contain password hash pass
        const hashedPassword = await Bun.password.hash(validatedData.student_password);
        validatedData["student_password"] = hashedPassword;
      }

      const sql = `UPDATE student SET ? WHERE student_id = ?`;
      const result = await pool.query(sql, [validatedData, student_id]);

      return req.status(200, {
        success: true,
        message: "student edited successfully",
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

  deleteUserController: async (req: any) => {
    const student_id: number = parseInt(req.params.id);
    if (isNaN(student_id)) {
      return req.status(400, { message: "Invalid student ID" });
    }
    const [result]: any = await pool.query(
      "DELETE FROM student WHERE student_id = ?",
      [student_id]
    );
    console.log(result);

    if (result.affectedRows === 0) {
      return req.status(404, { message: "student not found" });
    }
    return req.status(200, { message: "student deleted successfully" });
  },
};
