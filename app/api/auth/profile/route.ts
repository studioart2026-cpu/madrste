import { NextResponse } from "next/server"
import { getCurrentSessionUser } from "@/lib/server/auth-route"
import { updateUserProfile } from "@/lib/server/auth-store"

export const runtime = "nodejs"

export async function PATCH(request: Request) {
  try {
    const { user } = await getCurrentSessionUser()
    if (!user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 })
    }

    const body = (await request.json()) as { name?: string; email?: string }
    const nextName = body.name?.trim() || ""
    const nextEmail = body.email?.trim().toLowerCase() || ""

    if (!nextName || !nextEmail) {
      return NextResponse.json({ error: "الاسم والبريد الإلكتروني مطلوبان" }, { status: 400 })
    }

    const updatedUser = await updateUserProfile({
      currentEmail: user.email,
      nextName,
      nextEmail,
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تحديث الحساب حاليًا"
    const status = message.includes("مستخدم") || message.includes("العثور") ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
