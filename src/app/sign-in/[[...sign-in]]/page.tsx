import { SignIn } from "@clerk/nextjs";
import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <ClerkLoading>
        <p className="text-gray-500">Loading authentication...</p>
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn afterSignOutUrl="/" />
      </ClerkLoaded>
    </main>
  );
}
