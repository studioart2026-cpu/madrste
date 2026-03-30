import { NextResponse } from "next/server"
import { getSchoolSnapshot, saveSchedule } from "@/lib/server/school-store"
import { requireSchoolReadAccess, requireSchoolWriteAccess } from "@/lib/server/school-route"
import { getScheduleClassNames, type ClassScheduleMap, type DaySchedule, type PeriodSlot } from "@/lib/school-data"

export const runtime = "nodejs"

function buildErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "تعذر معالجة الطلب"
  if (message === "401") {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 })
  }
  if (message === "403") {
    return NextResponse.json({ error: "ليست لديك صلاحية تنفيذ هذا الإجراء" }, { status: 403 })
  }
  return NextResponse.json({ error: message }, { status: 500 })
}

export async function GET() {
  try {
    await requireSchoolReadAccess()
    const snapshot = await getSchoolSnapshot()
    const classNames = getScheduleClassNames(snapshot.classes, snapshot.students)
    const teacherOptions = snapshot.teachers.map((teacher) => ({
      id: teacher.teacherId,
      name: teacher.name.startsWith("أ.") ? teacher.name : `أ. ${teacher.name}`,
    }))

    return NextResponse.json({
      scheduleData: snapshot.scheduleData,
      classSchedules: snapshot.classSchedules,
      periodSlots: snapshot.periodSlots,
      classNames,
      teacherOptions,
    })
  } catch (error) {
    return buildErrorResponse(error)
  }
}

export async function PUT(request: Request) {
  try {
    await requireSchoolWriteAccess()
    const body = (await request.json()) as {
      classSchedules?: ClassScheduleMap
      scheduleData?: DaySchedule[]
      periodSlots?: PeriodSlot[]
    }
    const schedule = await saveSchedule({
      classSchedules: body.classSchedules && typeof body.classSchedules === "object" ? body.classSchedules : {},
      scheduleData: Array.isArray(body.scheduleData) ? body.scheduleData : [],
      periodSlots: Array.isArray(body.periodSlots) ? body.periodSlots : [],
    })

    const snapshot = await getSchoolSnapshot()
    const classNames = getScheduleClassNames(snapshot.classes, snapshot.students)
    const teacherOptions = snapshot.teachers.map((teacher) => ({
      id: teacher.teacherId,
      name: teacher.name.startsWith("أ.") ? teacher.name : `أ. ${teacher.name}`,
    }))

    return NextResponse.json({
      ...schedule,
      classNames,
      teacherOptions,
    })
  } catch (error) {
    return buildErrorResponse(error)
  }
}
