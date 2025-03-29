const router = require("express").Router();
const express = require("express");

router
    .route("/")
    .post(express.raw({ type: "application/json" }), async (req, res) => {
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
                `⚠️  Webhook signature verification failed.`,
                err.message
            );
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case "payment_intent.succeeded":
                const paymentIntent = event.data.object;
                console.log("PaymentIntent was successful!");
                break;
            case "payment_method.attached":
                const paymentMethod = event.data.object;
                console.log("PaymentMethod was attached to a Customer!");
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        res.json({ received: true });
    });

module.exports = router;
