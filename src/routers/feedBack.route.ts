import { Hono } from "hono";
import { Bindings, Variables } from "hono/types";
import { createFeedBack } from "../controllers/index";

export const feedBackRoutes = new Hono<{
  Bindings: Bindings;
  Variable: Variables;
}>();

feedBackRoutes.post("/addFeedBack/:id", ...createFeedBack);
