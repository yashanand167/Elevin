import { createFactory } from "hono/factory";
import { z } from "zod";
import { prisma } from "../db/db.connect";

const feedBackSchema = z.object({
  review: z.string().max(200, "Can't go more than 200 words"),
});

const factory = createFactory();

export const createFeedBack = factory.createHandlers(async (c) => {
  try {
    const userId = parseInt(c.req.param("id"));

    if (isNaN(userId)) {
      return c.json({
        message: "Invalid user ID",
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
        message: "User not found",
        status: 404,
      });
    }

    const body = await c.req.json();
    const parsedResult = feedBackSchema.safeParse(body);

    if (!parsedResult.success) {
      return c.json({
        message: "Invalid feedback data",
        errors: parsedResult.error.errors,
        status: 400,
      });
    }

    const { review } = parsedResult.data;

    const createfeedback = await prisma.feedBack.create({
      data: {
        review,
        userId,
      },
    });

    return c.json({
      message: "Feedback submitted successfully",
      data: createfeedback,
      status: 200,
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return c.json({
      error: "Internal Server Error",
      status: 500,
    });
  }
});

export const editFeedBack = factory.createHandlers(async (c) => {
  try {
    const feedBackId = parseInt(c.req.param("id"));

    if(isNaN(feedBackId)){
        return c.json({
            message: "Bad Request",
            status: 400
        })
    }

    const getFeedBack = await prisma.feedBack.findFirst({
        where:{
            id: feedBackId
        }
    })

    if(!getFeedBack){
        return c.json({
            message: "Not Found",
            status: 404
        })
    }

    const body = await c.req.json();

    const parsedResult = feedBackSchema.safeParse(body);

    if(!parsedResult.success){
        return c.json({
            message: "Bad Request",
            status: 400
        })
    }

    const {review} = parsedResult.data;

    const editReview = await prisma.feedBack.update({
        where: {
            id: feedBackId
        },
        data: {
            review
        }
    })

    return c.json({
        message: "FeedBack edited successfully",
        data: editReview,
        status: 200
    })
  } catch (error) {
    return c.json({
        status: 500,
        error: "Internal Server Error"
    })
  }
});

export const deleteFeedback = factory.createHandlers(async(c) => {
    try {
        
    } catch (error) {
        
    }
})