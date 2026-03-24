import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, MailX } from "lucide-react";

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();
        if (res.ok && data.valid === true) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      } catch {
        setStatus("invalid");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      setStatus(data?.success ? "success" : "error");
    } catch {
      setStatus("error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="glass rounded-2xl p-8 w-full max-w-sm text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
            <p className="text-muted-foreground">Verifying...</p>
          </>
        )}

        {status === "valid" && (
          <>
            <MailX className="w-10 h-10 text-primary mx-auto" />
            <h1 className="font-serif text-xl text-foreground">Unsubscribe</h1>
            <p className="text-muted-foreground text-sm">
              Are you sure you want to unsubscribe from Astrochat emails?
            </p>
            <Button
              onClick={handleUnsubscribe}
              disabled={processing}
              className="w-full gradient-gold text-primary-foreground font-semibold h-11 rounded-xl"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Unsubscribe"}
            </Button>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto" />
            <h1 className="font-serif text-xl text-foreground">Unsubscribed</h1>
            <p className="text-muted-foreground text-sm">
              You have been successfully unsubscribed from Astrochat emails.
            </p>
          </>
        )}

        {status === "already" && (
          <>
            <CheckCircle className="w-10 h-10 text-muted-foreground mx-auto" />
            <h1 className="font-serif text-xl text-foreground">Already Unsubscribed</h1>
            <p className="text-muted-foreground text-sm">
              This email has already been unsubscribed.
            </p>
          </>
        )}

        {(status === "invalid" || status === "error") && (
          <>
            <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
            <h1 className="font-serif text-xl text-foreground">
              {status === "invalid" ? "Invalid Link" : "Something went wrong"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {status === "invalid"
                ? "This unsubscribe link is invalid or has expired."
                : "Please try again later."}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default UnsubscribePage;
