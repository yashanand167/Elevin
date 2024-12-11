import { Hono } from "hono";
import { Bindings, Variables } from "hono/types";
import { createUser, getUser, loginUser, updateUser } from "../controllers/index";
import { authMiddleware } from "../validators";

const userRoutes = new Hono<{
  Bindings: Bindings;
  Variable: Variables;
}>();

userRoutes.post("/registerUser",...createUser);
userRoutes.post("/login",authMiddleware,...loginUser);
userRoutes.get("/search/:id",...getUser);
userRoutes.patch("/update/:id",...updateUser);

export default userRoutes;
