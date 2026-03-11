import Link from "next/link";
import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
        </svg>
      </div>
      <h1 className="mt-6 mb-3 text-4xl font-bold tracking-tight text-gray-900">
        Carpool NFC
      </h1>
      <p className="mb-8 max-w-md text-center text-lg text-gray-500">
        Tap the NFC sticker in your car to log your ride. Costs are split automatically.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
        >
          Dashboard
        </Link>
        {user ? (
          <SignOutButton>
            <button className="rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md">
              Sign Out
            </button>
          </SignOutButton>
        ) : (
          <SignInButton>
            <button className="rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>
    </main>
  );
}
