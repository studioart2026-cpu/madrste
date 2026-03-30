import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"

export const SESSION_COOKIE_NAME = "school_session"
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7

function getSessionSecret() {
  return process.env.AUTH_SESSION_SECRET || "change-this-session-secret-before-production"
}

function signSessionId(sessionId: string) {
  return createHmac("sha256", getSessionSecret()).update(sessionId).digest("hex")
}

export function createSignedSessionValue(sessionId: string) {
  return `${sessionId}.${signSessionId(sessionId)}`
}

export function shouldUseSecureSessionCookie(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase()
  if (forwardedProto) {
    return forwardedProto === "https"
  }

  try {
    const { protocol, hostname } = new URL(request.url)
    const normalizedHostname = hostname.trim().toLowerCase()
    const isLocalhost =
      normalizedHostname === "localhost" || normalizedHostname === "127.0.0.1" || normalizedHostname === "::1"

    if (isLocalhost) {
      return false
    }

    return protocol === "https:"
  } catch {
    return process.env.NODE_ENV === "production"
  }
}

export function parseSignedSessionValue(value: string | undefined) {
  if (!value) {
    return null
  }

  const [sessionId, signature] = value.split(".")
  if (!sessionId || !signature) {
    return null
  }

  const expectedSignature = signSessionId(sessionId)
  const provided = Buffer.from(signature, "hex")
  const expected = Buffer.from(expectedSignature, "hex")

  if (provided.length !== expected.length) {
    return null
  }

  if (!timingSafeEqual(provided, expected)) {
    return null
  }

  return sessionId
}
