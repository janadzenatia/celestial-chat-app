/**
 * Auth Service
 * 
 * Handles auth-related side effects like welcome emails.
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Send a welcome email after signup via the send-welcome-email edge function.
 */
export async function sendWelcomeEmail(
  email: string,
  name?: string,
  language?: string
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("send-welcome-email", {
      body: { email, name, language },
    });
    if (error) {
      console.error("[AuthService] Welcome email error:", error);
    } else {
      console.log("[AuthService] Welcome email sent to:", email);
    }
  } catch (err) {
    console.error("[AuthService] Welcome email failed:", err);
  }
}
