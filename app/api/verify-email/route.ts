import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST() {
  return NextResponse.json(
    {
      error: "خدمة تحقق البريد الإلكتروني غير مفعلة في هذه النسخة.",
    },
    { status: 410 },
  )
}
