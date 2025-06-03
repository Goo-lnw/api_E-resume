import { getPagination } from "../services/pagination.service";
import { getUserByEmail } from "../services/user.service";
import { pool } from "../utils/db";
import { z } from "zod/v4";

export const teacherController = {
    testTeacherController: async () => {
        console.log("access");
    },
};
