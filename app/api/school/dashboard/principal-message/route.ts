import { NextResponse } from "next/server"
import { getCurrentSessionUser } from "@/lib/server/auth-route"
import { saveDashboardPrincipalMessage } from "@/lib/server/school-store"
import type { DashboardPrincipalMessage } from "@/lib/dashboard-data"

export const runtime = "nodejs"

function buildErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "تعذر معالجة الطلب"
  if (message === "401") {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 })
  }
  if (message === "403") {
    return NextResponse.json({ error: "ليست لديك صلاحية تنفيذ هذا الإجراء" }, { status: 403 })
  }
  return NextResponse.json({ error: message }, { status: 500 })
}

async function requirePrincipalMessageAccess() {
  const { user } = await getCurrentSessionUser()
  if (!user) {
    throw new Error("401")
  }

  const allowedEmails = new Set(["principal@school.edu.sa", "mohamm3dalfeel@gmail.com", "admin2@school.edu.sa"])
  if (user.userType !== "admin" && user.userType !== "vice_admin" && !allowedEmails.has(user.email)) {
    throw new Error("403")
  }

  return user
}

export async function PATCH(request: Request) {
  try {
    await requirePrincipalMessageAccess()
    const body = (await request.json()) as { principalMessage?: DashboardPrincipalMessage }
    const dashboard = await saveDashboardPrincipalMessage((body.principalMessage || {}) as DashboardPrincipalMessage)
    return NextResponse.json({ dashboard })
  } catch (error) {
    return buildErrorResponse(error)
  }
}
