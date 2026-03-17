"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PaystackButtonProps {
  email: string;
  amount: number; // in major currency unit (e.g., USD)
  reference?: string; // optional custom reference
  metadata?: Record<string, string>;
  currency?: string;
  onSuccess?: (reference: string) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * PaystackButton
 *
 * A client component that loads Paystack JS and opens an inline checkout modal.
 * Requires window.Paystack to be available. We'll inject the script on mount.
 */
export default function PaystackButton({
  email,
  amount,
  reference,
  metadata = {},
  currency = "usd",
  onSuccess,
  onError,
  onClose,
  children,
  className,
}: PaystackButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Paystack script once
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Paystack) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Paystack script");
        setScriptLoaded(false);
      };
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    } else if (window.Paystack) {
      setScriptLoaded(true);
    }
  }, []);

  const handleClick = useCallback(async () => {
    if (!scriptLoaded || !email || amount <= 0) {
      onError?.(new Error("Paystack not ready or invalid amount/email"));
      return;
    }

    setLoading(true);

    // Generate a unique reference if not provided
    const ref = reference || `ref_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      // Initialize handler with public key from env
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set");
      }

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount: Math.round(amount * 100), // Paystack expects kobo/cents
        currency,
        ref,
        metadata,
        channels: ["card", "bank", "ussd", "qr", "mobile_money"], // available payment channels
        event: {
          onClose: () => {
            setLoading(false);
            onClose?.();
          },
          onSuccess: (trxref: string) => {
            setLoading(false);
            onSuccess?.(trxref);
          },
        },
      });

      handler.openIframe();
    } catch (err) {
      setLoading(false);
      onError?.(err);
    }
  }, [scriptLoaded, email, amount, currency, reference, metadata, onSuccess, onError, onClose]);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={className}
      onClick={handleClick}
      disabled={!scriptLoaded || loading}
    >
      {loading ? "Processing..." : children}
    </button>
  );
}

// Extend Window interface for Paystack
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: Record<string, string>;
        channels?: string[];
        event: {
          onClose: () => void;
          onSuccess: (trxref: string) => void;
        };
      }) => {
        openIframe: () => void;
      };
    };
  }
}
