import { Hono } from "hono";
import { Bindings, Variables } from "hono/types";
import { HealthData } from "../controllers/index";

export const healthrouter = new Hono<{
  Bindings: Bindings;
  Variable: Variables;
}>();

healthrouter.post("/healthdata", ...HealthData);
