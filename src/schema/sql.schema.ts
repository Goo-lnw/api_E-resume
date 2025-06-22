import { t } from "elysia";

export const teacherSchema = t.Object({
    teacher_name: t.String(),
    teacher_email: t.String({ format: "email" }),
    teacher_phone: t.String(),
    teacher_password: t.String(),
    teacher_profile_image: t.String(),
});

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

export const bodyCreateStudent = t.Object({
    student_email: t.String({ format: "email" }),
    student_password: t.String(),
    student_main_id: t.String(),
});
export const bodyCreateTeacher = t.Object({
    teacher_email: t.String({ format: "email" }),
    teacher_password: t.String(),
    // teacher_main_id: t.Optional(t.Union([t.String(), t.Null()])),
});
export const addWork_historySchema = t.Object({
    work_experience_company_name: t.Union([t.String(), t.Null()]),
    work_experience_position: t.Union([t.String(), t.Null()]),
    work_experience_start_date: t.Union([t.String(), t.Null()]),
    work_experience_end_date: t.Union([t.String(), t.Null()]),
    work_experience_description: t.Union([t.String(), t.Null()]),
    work_experience_highlight: t.Union([t.String(), t.Null()]),
});

export const addinternshipSchema = t.Object({
    internship_company_name: t.Union([t.String(), t.Null()]),
    internship_position: t.Union([t.String(), t.Null()]),
    internship_start_date: t.Union([t.String(), t.Null()]),
    internship_end_date: t.Union([t.String(), t.Null()]),
    internship_description: t.Union([t.String(), t.Null()]),
    internship_related_files: t.Union([t.String(), t.Null()]),
});

export const addProjectSchema = t.Object({
    project_name: t.Union([t.String(), t.Null()]),
    project_technology_used: t.Union([t.String(), t.Null()]),
    project_description: t.Union([t.String(), t.Null()]),
    project_impact: t.Union([t.String(), t.Null()]),
    project_attachment_link: t.Union([t.String(), t.Null()]),
});

export const addTraningSchema = t.Object({
    training_history_course_name: t.Union([t.String(), t.Null()]),
    training_history_organization: t.Union([t.String(), t.Null()]),
    training_history_location: t.Union([t.String(), t.Null()]),
    training_history_date: t.Union([t.String(), t.Null()]),
    training_history_certificate_file: t.Union([t.String(), t.Null()]),
});

export const addSoftSkillSchema = t.Object({
    soft_skill_name: t.Union([t.String(), t.Null()]),
    soft_skill_description: t.Union([t.String(), t.Null()]),
});

export const addSkillSchema = t.Object({
    skill_name: t.Union([t.String(), t.Null()]),
    skill_type: t.Union([t.String(), t.Null()]),
    skill_proficiency: t.Union([t.String(), t.Null()]),
});

export const addEducationHistorySchema = t.Object({
    education_history_institution: t.Union([t.String(), t.Null()]),
    education_history_major: t.Union([t.String(), t.Null()]),
    education_history_start_year: t.Union([t.String(), t.Null()]),
    education_history_gpa: t.Union([t.String(), t.Null()]),
    education_history_notes: t.Union([t.String(), t.Null()]),
});
export const activitySchema = t.Object({
    activity_name: t.Optional(t.Union([t.String(), t.Null()])),
    activity_description: t.Optional(t.Union([t.String(), t.Null()])),
    activity_organization: t.Optional(t.Union([t.String(), t.Null()])),
    activity_location: t.Optional(t.Union([t.String(), t.Null()])),
    activity_certificate_file: t.Optional(
        t.Union([t.Null(), t.String(), t.File({ type: "image/*" }), t.File({ type: "application/*" })])
    ),
    activity_start_date: t.Optional(t.Union([t.String(), t.Null()])),
    activity_end_date: t.Optional(t.Union([t.String(), t.Null()])),
});

export const activityAssignSchema = t.Object({
    activity_id: t.Number(),
    resume_id: t.Array(t.Number()),
});
export const deleteActivityOfStudentSchema = t.Object({
    resume_id: t.Array(t.Number()),
});
