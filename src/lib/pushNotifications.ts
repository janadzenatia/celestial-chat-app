import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

/**
 * Register for FCM push notifications and persist token to profiles.
 * Safe to call repeatedly — only does work on native platforms.
 */
export async function initPushNotifications(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    // Request permission
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") {
      console.log("[push] Permission not granted:", perm.receive);
      return;
    }

    // Detect IANA timezone for delivery scheduling
    let timezone: string | null = null;
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch {}

    const platform = Capacitor.getPlatform(); // 'ios' | 'android'

    // Save token whenever it's issued / refreshed
    PushNotifications.addListener("registration", async (token) => {
      console.log("[push] FCM token received");
      try {
        const updates: Record<string, unknown> = {
          fcm_token: token.value,
          fcm_platform: platform,
          fcm_token_updated_at: new Date().toISOString(),
        };
        if (timezone) updates.timezone = timezone;

        await supabase
          .from("profiles")
          .update(updates as any)
          .eq("user_id", userId);
      } catch (e) {
        console.error("[push] Failed to persist FCM token:", e);
      }
    });

    PushNotifications.addListener("registrationError", (err) => {
      console.error("[push] Registration error:", err);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("[push] Received in foreground:", notification);
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      console.log("[push] Tapped:", action.notification);
      // Default behavior: app opens to current route. Deep linking can be added here.
    });

    await PushNotifications.register();
  } catch (e) {
    console.error("[push] init failed:", e);
  }
}
