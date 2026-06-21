import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Landing } from "@/components/Landing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  // Signed out → the landing page.
  if (!session?.user) return <Landing />;

  // Signed in but no profile yet → onboarding.
  if (!session.user.handle) redirect("/onboarding");

  // Signed in with a profile → straight to their own timeline.
  redirect(`/u/${session.user.handle}`);
}
