import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getEmailContent(language: string, name: string) {
  if (language === "ka") {
    return {
      subject: "მოგესალმები Astrochat-ში! ✨",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e;">
          <p style="font-size: 16px; margin-bottom: 16px;">გამარჯობა ${name},</p>
          <p style="font-size: 16px; margin-bottom: 16px;">მოხარული ვართ, რომ შეგვიერთდი! 🌟<br/>
          Astrochat-ი დაგეხმარება შენი კოსმიური ბედისწერის აღმოჩენაში.</p>
          <p style="font-size: 16px; margin-bottom: 8px;">დაიწყე ახლავე</p>
          <p style="font-size: 16px;">👉 <a href="https://astrochat.ge" style="color: #7c3aed; text-decoration: underline;">astrochat.ge</a></p>
        </div>
      `,
    };
  }

  return {
    subject: "Welcome to Astrochat! ✨",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e;">
        <p style="font-size: 16px; margin-bottom: 16px;">Hi ${name},</p>
        <p style="font-size: 16px; margin-bottom: 16px;">Welcome to Astrochat! 🌟<br/>
        Your cosmic journey starts now.</p>
        <p style="font-size: 16px; margin-bottom: 8px;">Get started here:</p>
        <p style="font-size: 16px;">👉 <a href="https://astrochat.ge" style="color: #7c3aed; text-decoration: underline;">astrochat.ge</a></p>
      </div>
    `,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, language } = await req.json();

    // Always use the verified email from the authenticated user — never trust request body
    const email = user.email;
    if (!email) {
      return new Response(JSON.stringify({ error: "No email on account" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userName = name || email.split("@")[0] || "there";
    const userLang = language || "en";

    const { subject, html } = getEmailContent(userLang, userName);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Astrochat <noreply@astrochat.ge>",
        to: [email],
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
      throw new Error(`Resend API failed [${resendRes.status}]: ${err}`);
    }

    const data = await resendRes.json();
    console.log("[WelcomeEmail] Sent to:", email, "lang:", userLang, "id:", data.id);

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Welcome email error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
