const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post(
    "/",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        const sig = req.headers["stripe-signature"];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(
                "⚠️  Webhook signature verification failed:",
                err.message
            );
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // ✅ Handle Stripe events
        switch (event.type) {
            case "payment_intent.succeeded":
                const paymentIntent = event.data.object;
                console.log(
                    "✅ PaymentIntent was successful!",
                    paymentIntent.id
                );
                break;

            case "payment_method.attached":
                const paymentMethod = event.data.object;
                console.log("✅ PaymentMethod attached:", paymentMethod.id);
                break;

            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    }
);

module.exports = router;
