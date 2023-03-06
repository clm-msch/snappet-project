import { z } from "zod";

const TagsValidator = z.object({
  title: z.string().min(3).max(255),
});

export default TagsValidator;