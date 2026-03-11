import { NextResponse } from "next/server"
import { changePassword } from "@/lib/server/auth-store"
import { getCurrentSessionUser } from "@/lib/server/auth-route"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { user } = await getCurrentSessionUser()
    if (!user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 })
    }

    const body = (await request.json()) as {
      currentPassword?: string
      newPassword?: string
      targetEmail?: string
    }

    const newPassword = body.newPassword || ""
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "يجب أن تكون كلمة المرور 8 أحرف على الأقل" }, { status: 400 })
    }

    await changePassword({
      requesterEmail: user.email,
      requesterRole: user.userType,
      targetEmail: body.targetEmail,
      currentPassword: body.currentPassword,
      newPassword,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تغيير كلمة المرور حاليًا"
    const status =
      message.includes("مطلوبة") || message.includes("غير صحيحة") || message.includes("صلاحية") || message.includes("العثور")
        ? 400
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
