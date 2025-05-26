import { getUsers, getUserByEmail } from "../services/user.service";
import { compare } from "bcryptjs";
import { Context } from "elysia";
const getUserController = async () => {
  const users = await getUsers();
  return users;
};

const loginController = async ({ body, set, jwt }: any) => {
  const { email, password } = body;

  const users = await getUserByEmail(email);
  if (!users || users.length === 0) {
    set.status = 401;
    return { message: "Invalid credentials" };
  }

  const user = users[0];
  const isValid = await Bun.password.verify(password, user.member_password);
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
};

export { loginController, getUserController };
