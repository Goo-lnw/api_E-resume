import Elysia from "elysia";
import { notificationController } from "../controllers/notification.controller";

export const notificationRoute = (app: Elysia) =>
    app.group("/noti", (app) =>
        app
            .get("", notificationController.getNotification)
            .put("/read", notificationController.readNotification)
    );

// export default notificationRoute;