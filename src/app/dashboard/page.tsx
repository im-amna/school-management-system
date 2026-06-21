// Server Component — checks session and redirects based on role
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Not logged in — send to login
  if (!session) {
    redirect("/login");
  }

  // Redirect based on role
  switch (session.user.role) {
    case "ADMIN":
      redirect("/admin");
    case "TEACHER":
      redirect("/teacher");
    case "STUDENT":
      redirect("/student");
    default:
      redirect("/login");
  }
}