import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

export default async function PendingApprovalPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if (session.user.role !== Role.PENDING) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <div className="mb-4 text-5xl">{"\u23F3"}</div>
        <h1 className="mb-2 text-2xl font-bold">Pending Approval</h1>
        <p className="mb-6 text-gray-600">
          Your account is awaiting approval from an administrator. You will be
          able to use the carpool system once your account has been approved.
        </p>
        <p className="text-sm text-gray-400">
          Signed in as {session.user.email}
        </p>
        <a
          href="/api/auth/signout"
          className="mt-4 inline-block text-sm text-blue-600 underline hover:text-blue-800"
        >
          Sign Out
        </a>
      </div>
    </main>
  );
}
