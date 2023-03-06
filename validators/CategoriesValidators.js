import { z } from "zod";

const CategoriesValidator = z.object({
  title: z.string().min(3).max(255),
});

export default CategoriesValidator;
