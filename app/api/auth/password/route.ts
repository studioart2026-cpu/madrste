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

    if (user.userType !== "admin") {
      return NextResponse.json({ error: "تغيير كلمات المرور من مهام مدير النظام فقط" }, { status: 403 })
    }

    const body = (await request.json()) as {
      newPassword?: string
      targetEmail?: string
    }

    const newPassword = body.newPassword || ""
    const targetEmail = body.targetEmail?.trim().toLowerCase() || ""

    if (!targetEmail) {
      return NextResponse.json({ error: "البريد الإلكتروني للحساب المطلوب مطلوب" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "يجب أن تكون كلمة المرور 8 أحرف على الأقل" }, { status: 400 })
    }

    await changePassword({
      requesterEmail: user.email,
      requesterRole: user.userType,
      targetEmail,
      newPassword,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تغيير كلمة المرور حاليًا"
    const status =
      message.includes("مدير النظام")
        ? 403
        : message.includes("مطلوب") || message.includes("العثور")
          ? 400
          : 500
    return NextResponse.json({ error: message }, { status })
  }
}
