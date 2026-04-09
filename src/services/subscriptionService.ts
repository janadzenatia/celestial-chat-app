/**
 * Subscription Service — Single Premium Plan ($2.99/mo)
 * All subscription changes go through the server-side edge function.
 */

import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = "premium";

export interface PurchaseResult {
  success: boolean;
  error?: string;
}

/**
 * Process a subscription purchase (single premium plan).
 */
export async function purchaseSubscription(
  userId: string,
  _plan: string = "premium"
): Promise<PurchaseResult> {
  // Mock payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const { data, error } = await supabase.functions.invoke("manage-subscription", {
    body: { action: "activate" },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data?.error) {
    return { success: false, error: data.error };
  }

  return { success: true };
}

/**
 * Cancel / downgrade to free.
 */
export async function cancelSubscription(userId: string): Promise<PurchaseResult> {
  const { data, error } = await supabase.functions.invoke("manage-subscription", {
    body: { action: "cancel" },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data?.error) {
    return { success: false, error: data.error };
  }

  return { success: true };
}
