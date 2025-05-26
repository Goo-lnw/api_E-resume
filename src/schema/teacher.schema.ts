import { t } from 'elysia';

export const teacherSchema = t.Object({
    teacher_name: t.String(),
    teacher_email: t.String({ format: 'email' }),
    teacher_phone: t.String(),
    teacher_password: t.String(),
    teacher_profile_image: t.String()
});