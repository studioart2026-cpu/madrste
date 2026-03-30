import { NextResponse } from "next/server"
import { getCurrentSessionUser } from "@/lib/server/auth-route"
import { renewSession } from "@/lib/server/auth-store"
import {
  createSignedSessionValue,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  shouldUseSecureSessionCookie,
} from "@/lib/server/session"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const { sessionId, user } = await getCurrentSessionUser()
    const response = NextResponse.json({ user })

    if (!user || !sessionId) {
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
    }

    await renewSession(sessionId)
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: createSignedSessionValue(sessionId),
      httpOnly: true,
      sameSite: "lax",
      secure: shouldUseSecureSessionCookie(request),
      path: "/",
      expires: new Date(Date.now() + SESSION_DURATION_MS),
    })

    return response
  } catch (error) {
    console.error("GET /api/auth/session failed:", error)
    return NextResponse.json({ error: "تعذر التحقق من الجلسة حاليًا" }, { status: 503 })
  }
}
