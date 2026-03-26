/**
 * payment.controller.js — HTTP layer for payment endpoints.
 * Thin controller — all logic lives in payment.service.js.
 */

import * as paymentService from "./payment.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { logger } from "../../config/logger.js";

// ─── POST /api/v1/payment/create-order ────────────────────────────────────────

export async function createOrder(req, res, next) {
    try {
        const userId = req.user.id; // set by auth middleware
        const { plan } = req.body;

        if (!plan) {
            throw ApiError.badRequest("Plan is required");
        }

        const result = await paymentService.createOrder(
            userId,
            plan.toUpperCase(),
        );
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

// ─── POST /api/v1/payment/verify ─────────────────────────────────────────────

export async function verifyPayment(req, res, next) {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
            req.body;

        // Security: adminBypass field from client is IGNORED here.
        // Admin bypass is decided in createOrder based on DB role — never on client input.
        const result = await paymentService.verifyPayment({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
        });

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

// ─── POST /api/v1/payment/webhook ─────────────────────────────────────────────

export async function handleWebhook(req, res, next) {
    try {
        // req.rawBody is set by express raw body middleware on this route
        const signature = req.headers["x-razorpay-signature"];

        if (!signature) {
            throw ApiError.badRequest("Missing webhook signature header");
        }

        const result = await paymentService.handleWebhook(
            req.rawBody,
            signature,
        );
        res.status(200).json(result);
    } catch (err) {
        // Always return 200 to Razorpay — otherwise it keeps retrying
        logger.error({ err }, "Webhook processing failed");
        res.status(200).json({ received: true, error: err.message });
    }
}

// ─── GET /api/v1/payment/subscription ────────────────────────────────────────

export async function getSubscription(req, res, next) {
    try {
        const result = await paymentService.getSubscription(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

// ─── GET /api/v1/payment/history ─────────────────────────────────────────────

export async function getPaymentHistory(req, res, next) {
    try {
        const result = await paymentService.getPaymentHistory(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}
