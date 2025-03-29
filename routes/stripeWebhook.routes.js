const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Use express.raw() middleware for the webhook route
router.post(
    "/",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        const sig = req.headers["stripe-signature"];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                endpointSecret
            );
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }

        // Handle the checkout.session.completed event
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            console.log(session);

            try {
                // Update your order status in database
                // Access session.metadata for any custom data you passed
                // Example: const orderId = session.metadata.orderId;

                // Add your order fulfillment logic here

                return res.json({ received: true });
            } catch (err) {
                return res
                    .status(500)
                    .json({ error: "Failed to process order" });
            }
        }

        // Return 200 for unhandled events
        res.json({ received: true });
    }
);

module.exports = router;
