import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json(
    {
      error: "خدمة التحقق عبر البريد الإلكتروني غير مفعلة في هذه النسخة.",
    },
    { status: 410 },
  )
}
