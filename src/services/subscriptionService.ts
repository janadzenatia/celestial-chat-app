/**
 * Subscription Service
 * 
 * Currently uses mock payment logic with direct Supabase updates.
 * When migrating to mobile (RevenueCat + Capacitor), replace the
 * `purchaseSubscription` implementation with RevenueCat SDK calls.
 * The rest of the app (PaywallModal, etc.) won't need changes.
 */

import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = "basic_premium" | "pro_premium";

export interface PurchaseResult {
  success: boolean;
  error?: string;
}

/**
 * Process a subscription purchase.
 * 
 * MOCK: Simulates a 2-second payment delay, then writes directly to Supabase.
 * TODO: Replace internals with RevenueCat SDK calls for native mobile.
 */
export async function purchaseSubscription(
  userId: string,
  plan: SubscriptionPlan
): Promise<PurchaseResult> {
  // --- Mock payment processing ---
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_plan: plan,
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
 * 
 * TODO: Replace with RevenueCat cancellation for native mobile.
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
