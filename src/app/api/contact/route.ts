import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/contact
 * Stub endpoint for contact form - returns success without sending email
 * To implement fully: integrate with Resend or nodemailer
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, message } = data;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    console.log(`Contact form submission from ${name} (${email}): ${message.substring(0, 100)}...`);

    // TODO: Send email via Resend
    // await sendEmail({ to: "admin@storeffice.com", subject: "New Contact", text: ... });

    return NextResponse.json({ ok: true, message: "Message received! We'll get back to you soon." });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
