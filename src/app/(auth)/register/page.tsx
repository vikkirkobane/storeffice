import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import RegisterForm from "@/components/auth/register-form";

export default async function RegisterPage() {
  // If already logged in, redirect to dashboard
  const session = await auth.getSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your Storeffice account
          </h2>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
