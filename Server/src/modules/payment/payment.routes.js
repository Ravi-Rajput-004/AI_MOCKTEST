/**
 * payment.routes.js
 *
 * IMPORTANT — Webhook route uses raw body middleware.
 * All other routes use standard JSON middleware (set globally).
 * The webhook route must be registered BEFORE any global json() middleware
 * that would parse the body, otherwise HMAC verification breaks.
 */

import express from "express";
import * as controller from "./payment.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

// ─── Webhook — raw body required for HMAC verification ────────────────────────
// No auth middleware — Razorpay calls this directly.
// Security is handled by HMAC signature verification inside the service.
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    // Store raw body so controller can pass it to service
    (req, _res, next) => {
        req.rawBody = req.body;
        next();
    },
    controller.handleWebhook,
);

// ─── Authenticated routes ─────────────────────────────────────────────────────
router.use(requireAuth); // All routes below require a valid JWT

router.post("/create-order", controller.createOrder);
router.post("/verify", controller.verifyPayment);
router.get("/subscription", controller.getSubscription);
router.get("/history", controller.getPaymentHistory);

export default router;
