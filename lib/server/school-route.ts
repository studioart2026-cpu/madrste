import "server-only"

import { getCurrentSessionUser } from "@/lib/server/auth-route"

export async function requireSchoolReadAccess() {
  const { user } = await getCurrentSessionUser()
  if (!user) {
    throw new Error("401")
  }
  return user
}

export async function requireSchoolWriteAccess() {
  const user = await requireSchoolReadAccess()
  if (!["admin", "vice_admin", "teacher"].includes(user.userType)) {
    throw new Error("403")
  }
  return user
}
