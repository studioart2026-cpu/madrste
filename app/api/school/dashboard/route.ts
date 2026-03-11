import { NextResponse } from "next/server"
import { getCurrentSessionUser } from "@/lib/server/auth-route"
import { getSchoolSnapshot, saveDashboardContent } from "@/lib/server/school-store"
import type { DashboardContent } from "@/lib/dashboard-data"

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

async function requireDashboardReadAccess() {
  const { user } = await getCurrentSessionUser()
  if (!user) {
    throw new Error("401")
  }
  return user
}

async function requireDashboardAdminAccess() {
  const user = await requireDashboardReadAccess()
  if (user.userType !== "admin") {
    throw new Error("403")
  }
  return user
}

export async function GET() {
  try {
    await requireDashboardReadAccess()
    const snapshot = await getSchoolSnapshot()
    return NextResponse.json({ dashboard: snapshot.dashboardContent })
  } catch (error) {
    return buildErrorResponse(error)
  }
}

export async function PUT(request: Request) {
  try {
    await requireDashboardAdminAccess()
    const body = (await request.json()) as { dashboard?: DashboardContent }
    const dashboard = await saveDashboardContent(body.dashboard as DashboardContent)
    return NextResponse.json({ dashboard })
  } catch (error) {
    return buildErrorResponse(error)
  }
}
