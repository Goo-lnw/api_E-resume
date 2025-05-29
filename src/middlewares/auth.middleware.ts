export const authMiddleware = (app) =>
  app.derive(async ({ headers, jwt, set }) => {
    const authHeader = headers["authorization"];

    if (!authHeader) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = await jwt.verify(token);
      return {
        user: payload,
      };
    } catch {
      set.status = 401;
      throw new Error("Invalid token");
    }
  });
