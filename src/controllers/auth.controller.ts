import { Hono } from "hono";
import { Bindings, Variables } from "hono/types";
import { jwt } from "hono/jwt";
import * as bcrypt from "bcryptjs";
import { createFactory } from "hono/factory";
import { z } from "zod";
import { prisma } from "../db/db.connect";

const factory = createFactory();

const registerSchemaMethod = z.object({
  name: z.string().min(3, "Name must be at-least 3 letters long"),
  email: z.string().email(),
  password: z
    .string()
    .min(10, "Password must be atleast 10 characters long")
    .max(25),
  age: z.number(),
  gender: z.enum(["Male", "Female"]).optional(),
});

export const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createUser = factory.createHandlers(async (c) => {
  try {
    const body = await c.req.json();
    const parseResult = registerSchemaMethod.safeParse(body);

    if (!parseResult.success) {
      return c.json({
        message: "Bad request",
        status: 400,
      });
    }

    const { name, email, password, age, gender } = parseResult.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        name,
      },
    });

    if (existingUser) {
      return c.json({
        message: "User with email and name already exist",
        status: 409,
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const createUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        age,
        gender,
      },
    });

    return c.json({
      message: "User created successfully",
      createUser,
      status: 200,
    });
  } catch (error) {
    return c.json({
      message: "Internal Server Error",
      status: 500,
    });
  }
});

export const getUser = factory.createHandlers(async (c) => {
  try {
    const userId = parseInt(c.req.param("id"));

    const findUser = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!findUser) {
      return c.json({
        message: "User doesnt exist",
        status: 404,
      });
    }
    return c.json({
      message: "User found",
      findUser,
      status: 200,
    });
  } catch (error) {
    return c.json({
      message: "Internal Server Error",
      status: 500,
    });
  }
});

export const updateUser = factory.createHandlers(async (c) => {
  try {
    const body = c.req.json();
    const userId = parseInt(c.req.param("id"));

    const parseResult = userSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json({
        message: "Bad Request",
        status: 400,
      });
    }

    const findUser = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!findUser) {
      return c.json({
        message: "User doesnt exist",
        status: 404,
      });
    }
    const { name, age } = parseResult.data;
    const updateUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name,
        age: age,
      },
    });

    return c.json({
      message: "User updated successfully",
      updateUser,
      status: 200,
    });
  } catch (error) {
    return c.json({
      message: "Internal Server Error",
      status: 500,
    });
  }
});
