// export const authMiddleware = (app) =>
//   app.onBeforeHandle(async ({ headers, jwt, set }) => {
//     const authHeader = headers["authorization"];

//     if (!authHeader) {
//       set.status = 401;
//       return { error: "Unauthorized" };
//     }

//     const token = authHeader.split(" ")[1];

//     try {
//       const payload = await jwt.verify(token);
//       return { user: payload };
//     } catch {
//       set.status = 401;
//       return { error: "Invalid token" };
//     }
//   });
