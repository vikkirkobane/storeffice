import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/services/email-service";

/**
 * POST /api/contact
 * Body: { name, email, message }
 * Sends an email via Resend to the site admin.
 */
export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    await sendEmail({
      to: process.env.RESEND_FROM_EMAIL || "support@storeffice.com",
      from: `${name} <${email}>`,
      subject: `Storeffice Contact: ${name}`,
      text: message,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message.replace(/\n/g, "<br>")}</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
