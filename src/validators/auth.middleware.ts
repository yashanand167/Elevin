import { jwt } from "hono/jwt";
import { createFactory } from "hono/factory";

const factory = createFactory();

export const authMiddleware = factory.createMiddleware(async (c) => {
    
});
