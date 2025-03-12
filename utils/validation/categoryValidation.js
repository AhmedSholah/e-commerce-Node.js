const { z } = require("zod");

const categorySchema = z
    .object({
        name: z.string().min(3).max(32),
        // image: z.string(),
    })
    .strict();

module.exports = { categorySchema };
