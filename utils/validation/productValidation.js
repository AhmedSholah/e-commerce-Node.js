const { z } = require("zod");

const objectIdSchema = z.string();
// .refine((val) => {
//     return /^[0-9a-fA-F]{24}$/.test(val);
// });

const addProductSchema = z
    .object({
        name: z.string().min(3),
        price: z.number().min(0),
        category: objectIdSchema,
        description: z.string().min(100).max(500),
        stock: z.number().min(0),
        weight: z.number().min(0),
        dimensions: z.object({
            length: z.number().min(0),
            width: z.number().min(0),
            height: z.number().min(0),
        }),
        shippingInfo: z.object({
            shippingCost: z.number().min(0),
            estimatedDelivery: z.number().min(0),
        }),
    })
    .strict();

const updateProductSchema = z
    .object({
        name: z.string().min(3).optional(),
        price: z.number().min(0).optional(),
        category: objectIdSchema.optional(),
        description: z.string().min(100).max(500).optional(),
        stock: z.number().min(0).optional(),
        weight: z.number().min(0).optional(),
        dimensions: z
            .object({
                length: z.number().min(0).optional(),
                width: z.number().min(0).optional(),
                height: z.number().min(0).optional(),
            })
            .optional(),
        shippingInfo: z
            .object({
                shippingCost: z.number().min(0).optional(),
                estimatedDelivery: z.number().min(0).optional(),
            })
            .optional(),
    })
    .strict();

module.exports = { addProductSchema, updateProductSchema };
