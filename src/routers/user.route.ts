import { Hono } from "hono";
import { Bindings, Variables } from "hono/types";
import { createUser, getUser, updateUser } from "../controllers/index";

export const userRouter = new Hono<{
  Bindings: Bindings;
  Variable: Variables;
}>();

userRouter.post("/registerUser", ...createUser);
userRouter.get("/getUser/:id", ...getUser);
userRouter.put("/updateUser/:id", ...updateUser);
