import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl font-bold text-gray-900">Carpool NFC</h1>
        </Link>
        <p className="mt-2 text-gray-500">Create an account to get started</p>
      </div>
      <SignUp afterSignOutUrl="/" />
    </main>
  );
}
