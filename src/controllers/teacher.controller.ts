import { getTeacher, getTeacherByEmail, insertTeacher } from "../services/teacher.service";
import { compare } from "bcryptjs";
import { Context } from "elysia";

export const teacherController = {
    getTeacherController: async () => {
        const users = await getTeacher();
        return users;
    },

    getTeacherEmail: async (req: any) => {
        // console.log(e);
        const email: string = req.params.mail
        const teacher: object = await getTeacherByEmail(email);

        return teacher;
    },

    insertTeacher: async ({ body }: Context) => {
        console.log(body);

        // const body: object = req.body;
        // console.log(body);
        // const result: object = await insertTeacher(body)

        // return result;
    }

}



// const TeacherLoginController = async ({ body, set, jwt }: any) => {
//     const { email, password } = body;

//     const users = await getTeacherByEmail(email);
//     if (!users || users.length === 0) {
//         set.status = 401;
//         return { message: "Invalid credentials" };
//     }

//     const user = users[0];
//     const isValid = await Bun.password.verify(password, user.teacher_password);
//     if (!isValid) {
//         set.status = 401;
//         return { message: "Invalid credentials" };
//     }

//     const token = await jwt.sign({ email: user.member_email });

//     return {
//         setCookie: {
//             token: {
//                 value: token,
//                 path: "/",
//                 httpOnly: true,
//                 secure: false,
//                 sameSite: "lax",
//                 maxAge: 60 * 60 * 24,
//             },
//         },
//         message: "Login successful",
//         status: 200,
//         data: user,
//     };
// };