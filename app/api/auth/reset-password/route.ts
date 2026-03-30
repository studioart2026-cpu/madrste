import { NextResponse } from "next/server"
import { resetPasswordWithToken, validatePasswordResetToken } from "@/lib/server/auth-store"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")?.trim() || ""

    if (!token) {
      return NextResponse.json({ error: "رابط إعادة التعيين غير مكتمل" }, { status: 400 })
    }

    const resetToken = await validatePasswordResetToken(token)
    if (!resetToken) {
      return NextResponse.json({ error: "رابط إعادة التعيين غير صالح أو انتهت صلاحيته" }, { status: 400 })
    }

    return NextResponse.json({ ok: true, expiresAt: resetToken.expiresAt })
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر التحقق من رابط إعادة التعيين"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; newPassword?: string }
    const token = body.token?.trim() || ""
    const newPassword = body.newPassword || ""

    if (!token) {
      return NextResponse.json({ error: "رابط إعادة التعيين غير مكتمل" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "يجب أن تكون كلمة المرور 8 أحرف على الأقل" }, { status: 400 })
    }

    await resetPasswordWithToken({
      token,
      newPassword,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر إعادة تعيين كلمة المرور حاليًا"
    const status = message.includes("غير صالح") || message.includes("صلاحيته") || message.includes("8 أحرف") ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
