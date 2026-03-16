import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

export const { auth, signIn, signOut, signUp } = betterAuth({
  providers: [
    // Email/password is default
    // Add social providers here when ready:
    // Google, Apple, Facebook, GitHub, etc.
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    tables: {
      users: {
        tableName: "profiles",
        id: "id",
        email: "email",
        // Map better-auth user fields to our schema columns
        name: "full_name",
        image: "avatar_url",
        emailVerified: "email_verified",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
      accounts: {
        tableName: "accounts",
        id: "id",
        userId: "user_id",
        providerId: "provider_id",
        accountId: "account_id",
        accessToken: "access_token",
        refreshToken: "refresh_token",
        idToken: "id_token",
        expiresAt: "expires_at",
        password: "password",
        scope: "scope",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
      sessions: {
        tableName: "sessions",
        id: "id",
        userId: "user_id",
        token: "token",
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
      verifications: {
        tableName: "verifications",
        id: "id",
        userId: "user_id",
        token: "token",
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    // Optional: additional user fields that are in our profiles but not part of core better-auth user
    additionalUserFields: (user) => ({
      fullName: user.full_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      userType: user.user_type,
      isActive: user.is_active !== false,
    }),
  }),
  secretKey: process.env.AUTH_SECRET,
  trustedOrigins: process.env.AUTH_TRUSTED_ORIGINS?.split(",") || ["http://localhost:3000"],
  email: {
    // Email verification required by default
    verifyEmail: true,
    // SendGrid will be configured later; for now use console
    from: process.env.SENDGRID_FROM_EMAIL || "noreply@storeffice.com",
    sendVerificationEmail: async ({ email, verificationToken, redirectTo }) => {
      console.log(`[DEV] Verification email for ${email}: token=${verificationToken}, redirectTo=${redirectTo}`);
      // TODO: integrate SendGrid
    },
    resetPassword: async ({ email, resetToken, redirectTo }) => {
      console.log(`[DEV] Reset password email for ${email}: token=${resetToken}, redirectTo=${redirectTo}`);
    },
    signIn: async ({ email, redirectTo }) => {
      console.log(`[DEV] Sign-in email for ${email}: redirectTo=${redirectTo}`);
    },
  },
  // Session cookie settings
  cookie: {
    sessionToken: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    },
    csrfToken: {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    },
  },
  // emails will be sent server-side
  debugging: true,
});
