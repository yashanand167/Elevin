import { Hono } from "hono";
import { Bindings, Variables } from "hono/types";
import { jwt, verify as JwtVerify } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";
import { createFactory } from "hono/factory";

const factory = createFactory();

export const userRouter = new Hono<{
  Bindings: Bindings;
  Variable: JwtVariables;
}>();

export const authMiddleware = factory.createMiddleware(async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization")?.replace('Bearer','').trim();

    if (!authHeader) {
      return c.json({
        message: "No Authorization token provided",
        status: 401,
      });
    }

    const payload = await JwtVerify(authHeader, c.env.JWT_SECRET);

    c.set("user", payload);

    next();
  } catch (error) {
    return c.json({
        error: "Internal Server Error",
        status: 500
    })
  }
});
