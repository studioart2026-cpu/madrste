import { NextResponse } from "next/server"
import { getSessionIdFromCookies } from "@/lib/server/auth-route"
import { logoutUser } from "@/lib/server/auth-store"
import { SESSION_COOKIE_NAME, shouldUseSecureSessionCookie } from "@/lib/server/session"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionIdFromCookies()
    await logoutUser(sessionId)

    const response = NextResponse.json({ ok: true })
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: shouldUseSecureSessionCookie(request),
      expires: new Date(0),
    })
    return response
  } catch (error) {
    console.error("POST /api/auth/logout failed:", error)
    return NextResponse.json({ error: "تعذر تسجيل الخروج حاليًا" }, { status: 500 })
  }
}
