// Stub email service to satisfy imports until real implementation
export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  console.log(`[EMAIL STUB] To: ${to}, Subject: ${subject}`);
  return { success: true };
}
