import "server-only"

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

const KEY_LENGTH = 64

export interface PasswordHash {
  hash: string
  salt: string
}

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): PasswordHash {
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex")
  return { hash, salt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derivedKey = scryptSync(password, salt, KEY_LENGTH)
  const storedKey = Buffer.from(hash, "hex")

  if (derivedKey.length !== storedKey.length) {
    return false
  }

  return timingSafeEqual(derivedKey, storedKey)
}
