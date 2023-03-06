import { z } from "zod";

const RegisterValidator = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(20),
  image: z.string().optional(),
});

export default RegisterValidator;
