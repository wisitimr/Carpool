import Link from "next/link";
import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      {/* Hero icon */}
      <div className="relative">
        <div className="absolute -inset-4 rounded-3xl bg-blue-500/20 blur-xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/25">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0"
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-gray-900">
        Carpool{" "}
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          NFC
        </span>
      </h1>
      <p className="mt-4 max-w-sm text-center text-lg leading-relaxed text-gray-500">
        Tap the NFC sticker in your car to log your ride. Costs are split
        automatically.
      </p>

      {/* Feature pills */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {["NFC Tap-In", "Auto Split", "Monthly Reports"].map((f) => (
          <span
            key={f}
            className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
          >
            {f}
          </span>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="mt-10 flex gap-4">
        <Link
          href="/dashboard"
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
        >
          <span className="relative z-10">Go to Dashboard</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
        {user ? (
          <SignOutButton>
            <button className="rounded-xl border border-gray-200 bg-white px-7 py-3.5 font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
              Sign Out
            </button>
          </SignOutButton>
        ) : (
          <SignInButton>
            <button className="rounded-xl border border-gray-200 bg-white px-7 py-3.5 font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>
    </main>
  );
}
