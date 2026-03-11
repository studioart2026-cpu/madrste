import "server-only"

import { cookies } from "next/headers"
import { parseSignedSessionValue, SESSION_COOKIE_NAME } from "@/lib/server/session"
import { getSessionUser } from "@/lib/server/auth-store"

export async function getSessionIdFromCookies() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  return parseSignedSessionValue(sessionCookie)
}

export async function getCurrentSessionUser() {
  const sessionId = await getSessionIdFromCookies()
  const user = await getSessionUser(sessionId)
  return { sessionId, user }
}
