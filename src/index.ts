import { Hono } from "hono";
import { Bindings, Variables } from "hono/types";
import { cors } from "hono/cors";
import userRoutes from "./routers/user.route";
import { feedBackRoutes } from "./routers/feedBack.route";
import { limiter } from "./validators/index";

const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

app.use("*", cors());
app.use("*", limiter);

app.get("/", (c) => {
  return c.json({
    message: "Hello World!",
  });
});
app.route("/api/v1/users", userRoutes);
app.route("/api/v1/feedbacks", feedBackRoutes);

export default app;
