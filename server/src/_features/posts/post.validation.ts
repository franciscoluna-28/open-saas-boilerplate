import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().min(1, "Post cannot be empty").max(500, "Post cannot exceed 500 characters"),
});

export const updatePostSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1, "Post cannot be empty").max(500, "Post cannot exceed 500 characters"),
});

export const deletePostSchema = z.object({
  id: z.string().min(1),
});
