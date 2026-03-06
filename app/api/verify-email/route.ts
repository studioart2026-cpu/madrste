import { NextResponse } from "next/server"
import { registeredUsers } from "@/lib/mock-auth-store"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, code } = body

    if (!email) {
      return NextResponse.json({ success: false, message: "البريد الإلكتروني مطلوب" }, { status: 400 })
    }

    // في النسخة المبسطة، نعتبر أن جميع رموز التحقق صحيحة
    // وفي التطبيق الحقيقي سيتم التحقق من الرمز

    // التحقق من وجود المستخدم
    if (!registeredUsers[email]) {
      return NextResponse.json(
        { success: false, message: "لم يتم العثور على مستخدم بهذا البريد الإلكتروني" },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "تم التحقق بنجاح",
      user: registeredUsers[email],
    })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء التحقق" }, { status: 500 })
  }
}
