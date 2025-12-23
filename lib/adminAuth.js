import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = [
  "maitrey.bharambe24@gmail.com",
  "maitrey.bharambe@vit.edu.in",
];

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  if (!ADMIN_EMAILS.includes(session.user.email)) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function checkAdminAccess() {
  try {
    return await requireAdmin();
  } catch (error) {
    if (error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(email);
}
