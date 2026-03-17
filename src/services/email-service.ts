import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
}) {
  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
