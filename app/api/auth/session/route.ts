import { NextResponse } from "next/server"
import { getCurrentSessionUser } from "@/lib/server/auth-route"
import { SESSION_COOKIE_NAME } from "@/lib/server/session"

export const runtime = "nodejs"

export async function GET() {
  const { user } = await getCurrentSessionUser()
  const response = NextResponse.json({ user })

  if (!user) {
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
    })
  }

  return response
}
