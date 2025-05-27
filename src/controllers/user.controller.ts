import { getUserByEmail } from "../services/user.service";
export const UserController = {
  loginController: async ({ body, set, jwt }: any) => {
    try {
      const { email, password } = body;

      const users = await getUserByEmail(email);
      if (!users || users.length === 0) {
        set.status = 401;
        return { message: "Invalid credentials" };
      }

      const user = users[0];
      const isValid = await Bun.password.verify(password, user.password);
      if (!isValid) {
        set.status = 401;
        return { message: "Invalid credentials" };
      }

      const token = await jwt.sign({ email: user.member_email });

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
        data: user,
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

      return {
        message: "User registered successfully",
        status: 201,
        data: "",
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
