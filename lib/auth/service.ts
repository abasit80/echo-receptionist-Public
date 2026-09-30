import { z } from "zod";
import { authenticateUser, createUser } from "@/lib/auth/users";

export const signupSchema = z
  .object({
    name: z.string().min(2, "Enter your full name."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function registerAccount(input: z.infer<typeof signupSchema>) {
  const user = await createUser({
    name: input.name,
    email: input.email,
    password: input.password,
  });
  return { id: user.id, email: user.email, name: user.name };
}

export async function loginAccount(input: z.infer<typeof loginSchema>) {
  const user = await authenticateUser(input.email, input.password);
  if (!user) {
    throw new Error("Invalid email or password.");
  }
  return { id: user.id, email: user.email, name: user.name };
}
