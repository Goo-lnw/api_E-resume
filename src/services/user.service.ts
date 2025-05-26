import { pool } from "../utils/db";
const getUsers = async () => {
  return await pool.query("SELECT * FROM member");
};
const getUserByEmail = async (email: string) => {
  const user = await pool.query(
    "SELECT member_email, member_password, member_id FROM member WHERE member_email = ?",
    [email]
  );
  return user[0];
};

export { getUsers, getUserByEmail };
