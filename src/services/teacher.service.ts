import { pool } from "../utils/db";

const getTeacher = async () => {
    return await pool.query("SELECT * FROM teacher");
};

const getTeacherByEmail = async (email: string) => {
    const user = await pool.query(
        "SELECT teacher_email, teacher_password, teacher_id FROM teacher WHERE teacher_email = ?",
        [email]
    );
    return user[0];
};

const insertTeacher = async (data: any) => {
    // console.log(data.teacher_name);

    const result = await pool.query(
        "INSERT INTO teacher ( teacher_name, teacher_email, teacher_phone, teacher_password, teacher_profile_image) VALUES (?, ?, ?, ?, ?)",
        [data.teacher_name, data.teacher_email, data.teacher_phone, data.teacher_password, data.teacher_profile_images]
    );

    return result;
};

export { getTeacher, getTeacherByEmail, insertTeacher };
