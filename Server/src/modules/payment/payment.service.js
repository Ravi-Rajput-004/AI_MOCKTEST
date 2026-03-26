/**
 * payment.service.js — Razorpay integration.
 *
 * Security notes:
 *  - Admin bypass is determined SERVER-SIDE only from DB — never from client input.
 *  - All payment verifications use HMAC-SHA256 signature validation.
 *  - Webhook uses raw body for signature verification.
 *  - Idempotency: duplicate payment/webhook events are safely ignored.
 */

import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { logger } from "../../config/logger.js";
import crypto from "crypto";

// ─── Plan config ───────────────────────────────────────────────────────────────

export const PLAN_PRICES = {
    PRO: 29900, // ₹299 in paise
    PREMIUM: 59900, // ₹599 in paise
    TEAM: 149900, // ₹1499 in paise
};

/** How long each paid plan stays active (ms) */
const PLAN_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const ADMIN_PLAN_DURATION_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

// ─── Razorpay singleton ────────────────────────────────────────────────────────

/** @type {import('razorpay').default | null} */
let razorpayInstance = null;

async function getRazorpay() {
    if (razorpayInstance) return razorpayInstance;
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        throw ApiError.internal("Razorpay credentials not configured");
    }
    const Razorpay = (await import("razorpay")).default;
    razorpayInstance = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
    });
    return razorpayInstance;
}

// ─── createOrder ──────────────────────────────────────────────────────────────

/**
 * Create a Razorpay order for a plan upgrade.
 * Admin users get their plan activated immediately — no payment required.
 * Admin status is ALWAYS read from the database, never from client input.
 */
export async function createOrder(userId, plan) {
    if (!PLAN_PRICES[plan]) {
        throw ApiError.badRequest(`Invalid plan: ${plan}`);
    }

    // Always fetch fresh from DB — never trust client-supplied role/admin fields
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            isAdmin: true,
            plan: true,
            email: true,
            name: true,
        },
    });

    if (!user) throw ApiError.notFound("User not found");

    // ── Admin bypass (server-side decision only) ────────────────────────────────
    if (user.isAdmin) {
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                plan,
                planExpiry: new Date(Date.now() + ADMIN_PLAN_DURATION_MS),
            },
            select: { id: true, plan: true, planExpiry: true },
        });

        logger.info({ userId, plan }, "Admin bypass — plan activated");

        return {
            adminBypass: true,
            user: updated,
            message: `${plan} plan activated for 1 year (admin account)`,
        };
    }

    // ── Regular user — create Razorpay order ───────────────────────────────────
    const amount = PLAN_PRICES[plan];
    const razorpay = await getRazorpay();

    const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `rcpt_${userId}_${Date.now()}`,
        notes: { userId, plan },
    });

    await prisma.payment.create({
        data: {
            userId,
            razorpayOrderId: order.id,
            amount,
            plan,
            status: "PENDING",
        },
    });

    logger.info({ userId, plan, orderId: order.id }, "Razorpay order created");

    return {
        adminBypass: false,
        orderId: order.id,
        amount,
        currency: "INR",
        plan,
        // keyId is public — safe to send to client
        keyId: env.RAZORPAY_KEY_ID,
    };
}

// ─── verifyPayment ────────────────────────────────────────────────────────────

/**
 * Verify Razorpay payment signature and activate the plan.
 * HMAC validation happens before any DB write.
 */
export async function verifyPayment({
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
}) {
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        throw ApiError.badRequest("Missing required payment fields");
    }

    // ── Signature verification ──────────────────────────────────────────────────
    const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(razorpay_signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    const signaturesMatch =
        sigBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(sigBuffer, expectedBuffer);

    if (!signaturesMatch) {
        logger.warn({ razorpay_order_id }, "Payment signature mismatch");
        throw ApiError.badRequest("Invalid payment signature");
    }

    // ── Fetch payment record ────────────────────────────────────────────────────
    const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
    });

    if (!payment) throw ApiError.notFound("Payment record not found");
    if (payment.status === "SUCCESS") return { alreadyProcessed: true }; // idempotent

    // ── Atomic update ───────────────────────────────────────────────────────────
    const [updatedPayment] = await prisma.$transaction([
        prisma.payment.update({
            where: { id: payment.id },
            data: {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: "SUCCESS",
                verifiedAt: new Date(),
            },
        }),
        prisma.user.update({
            where: { id: payment.userId },
            data: {
                plan: payment.plan,
                planExpiry: new Date(Date.now() + PLAN_DURATION_MS),
            },
        }),
    ]);

    logger.info(
        {
            userId: payment.userId,
            plan: payment.plan,
            paymentId: razorpay_payment_id,
        },
        "Payment verified — plan activated",
    );

    return updatedPayment;
}

// ─── handleWebhook ────────────────────────────────────────────────────────────

/**
 * Handle Razorpay webhook events.
 * Requires raw (unparsed) body for correct HMAC verification.
 * Acts as a backup in case the client-side verify call fails.
 */
export async function handleWebhook(rawBody, signature) {
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
        throw ApiError.internal("Webhook secret not configured");
    }

    // ── Signature verification ──────────────────────────────────────────────────
    const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody) // must be raw Buffer/string, NOT parsed JSON
        .digest("hex");

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    const signaturesMatch =
        sigBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(sigBuffer, expectedBuffer);

    if (!signaturesMatch) {
        logger.warn("Webhook signature mismatch");
        throw ApiError.badRequest("Invalid webhook signature");
    }

    const body =
        typeof rawBody === "string"
            ? JSON.parse(rawBody)
            : JSON.parse(rawBody.toString());
    const event = body.event;
    const payload = body.payload?.payment?.entity;

    logger.info({ event }, "Razorpay webhook received");

    // ── payment.captured ───────────────────────────────────────────────────────
    if (event === "payment.captured" && payload) {
        const payment = await prisma.payment.findFirst({
            where: { razorpayOrderId: payload.order_id },
        });

        if (!payment) {
            logger.warn(
                { orderId: payload.order_id },
                "Webhook: payment record not found",
            );
            return { received: true };
        }

        if (payment.status === "SUCCESS") {
            return { received: true }; // already processed — idempotent
        }

        await prisma.$transaction([
            prisma.payment.update({
                where: { id: payment.id },
                data: {
                    razorpayPaymentId: payload.id,
                    status: "SUCCESS",
                    verifiedAt: new Date(),
                },
            }),
            prisma.user.update({
                where: { id: payment.userId },
                data: {
                    plan: payment.plan,
                    planExpiry: new Date(Date.now() + PLAN_DURATION_MS),
                },
            }),
        ]);

        logger.info(
            { userId: payment.userId, plan: payment.plan },
            "Webhook: plan activated via payment.captured",
        );
    }

    // ── payment.failed ─────────────────────────────────────────────────────────
    if (event === "payment.failed" && payload) {
        await prisma.payment.updateMany({
            where: { razorpayOrderId: payload.order_id, status: "PENDING" },
            data: { status: "FAILED" },
        });
        logger.info(
            { orderId: payload.order_id },
            "Webhook: payment marked FAILED",
        );
    }

    return { received: true };
}

// ─── getSubscription ──────────────────────────────────────────────────────────

export async function getSubscription(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, planExpiry: true, isAdmin: true },
    });

    if (!user) throw ApiError.notFound("User not found");

    const now = new Date();
    const isActive =
        user.isAdmin ||
        user.plan === "FREE" ||
        (user.planExpiry ? new Date(user.planExpiry) > now : false);

    const daysRemaining =
        user.planExpiry && user.plan !== "FREE"
            ? Math.max(
                  0,
                  Math.ceil(
                      (new Date(user.planExpiry) - now) / (1000 * 60 * 60 * 24),
                  ),
              )
            : null;

    return {
        plan: user.plan,
        planExpiry: user.planExpiry,
        isActive,
        isAdmin: user.isAdmin,
        daysRemaining,
    };
}

// ─── getPaymentHistory ────────────────────────────────────────────────────────

export async function getPaymentHistory(userId) {
    return prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            plan: true,
            amount: true,
            status: true,
            razorpayPaymentId: true,
            razorpayOrderId: true,
            verifiedAt: true,
            createdAt: true,
        },
    });
}
