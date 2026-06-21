import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingForm } from "@/components/OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  // Already has a profile → go to it.
  if (session.user.handle) redirect(`/u/${session.user.handle}`);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <OnboardingForm defaultName={session.user.name ?? ""} image={session.user.image ?? null} />
    </main>
  );
}
