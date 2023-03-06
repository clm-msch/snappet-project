import { z } from "zod";

const SnippetsValidator = z.object({
  title: z.string().min(2).max(20),
  content: z.string().min(4).max(255),
  category_id: z.number().min(1),
  tags_id: z.array(z.number().min(1)),
});

export default SnippetsValidator;

