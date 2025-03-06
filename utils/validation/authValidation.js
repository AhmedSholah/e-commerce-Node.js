const { z } = require("zod");

const loginSchema = z
    .object({
        email: z.string().email(),
        password: z.string().min(6),
    })
    .strict();

const registerSchema = z
    .object({
        username: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6),
        gender: z.enum(["male", "female"]),
        role: z.enum(["client", "seller"]),
    })
    .strict();

module.exports = { loginSchema, registerSchema };
