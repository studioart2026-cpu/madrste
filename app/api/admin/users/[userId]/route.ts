import { NextResponse } from "next/server"
import { getCurrentSessionUser } from "@/lib/server/auth-route"
import { deleteManagedUser, updateManagedUser } from "@/lib/server/auth-store"
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
  if (message.includes("العثور") || message.includes("البريد") || message.includes("معلقة")) {
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    await requireAdmin()
    const { userId } = await context.params
    const body = (await request.json()) as {
      name?: string
      email?: string
      role?: UserType
      status?: ManagedUserStatus
      phoneNumber?: string
    }

    if (!body.name || !body.email || !body.role || !body.status) {
      return NextResponse.json({ error: "بيانات المستخدم غير مكتملة" }, { status: 400 })
    }

    const user = await updateManagedUser({
      id: userId,
      name: body.name,
      email: body.email,
      role: body.role,
      status: body.status,
      phoneNumber: body.phoneNumber,
    })

    return NextResponse.json({ user })
  } catch (error) {
    return buildErrorResponse(error)
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    await requireAdmin()
    const { userId } = await context.params
    await deleteManagedUser(userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return buildErrorResponse(error)
  }
}
