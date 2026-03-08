/**
 * Auth Service
 * 
 * Handles auth-related side effects like welcome emails.
 */

/**
 * Send a welcome email after signup.
 * 
 * Currently a placeholder — replace with actual email trigger
 * (e.g., Supabase Auth "Welcome" template or edge function).
 */
export async function sendWelcomeEmail(email: string): Promise<void> {
  console.log(`[AuthService] Welcome email triggered for: ${email}`);
  // TODO: Replace with actual welcome email logic
  // Options:
  // 1. Call a Supabase edge function that sends a branded welcome email
  // 2. Use Supabase Auth's built-in "Welcome" template (requires dashboard config)
  // 3. Integrate with a transactional email service
}
