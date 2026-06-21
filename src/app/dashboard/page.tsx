// Yeh "Server Component" hai (no "use client") - server pe chalta hai
// Kaam: Login hone ke baad role check karke sahi dashboard pe bhej dena

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Agar session nahi hai - login pe bhej do
  if (!session) {
    redirect("/login");
  }

  // Role ke hisaab se redirect karo
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