/**
 * Pricing.jsx — Plan selection and Razorpay payment flow.
 *
 * Flow:
 *  1. User clicks Upgrade
 *  2. createOrder API call → server returns orderId + amount (or adminBypass)
 *  3a. Admin bypass → refresh user queries, show success toast, navigate
 *  3b. Regular user → open Razorpay popup
 *  4. On Razorpay success → verifyPayment API call → navigate to dashboard
 */

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Check, Loader2, CreditCard, Zap } from "lucide-react";
import { useUserStore } from "../store/userStore.js";
import {
    useCreateOrder,
    useVerifyPayment,
    useRefreshUserPlan,
} from "../queries/payment.queries.js";
import { PLANS } from "../lib/constants.jsx";
import {
    pageVariants,
    staggerContainer,
    staggerItem,
} from "../animations/variants.js";
import toast from "react-hot-toast";

// ─── Razorpay script loader ───────────────────────────────────────────────────

function useRazorpayScript() {
    const loaded = useRef(false);

    useEffect(() => {
        if (loaded.current || document.getElementById("razorpay-script"))
            return;

        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
            loaded.current = true;
        };
        script.onerror = () => console.error("Failed to load Razorpay SDK");
        document.body.appendChild(script);

        return () => {
            // Do NOT remove on unmount — other pages may need it
        };
    }, []);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Pricing() {
    const { user } = useUserStore();
    const navigate = useNavigate();
    const createOrder = useCreateOrder();
    const verifyPayment = useVerifyPayment();
    const refreshUserPlan = useRefreshUserPlan();

    useRazorpayScript();

    const handleUpgrade = (planName) => {
        if (!user) {
            toast.error("Please login to upgrade your plan");
            navigate("/login");
            return;
        }

        if (user.plan === planName) {
            toast("You are already on this plan", { icon: "ℹ️" });
            return;
        }

        createOrder.mutate(
            { plan: planName },
            {
                onSuccess: (data) => {
                    // ── Admin bypass — no payment needed ──────────────────────────────────
                    if (data.adminBypass) {
                        toast.success(
                            data.message || "Plan activated successfully!",
                        );
                        refreshUserPlan(); // refresh user data, no verify API call
                        navigate("/dashboard");
                        return;
                    }

                    // ── Regular user — open Razorpay popup ────────────────────────────────
                    if (!window.Razorpay) {
                        toast.error(
                            "Payment SDK not loaded. Please refresh and try again.",
                        );
                        return;
                    }

                    const options = {
                        // keyId is returned from server — never hardcode in frontend
                        key: data.keyId,
                        amount: data.amount,
                        currency: data.currency,
                        name: "MockPrep AI",
                        description: `Upgrade to ${planName} Plan`,
                        order_id: data.orderId,

                        handler: function (response) {
                            // Only send Razorpay's three fields — nothing else
                            verifyPayment.mutate(
                                {
                                    razorpay_payment_id:
                                        response.razorpay_payment_id,
                                    razorpay_order_id:
                                        response.razorpay_order_id,
                                    razorpay_signature:
                                        response.razorpay_signature,
                                },
                                {
                                    onSuccess: () => navigate("/dashboard"),
                                },
                            );
                        },

                        prefill: {
                            name: user.name || "",
                            email: user.email || "",
                        },

                        theme: { color: "#6366F1" },

                        modal: {
                            ondismiss: () => {
                                toast("Payment cancelled", { icon: "ℹ️" });
                            },
                        },
                    };

                    const rzp = new window.Razorpay(options);

                    rzp.on("payment.failed", function (response) {
                        toast.error(
                            response.error?.description ||
                                "Payment failed. Please try again.",
                        );
                    });

                    rzp.open();
                },
            },
        );
    };

    return (
        <Motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen pt-24 pb-20 px-4"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <Motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl font-bold mb-4"
                    >
                        Simple, Transparent{" "}
                        <span className="gradient-text">Pricing</span>
                    </Motion.h1>
                    <Motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-text-muted text-lg"
                    >
                        Choose the perfect plan to accelerate your interview
                        preparation and land your dream job.
                    </Motion.p>
                </div>

                {/* Plan cards */}
                <Motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {PLANS.map((plan) => {
                        const isCurrentPlan = user?.plan === plan.name;
                        const isPopular = plan.popular;
                        const isPending =
                            createOrder.isPending &&
                            createOrder.variables?.plan === plan.name;

                        return (
                            <Motion.div
                                key={plan.name}
                                variants={staggerItem}
                                className={`relative bg-bg-card rounded-2xl flex flex-col p-6 transition-all ${
                                    isPopular
                                        ? "border-2 border-primary shadow-glow"
                                        : "border border-border hover:border-border-light"
                                }`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider btn-glow">
                                        Most Popular
                                    </div>
                                )}

                                {/* Plan details */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold mb-2">
                                        {plan.label}
                                    </h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold">
                                            ₹{Math.floor(plan.price)}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className="text-sm text-text-muted">
                                                /month
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="flex-1">
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-3"
                                            >
                                                <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                                                <span className="text-sm text-text-secondary">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CTA */}
                                <div className="mt-auto">
                                    {isCurrentPlan ? (
                                        <button
                                            disabled
                                            className="w-full py-3 rounded-xl bg-bg-elevated border border-border text-text-muted font-semibold text-sm flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-4 h-4" />{" "}
                                            Current Plan
                                        </button>
                                    ) : plan.name === "FREE" ? (
                                        <button
                                            onClick={() => navigate("/setup")}
                                            className="w-full py-3 rounded-xl border border-border hover:bg-bg-elevated font-semibold text-sm transition-colors text-text-primary"
                                        >
                                            Start Practicing
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                handleUpgrade(plan.name)
                                            }
                                            disabled={
                                                isPending ||
                                                verifyPayment.isPending
                                            }
                                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                                                isPopular
                                                    ? "bg-primary hover:bg-primary-hover text-white btn-glow"
                                                    : "bg-bg-elevated hover:bg-bg-surface text-text-primary border border-border"
                                            }`}
                                        >
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Processing…
                                                </>
                                            ) : verifyPayment.isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Verifying…
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4" />
                                                    Upgrade to {plan.label}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </Motion.div>
                        );
                    })}
                </Motion.div>

                {/* Trust badges */}
                <div className="mt-12 flex flex-wrap justify-center gap-6 text-text-muted text-sm">
                    <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" /> Instant
                        activation
                    </span>
                    <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" /> Secured by
                        Razorpay
                    </span>
                    <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" /> Cancel
                        anytime
                    </span>
                </div>
            </div>
        </Motion.div>
    );
}
