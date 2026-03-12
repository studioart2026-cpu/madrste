import { NextResponse } from "next/server"
import { loginUser } from "@/lib/server/auth-store"
import { createSignedSessionValue, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/server/session"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = body.email?.trim().toLowerCase() || ""
    const password = body.password || ""

    if (!email || !password) {
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 })
    }

    const result = await loginUser(email, password)
    if (!result.user || !result.sessionId) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 })
    }

    const response = NextResponse.json({ user: result.user })
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
    console.error("POST /api/auth/login failed:", error)
    return NextResponse.json({ error: "تعذر تسجيل الدخول حاليًا" }, { status: 500 })
  }
}
