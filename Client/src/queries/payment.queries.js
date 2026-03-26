/**
 * payment.queries.js — TanStack Query hooks for payment flow.
 *
 * Security note:
 *  - useVerifyPayment only sends Razorpay's response fields to the server.
 *  - adminBypass field is NEVER sent — admin status is determined server-side.
 *  - After admin bypass (createOrder returns adminBypass:true), we only
 *    invalidate queries to refresh the user's plan — no verify call needed.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios.js";
import toast from "react-hot-toast";

// ─── useCreateOrder ───────────────────────────────────────────────────────────

export function useCreateOrder() {
    return useMutation({
        mutationFn: async ({ plan }) => {
            const { data } = await axios.post("/api/v1/payment/create-order", {
                plan,
            });
            return data.data;
        },
        onError: (error) => {
            const msg =
                error.response?.data?.message || "Failed to initialise payment";
            toast.error(msg);
        },
    });
}

// ─── useVerifyPayment ─────────────────────────────────────────────────────────

export function useVerifyPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
        }) => {
            // Only send the three Razorpay fields — nothing else
            const { data } = await axios.post("/api/v1/payment/verify", {
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
            });
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
            queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
            queryClient.invalidateQueries({
                queryKey: ["payment", "subscription"],
            });
            toast.success("Payment successful! Plan upgraded 🎉");
        },
        onError: (error) => {
            const msg =
                error.response?.data?.message || "Payment verification failed";
            toast.error(msg);
        },
    });
}

// ─── useRefreshUserAfterAdminBypass ──────────────────────────────────────────

/**
 * After admin bypass, no payment verification is needed.
 * Just refresh user data so the UI reflects the new plan.
 */
export function useRefreshUserPlan() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
        queryClient.invalidateQueries({
            queryKey: ["payment", "subscription"],
        });
    };
}

// ─── useSubscription ──────────────────────────────────────────────────────────

export function useSubscription() {
    return useQuery({
        queryKey: ["payment", "subscription"],
        queryFn: async () => {
            const { data } = await axios.get("/api/v1/payment/subscription");
            return data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// ─── usePaymentHistory ────────────────────────────────────────────────────────

export function usePaymentHistory() {
    return useQuery({
        queryKey: ["payment", "history"],
        queryFn: async () => {
            const { data } = await axios.get("/api/v1/payment/history");
            return data.data;
        },
        staleTime: 60 * 1000, // 1 minute
    });
}
