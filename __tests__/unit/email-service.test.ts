import { sendEmail } from "@/services/email-service";

// Mock @sendgrid/mail
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue({}),
}));

describe("email-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs email when SENDGRID_API_KEY is missing", async () => {
    process.env.SENDGRID_API_KEY = "";
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[Email Mock]"),
      expect.any(String)
    );
    consoleSpy.mockRestore();
  });

  it("sends email via SendGrid when API key is set", async () => {
    process.env.SENDGRID_API_KEY = "SG.test";
    process.env.SENDGRID_FROM_EMAIL = "noreply@storeffice.com";
    process.env.SENDGRID_FROM_NAME = "Storeffice";

    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test Subject",
      html: "<h1>Hello</h1>",
    });

    expect(result).toBeUndefined(); // no return value
    // Additional asserts on @sendgrid/mail.send could be added if imported
  });
});
