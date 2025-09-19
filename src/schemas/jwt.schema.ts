import { z } from "zod";

export const JWTPayloadSchema = z
  .object({
    id: z.string().length(24),
    role: z.string(),
    email: z.email(),
    iat: z.number(),
    exp: z.number()
  })
  .strict();

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
