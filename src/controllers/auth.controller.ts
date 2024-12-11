import { Hono } from "hono";
import { Bindings, Variables } from "hono/types";
import {
  decode as JwtDecode,
  sign as JwtSign,
  verify as JwtVerify,
} from "hono/jwt";
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

export const loginUser = factory.createHandlers(async (c) => {
  try {
    const body = await c.req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json({
        message: "Bad request",
        status: 400,
      });
    }

    const { email, password } = parseResult.data;

    const findUser = await prisma.user.findFirst({
      where: {
        email,
        password,
      },
    });

    if (!findUser) {
      return c.json({
        message: "User with email does not exist",
      });
    }

    const validatePassword = await bcrypt.compare(password, findUser.password);

    if (!validatePassword) {
      return c.json({
        message: "Invalid email or password",
        status: 401,
      });
    }

    const token = await JwtSign({ sub: email }, c.env.JWT_SECRET);

    return c.json({
      message: "User successfully logged in",
      token,
      status: 201,
    });
  } catch (error) {
    return c.json({
      status: 500,
      error: "Internal Server Error",
    });
  }
});

export const getUser = factory.createHandlers(async (c) => {
  try {
    const userId = parseInt(c.req.param("id"));

    const userExists = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        createdAt: true,
      }
    });

    if (!userExists) {
      return c.json({
        message: "User doesnt exist",
        status: 404,
      });
    }
    return c.json({
      message: "User found",
      data: userExists,
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
    const userId = parseInt(c.req.param("id"));
    if (isNaN(userId)) {
      return c.json({
        message: "Invalid user ID",
        status: 400,
      });
    }

    const body = await c.req.json();

    const findUser = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!findUser) {
      return c.json({
        message: "User does not exist",
        status: 404,
      });
    }

    const parseResult = userSchema.safeParse(body);
    if (!parseResult.success) {
      return c.json({
        message: "Bad Request",
        errors: parseResult.error.errors, 
        status: 400,
      });
    }

    const updateData = parseResult.data;

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData, 
    });

    return c.json({
      message: "User updated successfully",
      user: updatedUser,
      status: 200,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return c.json({
      error: "Internal Server Error",
      status: 500,
    });
  }
});

