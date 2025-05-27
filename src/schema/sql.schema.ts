import { t } from "elysia";

export const teacherSchema = t.Object({
  teacher_name: t.String(),
  teacher_email: t.String({ format: "email" }),
  teacher_phone: t.String(),
  teacher_password: t.String(),
  teacher_profile_image: t.String(),
});

<<<<<<< HEAD
export const UpdateTeacherSchema = t.Object({
  teacher_name: t.String() || t.Null,
  teacher_email: t.String({ format: "email" }) || t.Null,
  teacher_phone: t.String() || t.Null,
  teacher_password: t.String() || t.Null,
  teacher_profile_image: t.String() || t.Null,
});
=======

>>>>>>> 0ed46fc7131772b82bf9b2d0f8245c11e8e48351

export const LoginSchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String(),
});

export const RegisterSchema = t.Object({
  student_name: t.String(),
  student_email: t.String({ format: "email" }),
  student_phone: t.String(),
  student_password: t.String(),
  student_profile_image: t.String(),
});
