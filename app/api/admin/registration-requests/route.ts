import { NextResponse } from "next/server"
import { getCurrentSessionUser } from "@/lib/server/auth-route"
import { listRegistrationRequests, updateRegistrationRequestStatus } from "@/lib/server/auth-store"

export const runtime = "nodejs"

export async function GET() {
  const { user } = await getCurrentSessionUser()
  if (!user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 })
  }

  if (user.userType !== "admin") {
    return NextResponse.json({ error: "ليست لديك صلاحية الوصول" }, { status: 403 })
  }

  const requests = await listRegistrationRequests()
  return NextResponse.json({ requests })
}

export async function POST(request: Request) {
  try {
    const { user } = await getCurrentSessionUser()
    if (!user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 })
    }

    if (user.userType !== "admin") {
      return NextResponse.json({ error: "ليست لديك صلاحية الوصول" }, { status: 403 })
    }

    const body = (await request.json()) as { requestId?: string; action?: "approve" | "reject" }
    if (!body.requestId || !body.action) {
      return NextResponse.json({ error: "بيانات الطلب غير مكتملة" }, { status: 400 })
    }

    const nextStatus = body.action === "approve" ? "approved" : "rejected"
    const updatedRequest = await updateRegistrationRequestStatus({
      requestId: body.requestId,
      status: nextStatus,
    })

    return NextResponse.json({ request: updatedRequest })
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تحديث الطلب حاليًا"
    const status = message.includes("العثور") ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
