import { NextResponse } from "next/server"
import { registeredUsers } from "@/lib/mock-auth-store"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 })
    }

    // التحقق من وجود المستخدم
    if (!registeredUsers[email]) {
      return NextResponse.json({ error: "لم يتم العثور على مستخدم بهذا البريد الإلكتروني" }, { status: 400 })
    }

    // في النسخة المبسطة، نعيد رمز تحقق ثابت
    return NextResponse.json({ code: "123456", user: registeredUsers[email] })
  } catch (error) {
    console.error("Error getting verification code:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء جلب رمز التحقق" }, { status: 500 })
  }
}
