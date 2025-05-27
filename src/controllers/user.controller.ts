import { getUserByEmail } from "../services/user.service";
import pool from "../utils/db";

export const UserController = {
  loginController: async ({ body, set, jwt }: any) => {
    try {
      const { email, password } = body;

      const users = await getUserByEmail(email);
      if (!users || users.length === 0) {
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
        setCookie: {
          token: {
            value: token,
            path: "/",
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
          },
        },
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

      if (Object.keys(user).length > 0) {
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
