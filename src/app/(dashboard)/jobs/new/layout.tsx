import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Block direct navigation to job creation for recruiters who are not approved.
 * Admins always pass through.
 */
export default async function NewJobLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.status !== "APPROVED") {
    redirect("/jobs");
  }
  return <>{children}</>;
}
