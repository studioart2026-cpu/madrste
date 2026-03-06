import { NextResponse } from "next/server"
import { registeredUsers } from "@/lib/mock-auth-store"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, userType, phoneNumber, resend } = body

    // التحقق من وجود المستخدم في قاعدة البيانات المحلية
    if (registeredUsers[email]) {
      return NextResponse.json({
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        user: {
          name: registeredUsers[email].name,
          userType: registeredUsers[email].userType,
          isApproved: registeredUsers[email].isApproved,
        },
      })
    }

    // إضافة مستخدم جديد (في التطبيق الحقيقي سيتم التحقق من البريد)
    if (name && userType) {
      registeredUsers[email] = {
        name,
        userType,
        isApproved: userType === "admin" || userType === "vice_admin",
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم تسجيل المستخدم بنجاح",
      user: registeredUsers[email] || { name, userType, isApproved: false },
    })
  } catch (error) {
    console.error("Error in authentication:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء المصادقة" }, { status: 500 })
  }
}
