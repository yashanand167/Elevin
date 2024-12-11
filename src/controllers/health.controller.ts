import { Hono } from "hono";
import { prisma } from "../db/db.connect";
import { User } from "@prisma/client";
import { createFactory } from "hono/factory";
import { z } from "zod";
import { userSchema } from "./auth.controller";

const factory = createFactory();

const HealthSchema = z.object({
  weight: z.number().positive(),
  heartRate: z.number(),
  sleepHours: z.number(),
  steps: z.number(),
  calories: z.number(),
  bloodPressure: z.number(),
  mood: z.enum(["Happy", "Sad", "Depressed", "Angry", "Anxious"]).optional(),
});

export const HealthData = factory.createHandlers(async (c) => {
  try {
    
    const body = await c.req.json();
    const parsedResult = HealthSchema.safeParse(body);

    if (!parsedResult.success) {
      return c.json({
        message: "Invalid Request",
        errors: parsedResult.error.errors,
        status: 400,
      });
    }

    const userId = parseInt(c.req.param("id"));

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

    // Access parsed data
    const {
      weight,
      heartRate,
      sleepHours,
      steps,
      calories,
      bloodPressure,
      mood,
    } = parsedResult.data;
    const newHealthData = await prisma.health.create({
      data: {
        userId,
        weight,
        heartRate,
        sleepHours,
        steps,
        calories,
        mood,
      },
    });

    return c.json({
      message: "Health data saved successfully",
      data: newHealthData,
      status: 200,
    });
  } catch (error) {
    console.error("Error saving health data:", error);
    return c.json({
      message: "Internal Server Error",
      status: 500,
    });
  }
});

