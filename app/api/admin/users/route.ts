import { NextResponse } from "next/server"
import { getCurrentSessionUser } from "@/lib/server/auth-route"
import { createManagedUser, listManagedUsers } from "@/lib/server/auth-store"
import type { ManagedUserStatus, UserType } from "@/lib/auth-types"

export const runtime = "nodejs"

function buildErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "تعذر معالجة الطلب"
  if (message === "401") {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 })
  }
  if (message === "403") {
    return NextResponse.json({ error: "ليست لديك صلاحية الوصول" }, { status: 403 })
  }
  if (message.includes("مستخدم") || message.includes("البريد") || message.includes("معلقة")) {
    return NextResponse.json({ error: message }, { status: 400 })
  }
  return NextResponse.json({ error: message }, { status: 500 })
}

async function requireAdmin() {
  const { user } = await getCurrentSessionUser()
  if (!user) {
    throw new Error("401")
  }
  if (user.userType !== "admin") {
    throw new Error("403")
  }
}

export async function GET() {
  try {
    await requireAdmin()
    const users = await listManagedUsers()
    return NextResponse.json({ users })
  } catch (error) {
    return buildErrorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = (await request.json()) as {
      name?: string
      email?: string
      role?: UserType
      status?: ManagedUserStatus
      phoneNumber?: string
      password?: string
    }

    if (!body.name || !body.email || !body.role || !body.status || !body.password) {
      return NextResponse.json({ error: "بيانات المستخدم غير مكتملة" }, { status: 400 })
    }

    const user = await createManagedUser({
      name: body.name,
      email: body.email,
      role: body.role,
      status: body.status,
      phoneNumber: body.phoneNumber,
      password: body.password,
    })

    return NextResponse.json({ user })
  } catch (error) {
    return buildErrorResponse(error)
  }
}
