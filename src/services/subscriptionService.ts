/**
 * Subscription Service — Single Premium Plan ($1.99/mo)
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
  // Mock payment processing
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_plan: "premium",
      subscription_status: "premium",
      is_premium: true,
      trial_end_date: null,
    })
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Cancel / downgrade to free.
 */
export async function cancelSubscription(userId: string): Promise<PurchaseResult> {
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_plan: "free",
      subscription_status: "free",
      is_premium: false,
    })
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
