import { Elysia } from "elysia";
import { imageController } from "../controllers/image.controller";

export const imageRoute = (app: Elysia) =>
    app.group("/image", (app) =>
        app
            .get("/:filename", imageController.getImageByFilename)
            .post("", imageController.uploadImages)
    );
