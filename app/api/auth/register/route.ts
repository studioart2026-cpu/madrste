import { NextResponse } from "next/server"
import { registerUser } from "@/lib/server/auth-store"
import { createSignedSessionValue, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/server/session"
import type { RegistrationUserType } from "@/lib/auth-types"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string
      email?: string
      password?: string
      phoneNumber?: string
      userType?: RegistrationUserType
    }

    const name = body.name?.trim() || ""
    const email = body.email?.trim().toLowerCase() || ""
    const password = body.password || ""
    const phoneNumber = body.phoneNumber?.trim() || ""
    const userType = body.userType

    if (!name || !email || !password || !phoneNumber || !userType) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "يجب أن تكون كلمة المرور 8 أحرف على الأقل" }, { status: 400 })
    }

    const result = await registerUser({
      name,
      email,
      password,
      phoneNumber,
      userType,
    })

    const response = NextResponse.json({ user: result.user, request: result.request }, { status: 201 })
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: createSignedSessionValue(result.sessionId),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(Date.now() + SESSION_DURATION_MS),
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر إنشاء الحساب حاليًا"
    const status = message.includes("يوجد") ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
