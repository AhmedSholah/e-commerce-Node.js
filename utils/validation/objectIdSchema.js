const { z } = require("zod");

const objectIdSchema = z.string().refine((val) => {
    return /^[0-9a-fA-F]{24}$/.test(val);
});

module.exports = objectIdSchema;
