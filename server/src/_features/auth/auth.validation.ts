import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signInSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.string().optional().transform((v) => v === "on"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const claimAdminSchema = z.object({
  adminToken: z.string().min(1, "Admin token is required"),
});

export type ClaimAdminInput = z.infer<typeof claimAdminSchema>;
