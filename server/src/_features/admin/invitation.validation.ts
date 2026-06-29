import { z } from "zod";
import { userRoles } from "@/_database/schema/auth-schema";

export const inviteSchema = z.object({
  email: z.email("Invalid email"),
  role: z.enum(userRoles).default("admin"),
});

export type InviteInput = z.infer<typeof inviteSchema>;

export const acceptInviteSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
