import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const TIMEOUT_MS = 15_000;

/**
 * Wraps any async generate function with:
 * - confirmation dialog state
 * - timeout (15s)
 * - error toast on failure
 * - preserves previous data by only calling onSuccess after a successful result
 */
export function useRegenerateGuard(generateFn: () => Promise<void>) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const requestRegenerate = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const confirmRegenerate = useCallback(async () => {
    setConfirmOpen(false);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT_MS);

    try {
      await Promise.race([
        generateFn(),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener("abort", () =>
            reject(new Error("timeout"))
          );
        }),
      ]);
    } catch (e: any) {
      const isTimeout = e?.message === "timeout";
      toast({
        title: isTimeout
          ? t("regenerate.timeout")
          : t("regenerate.error"),
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeout);
    }
  }, [generateFn, toast, t]);

  const cancelRegenerate = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  return { confirmOpen, requestRegenerate, confirmRegenerate, cancelRegenerate };
}
