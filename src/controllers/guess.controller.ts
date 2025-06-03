import { getUserByEmail } from "../services/user.service";
import pool from "../utils/db";

export const guessController = {
  loginController: async ({ set, body, jwt, cookie: { auth } }: any) => {
    try {
      const { email, password } = body;
      const users = await getUserByEmail(email);
      if (!users || Object.keys(users).length === 0) {
        console.log("User not found:", email);
        set.status = 401;
        return { message: "Invalid credentials" };
      }

      const isValid = await Bun.password.verify(password, users.password);
      if (!isValid) {
        set.status = 401;
        return { message: "Invalid credentials" };
      }

      const token = await jwt.sign({
        email: users.member_email,
        role: users.role,
        isAdmin: users.isAdmin,
        userId: users.id,
      });

      auth.value = {
        authToken: token,
      };

      return {
        token,
        message: "Login successful",
        status: 200,
        data: users,
      };
    } catch (error) {
      console.error("Error in loginController:", error);
      return { error: "Internal Server Error" };
    }
  },

  registerController: async (req: any) => {
    try {
      const data = req.body;

      const user = await getUserByEmail(data.student_email); //ถ้าเมลซ้ำกับตาราง teacher จะสร้างไม่ได้
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
};
