import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import { SignOutButton } from "@clerk/nextjs";

export default async function PendingApprovalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== Role.PENDING) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-gray-100">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-gray-900">
          Pending Approval
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Your account is awaiting approval from an administrator. You will be
          able to use the carpool system once approved.
        </p>
        <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-400">Signed in as</p>
          <p className="mt-0.5 text-sm font-medium text-gray-700">
            {user.email}
          </p>
        </div>
        <SignOutButton>
          <button className="mt-5 text-sm font-medium text-blue-600 transition hover:text-blue-700">
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </main>
  );
}
