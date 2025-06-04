export const authMiddleware = (app) =>
  app.derive(async ({ headers, jwt, set, path }) => {
    const authHeader = headers["authorization"];

    if (!authHeader) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = await jwt.verify(token);
      // console.log(payload);
      const role = payload.role;

      if (path.startsWith("/api/student") && !["student", "teacher"].includes(role)
      ) {
        throw new Error("Forbidden");
      }
      if (path.startsWith("/api/teacher") && !["teacher"].includes(role)) {
        throw new Error("Forbidden");
      }
      return {
        user: payload,
      };
    } catch (err: any) {
      if (err = "Forbidden") {
        set.status = 403;
        throw new Error(err);
      }

      set.status = 401;
      throw new Error("Invalid token");
    }
  });
