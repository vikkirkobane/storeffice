import sgMail from "@sendgrid/mail";
import { render } from "@react-email/render";
import * as React from "react";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SENDGRID_API_KEY not set; emails will be logged only");
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send a raw HTML email via SendGrid.
 * Falls back to console.log if no API key.
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject} | HTML: ${html.slice(0, 200)}...`);
    return;
  }

  const msg = {
    to,
    from: {
      name: process.env.SENDGRID_FROM_NAME || "Storeffice",
      email: process.env.SENDGRID_FROM_EMAIL || "noreply@storeffice.com",
    },
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").slice(0, 5000),
  };

  try {
    await sgMail.send(msg);
    console.log(`📧 Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error("Email send error:", error);
    // TODO: Push to a retry queue (e.g., Upstash Redis)
    throw error;
  }
}

/**
 * Helper: Send email with React Email component.
 */
export async function sendReactEmail<T extends React.ElementType>(
  Component: T,
  to: string,
  subject: string,
  props: React.ComponentProps<T>
) {
  const html = await render(React.createElement(Component, props));
  return sendEmail({ to, subject, html });
}

// Email Templates as components would be imported from src/emails/
// Example: import { BookingConfirmed } from "@/emails/booking-confirmed";

/**
 * Send booking confirmation email (stub - wire to actual template)
 */
export async function sendBookingConfirmationEmail(bookingId: string) {
  // TODO: Fetch booking, space, user data and render real template
  console.log(`[TODO] Send booking confirmation email for booking ${bookingId}`);
}

/**
 * Send order confirmation email (stub)
 */
export async function sendOrderConfirmationEmail(orderId: string) {
  // TODO: Fetch order, items, user data
  console.log(`[TODO] Send order confirmation email for order ${orderId}`);
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedEmail(userId: string, type: "booking" | "order", entityId: string) {
  // TODO: Implement
  console.log(`[TODO] Send payment failed email for ${type} ${entityId} to user ${userId}`);
}

