import { z } from "zod";

const LoginValidator = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(20),
});

export default LoginValidator;
