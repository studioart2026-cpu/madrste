import { NextResponse } from "next/server"
import { createPasswordResetRequest, PASSWORD_RESET_TOKEN_DURATION_MINUTES } from "@/lib/server/auth-store"
import { isTransactionalEmailConfigured, sendPasswordResetEmail } from "@/lib/server/mail"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string }
    const email = body.email?.trim().toLowerCase() || ""

    if (!email) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 })
    }

    if (!isTransactionalEmailConfigured()) {
      return NextResponse.json(
        {
          error: "خدمة البريد غير مهيأة. أضف RESEND_API_KEY و MAIL_FROM لتفعيل إرسال روابط إعادة التعيين.",
        },
        { status: 503 },
      )
    }

    const resetRequest = await createPasswordResetRequest(email)

    if (resetRequest) {
      const appBaseUrl = process.env.APP_BASE_URL?.trim() || new URL(request.url).origin
      const resetUrl = new URL("/reset-password", appBaseUrl)
      resetUrl.searchParams.set("token", resetRequest.token)

      await sendPasswordResetEmail({
        to: resetRequest.email,
        recipientName: resetRequest.name,
        resetUrl: resetUrl.toString(),
        expiresInMinutes: PASSWORD_RESET_TOKEN_DURATION_MINUTES,
      })
    }

    return NextResponse.json({
      ok: true,
      message: "إذا كان البريد الإلكتروني مسجلاً في النظام، فسيتم إرسال رابط إعادة تعيين كلمة المرور إليه.",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر معالجة طلب استعادة كلمة المرور"
    const status = message.includes("تهيأة") || message.includes("مهيأة") ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
