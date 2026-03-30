"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BellRing,
  CheckCircle2,
  Save,
  SquarePen,
  Target,
  X,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { defaultDashboardContent, type DashboardContent } from "@/lib/dashboard-data"
import { fetchDashboardData, saveDashboardPrincipalMessage } from "@/lib/school-api"
import {
  appointments,
  archivedDocuments,
  behaviorEntries,
  executiveMetrics,
  interventionPlans,
  internalTasks,
  monthlyAnalytics,
  parentMessages,
  smartAlerts,
  teacherPerformance,
  unifiedStudentRecord,
} from "@/lib/school-insights"
import { playGentleNotificationTone } from "@/lib/notification-sound"

export default function DashboardPage() {
  const { userName, userType, email } = useAuth()
  const { toast } = useToast()

  const isAdmin = userType === "admin"
  const canEditPrincipalMessage =
    userType === "admin" ||
    userType === "vice_admin" ||
    email === "principal@school.edu.sa" ||
    email === "mohamm3dalfeel@gmail.com" ||
    email === "admin2@school.edu.sa"
  const isTeacher = userType === "teacher"
  const isStudent = userType === "student"
  const [principalMessageTitle, setPrincipalMessageTitle] = useState(defaultDashboardContent.principalMessage.title)
  const [principalMessageBody, setPrincipalMessageBody] = useState(defaultDashboardContent.principalMessage.body)
  const [draftPrincipalMessageTitle, setDraftPrincipalMessageTitle] = useState(defaultDashboardContent.principalMessage.title)
  const [draftPrincipalMessageBody, setDraftPrincipalMessageBody] = useState(defaultDashboardContent.principalMessage.body)
  const [isEditingPrincipalMessage, setIsEditingPrincipalMessage] = useState(false)
  const [executiveMetricsState, setExecutiveMetricsState] = useState(executiveMetrics)
  const [smartAlertsState, setSmartAlertsState] = useState(smartAlerts)
  const [interventionPlansState, setInterventionPlansState] = useState(interventionPlans)
  const [unifiedStudentRecordState, setUnifiedStudentRecordState] = useState(unifiedStudentRecord)
  const [behaviorEntriesState, setBehaviorEntriesState] = useState(behaviorEntries)
  const [archivedDocumentsState, setArchivedDocumentsState] = useState(archivedDocuments)
  const [parentMessagesState, setParentMessagesState] = useState(parentMessages)
  const [appointmentsState, setAppointmentsState] = useState(appointments)
  const [internalTasksState, setInternalTasksState] = useState(internalTasks)
  const [monthlyAnalyticsState, setMonthlyAnalyticsState] = useState(monthlyAnalytics)
  const [teacherPerformanceState, setTeacherPerformanceState] = useState(teacherPerformance)
  const [isSavingDashboard, setIsSavingDashboard] = useState(false)
  const previousAlertsSnapshotRef = useRef<string>("")

  const applyDashboardData = (dashboard: DashboardContent) => {
    setPrincipalMessageTitle(dashboard.principalMessage.title)
    setPrincipalMessageBody(dashboard.principalMessage.body)
    setDraftPrincipalMessageTitle(dashboard.principalMessage.title)
    setDraftPrincipalMessageBody(dashboard.principalMessage.body)
    setExecutiveMetricsState(dashboard.executiveMetrics)
    setSmartAlertsState(dashboard.smartAlerts)
    setInterventionPlansState(dashboard.interventionPlans)
    setUnifiedStudentRecordState(dashboard.unifiedStudentRecord)
    setBehaviorEntriesState(dashboard.behaviorEntries)
    setArchivedDocumentsState(dashboard.archivedDocuments)
    setParentMessagesState(dashboard.parentMessages)
    setAppointmentsState(dashboard.appointments)
    setInternalTasksState(dashboard.internalTasks)
    setMonthlyAnalyticsState(dashboard.monthlyAnalytics)
    setTeacherPerformanceState(dashboard.teacherPerformance)
  }

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      try {
        const response = await fetchDashboardData()
        if (!isMounted) {
          return
        }
        applyDashboardData(response.dashboard)
      } catch {
        if (!isMounted) {
          return
        }
        applyDashboardData(defaultDashboardContent)
      }
    }

    void loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const startEditPrincipalMessage = () => {
    setDraftPrincipalMessageTitle(principalMessageTitle)
    setDraftPrincipalMessageBody(principalMessageBody)
    setIsEditingPrincipalMessage(true)
  }

  const cancelEditPrincipalMessage = () => {
    setDraftPrincipalMessageTitle(principalMessageTitle)
    setDraftPrincipalMessageBody(principalMessageBody)
    setIsEditingPrincipalMessage(false)
  }

  const notifyDashboardUpdate = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("dashboard-data-updated"))
    }
  }

  const savePrincipalMessage = async () => {
    const nextTitle = draftPrincipalMessageTitle.trim() || defaultDashboardContent.principalMessage.title
    const nextBody = draftPrincipalMessageBody.trim() || defaultDashboardContent.principalMessage.body

    setIsSavingDashboard(true)

    try {
      const response = await saveDashboardPrincipalMessage({
        title: nextTitle,
        body: nextBody,
      })
      applyDashboardData(response.dashboard)
      setIsEditingPrincipalMessage(false)
      notifyDashboardUpdate()
      toast({
        title: "تم حفظ كلمة المديرة",
        description: "تم تحديث الرسالة بنجاح",
      })
    } catch (error) {
      toast({
        title: "تعذر حفظ الرسالة",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ كلمة المديرة",
        variant: "destructive",
      })
    } finally {
      setIsSavingDashboard(false)
    }
  }

  const getCurrentDay = () => {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    return days[new Date().getDay()]
  }

  const getCurrentDateFormatted = () => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
    return new Date().toLocaleDateString("ar-SA", options)
  }

  const visibleAlerts = smartAlertsState.filter((alert) => {
    if (isAdmin) return alert.audience.includes("admin")
    if (isTeacher) return alert.audience.includes("teacher")
    if (isStudent) return alert.audience.includes("student")
    return false
  })

  const dashboardStudentRecord = {
    ...unifiedStudentRecordState,
    name: isStudent && userName ? userName : unifiedStudentRecordState.name,
  }

  const highPriorityTasks = internalTasksState.filter((task) => task.priority === "عالية")
  const urgentPlans = interventionPlansState.filter((plan) => plan.status !== "مكتمل")

  useEffect(() => {
    const nextSnapshot = JSON.stringify(smartAlertsState)

    if (!previousAlertsSnapshotRef.current) {
      previousAlertsSnapshotRef.current = nextSnapshot
      return
    }

    if (previousAlertsSnapshotRef.current !== nextSnapshot && visibleAlerts.length > 0) {
      void playGentleNotificationTone()
    }

    previousAlertsSnapshotRef.current = nextSnapshot
  }, [smartAlertsState, visibleAlerts.length])

  const quickAlerts = visibleAlerts.slice(0, 3)
  const visibleExecutiveMetrics = executiveMetricsState.filter((metric) => !["risk", "plans"].includes(metric.id))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">أهلاً بك، {userName || "مستخدم النظام"}</h1>
        <p className="text-gray-500">
          {getCurrentDay()} - {getCurrentDateFormatted()}
        </p>
      </div>

      <Alert>
        <AlertTitle className="text-lg font-semibold">مرحباً بك في نظام إدارة المدرسة المتوسطة ١٣٦</AlertTitle>
        <AlertDescription>
          يمكنك الوصول إلى جميع الخدمات والمعلومات المتاحة لك من خلال القائمة الجانبية أو من خلال البطاقات أدناه.
        </AlertDescription>
      </Alert>

      {/* كلمة المديرة */}
      <Card className="border-2 border-[#0a8a74]/20 bg-gradient-to-r from-white to-[#0a8a74]/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-[#0a8a74]">
              <MessageCircleHeartIcon className="w-5 h-5 text-[#0a8a74]" />
              <span>{principalMessageTitle}</span>
            </CardTitle>
            {canEditPrincipalMessage && !isEditingPrincipalMessage && (
              <Button variant="outline" size="sm" onClick={startEditPrincipalMessage}>
                <SquarePen className="ml-1 h-4 w-4" />
                تعديل
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          {canEditPrincipalMessage && isEditingPrincipalMessage ? (
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">عنوان الكلمة</p>
                <Textarea
                  value={draftPrincipalMessageTitle}
                  onChange={(e) => setDraftPrincipalMessageTitle(e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">نص الكلمة</p>
                <Textarea
                  value={draftPrincipalMessageBody}
                  onChange={(e) => setDraftPrincipalMessageBody(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => void savePrincipalMessage()} className="bg-[#0a8a74] hover:bg-[#097a67]" disabled={isSavingDashboard}>
                  <Save className="ml-1 h-4 w-4" />
                  حفظ
                </Button>
                <Button variant="outline" onClick={cancelEditPrincipalMessage}>
                  <X className="ml-1 h-4 w-4" />
                  إلغاء
                </Button>
              </div>
            </div>
          ) : (
            principalMessageBody
              .split("\n")
              .filter((line) => line.trim().length > 0)
              .map((line, idx, arr) => (
                <p key={`${line}-${idx}`} className={idx === arr.length - 1 ? "pt-2 font-semibold text-[#0a8a74]" : ""}>
                  {line}
                </p>
              ))
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" dir="rtl">
            {visibleExecutiveMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{metric.title}</CardTitle>
                  <CardDescription>{metric.note}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{metric.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:ml-auto md:w-[420px]" dir="rtl">
              <TabsTrigger value="overview">المؤشرات</TabsTrigger>
              <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" dir="rtl">
                {visibleExecutiveMetrics.map((metric) => (
                  <Card key={metric.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{metric.title}</CardTitle>
                      <CardDescription>{metric.note}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary">{metric.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BellRing className="h-5 w-5 text-primary" />
                      التنبيهات الذكية
                    </CardTitle>
                    <CardDescription>تنبيهات تلقائية حسب الدور والمخاطر الحالية</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {visibleAlerts.map((alert) => (
                      <div key={alert.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{alert.title}</p>
                          <span className="text-xs text-primary">{alert.severity}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2" dir="rtl">
                <Card>
                  <CardHeader>
                    <CardTitle>تحليلات شهرية</CardTitle>
                    <CardDescription>المواد الأكثر انخفاضًا والتحسن بين الفترات</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {monthlyAnalyticsState.map((item) => (
                      <div key={item.label} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{item.label}</p>
                          <span className="text-sm text-primary">تحسن {item.improvedStudents} طالبات</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">حالات انخفاض الأداء: {item.lowPerformance}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>مؤشرات أداء المعلمات</CardTitle>
                    <CardDescription>الالتزام، استكمال الرصد، وسرعة الاستجابة</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {teacherPerformanceState.map((teacher) => (
                      <div key={teacher.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{teacher.name}</p>
                          <span className="text-sm text-primary">{teacher.weeklyLoad}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <span>الحضور: {teacher.attendance}%</span>
                          <span>الرصد: {teacher.gradeCompletion}%</span>
                          <span>الاستجابة: {teacher.responseTime}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {isTeacher && (
        <Tabs defaultValue="teaching" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="teaching">التدريس</TabsTrigger>
            <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
            <TabsTrigger value="plans">الخطط</TabsTrigger>
            <TabsTrigger value="tasks">المهام</TabsTrigger>
          </TabsList>
          <TabsContent value="teaching" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryMetricCard title="فصولي الدراسية" value="3 فصول" note="الصف الثالث أ، الثالث ب، الثاني أ" />
              <SummaryMetricCard title="حصصي هذا الأسبوع" value="18 حصة" note="توزيع متوازن على المواد" />
              <SummaryMetricCard title="الرصد المكتمل" value="96%" note="يتبقى إدخال مادتين" />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>متابعة الفصول</CardTitle>
                <CardDescription>وصول سريع إلى أبرز الأعمال اليومية للمعلمة</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <QuickLinkCard href="/dashboard/attendance" title="تسجيل الحضور" description="متابعة حضور الطالبات اليومي" />
                <QuickLinkCard href="/dashboard/grades" title="رصد الدرجات" description="إدخال الدرجات ومراجعة النتائج" />
                <QuickLinkCard href="/dashboard/homework" title="إدارة الواجبات" description="إنشاء الواجبات ومتابعة التسليم" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="alerts">
            <RoleAlertList title="تنبيهات المعلمة" alerts={quickAlerts} emptyMessage="لا توجد تنبيهات تعليمية حالياً" />
          </TabsContent>
          <TabsContent value="plans">
            <PlansList title="الخطط العلاجية للمعلمة" plans={urgentPlans} />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksList tasks={highPriorityTasks} />
          </TabsContent>
        </Tabs>
      )}

      {isStudent && (
        <Tabs defaultValue="student-overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="student-overview">ملفي</TabsTrigger>
            <TabsTrigger value="homework">واجباتي</TabsTrigger>
            <TabsTrigger value="exams">اختباراتي</TabsTrigger>
            <TabsTrigger value="alerts">تنبيهاتي</TabsTrigger>
          </TabsList>
          <TabsContent value="student-overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryMetricCard title="متوسطي" value={`${dashboardStudentRecord.averageGrade}%`} note="آخر تحديث أكاديمي" />
              <SummaryMetricCard title="حضوري" value={`${dashboardStudentRecord.attendanceRate}%`} note="الحضور الشهري" />
              <SummaryMetricCard title="سلوكي" value={`${dashboardStudentRecord.behaviorScore}%`} note="السلوك والانضباط" />
              <SummaryMetricCard title="مستوى المتابعة" value={dashboardStudentRecord.riskLevel} note={dashboardStudentRecord.className} />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>الملف المختصر للطالبة</CardTitle>
                <CardDescription>معلوماتك الأساسية وما يحتاج متابعة</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoListCard title="نقاط القوة" items={dashboardStudentRecord.strengths} />
                <InfoListCard title="احتياجات الدعم" items={dashboardStudentRecord.supportNeeds} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="homework" className="space-y-4">
            <QuickCardsGrid
              title="واجباتي الحالية"
              items={[
                { title: "واجب الرياضيات", description: "حل تمارين الفصل السابع", meta: "التسليم: 20/5/2023" },
                { title: "واجب العلوم", description: "بحث عن الطاقة المتجددة", meta: "التسليم: 25/5/2023" },
                { title: "واجب اللغة العربية", description: "تلخيص قصة الشاعر الصغير", meta: "التسليم: 18/5/2023" },
              ]}
              href="/dashboard/homework"
              linkLabel="عرض جميع الواجبات"
            />
          </TabsContent>
          <TabsContent value="exams" className="space-y-4">
            <QuickCardsGrid
              title="اختباراتي القادمة"
              items={[
                { title: "اختبار الرياضيات", description: "الفصل الدراسي النهائي", meta: "التاريخ: 10/6/2023" },
                { title: "اختبار العلوم", description: "الفصل الدراسي النهائي", meta: "التاريخ: 12/6/2023" },
                { title: "اختبار اللغة العربية", description: "الفصل الدراسي النهائي", meta: "التاريخ: 15/6/2023" },
              ]}
              href="/dashboard/grades"
              linkLabel="عرض جميع الاختبارات"
            />
          </TabsContent>
          <TabsContent value="alerts">
            <RoleAlertList title="تنبيهات الطالبة" alerts={quickAlerts} emptyMessage="لا توجد تنبيهات جديدة حالياً" />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function SummaryMetricCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{note}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-primary">{value}</p>
      </CardContent>
    </Card>
  )
}

function QuickLinkCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:border-primary/40 hover:bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}

function RoleAlertList({
  title,
  alerts,
  emptyMessage,
}: {
  title: string
  alerts: Array<{ id: string; title: string; description: string; severity: string }>
  emptyMessage: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 && <p className="text-sm text-muted-foreground">{emptyMessage}</p>}
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{alert.title}</p>
              <span className="text-xs text-primary">{alert.severity}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function PlansList({
  title,
  plans,
}: {
  title: string
  plans: Array<{ id: string; studentName: string; subject: string; owner: string; dueDate: string; status: string; actions: string[] }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">
                {plan.studentName} - {plan.subject}
              </p>
              <span className="text-xs text-primary">{plan.status}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              المسؤولة: {plan.owner} | الاستحقاق: {plan.dueDate}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function TasksList({
  tasks,
}: {
  tasks: Array<{ id: string; title: string; owner: string; dueDate: string; priority: string; status: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          مهام اليوم
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-lg border p-3">
            <p className="font-medium">{task.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">المسؤول: {task.owner}</p>
            <p className="mt-1 text-sm text-muted-foreground">الاستحقاق: {task.dueDate}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function InfoListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="mb-2 font-medium">{title}</p>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}

function QuickCardsGrid({
  title,
  items,
  href,
  linkLabel,
}: {
  title: string
  items: Array<{ title: string; description: string; meta: string }>
  href: string
  linkLabel: string
}) {
  return (
    <>
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{item.meta}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Link href={href} className="text-primary hover:underline text-sm">
          {linkLabel}
        </Link>
      </div>
    </>
  )
}

function CurrentPeriod() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const time = hours * 60 + minutes

  if (time >= 7 * 60 + 15 && time < 8 * 60) {
    return "الحصة الأولى (7:15 - 8:00)"
  } else if (time >= 8 * 60 && time < 8 * 60 + 45) {
    return "الحصة الثانية (8:00 - 8:45)"
  } else if (time >= 8 * 60 + 45 && time < 9 * 60 + 30) {
    return "الحصة الثالثة (8:45 - 9:30)"
  } else if (time >= 9 * 60 + 30 && time < 10 * 60) {
    return "الفسحة (9:30 - 10:00)"
  } else if (time >= 10 * 60 && time < 10 * 60 + 45) {
    return "الحصة الرابعة (10:00 - 10:45)"
  } else if (time >= 10 * 60 + 45 && time < 11 * 60 + 30) {
    return "الحصة الخامسة (10:45 - 11:30)"
  } else if (time >= 11 * 60 + 30 && time < 12 * 60 + 15) {
    return "الحصة السادسة (11:30 - 12:15)"
  } else if (time >= 12 * 60 + 15 && time < 13 * 60) {
    return "الحصة السابعة (12:15 - 13:00)"
  } else {
    return "لا توجد حصة حالياً"
  }
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function MessageCircleHeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M15.8 9.2a2.5 2.5 0 0 0-3.5 0l-.3.4-.3-.4a2.5 2.5 0 0 0-3.5 3.5L12 16l3.8-3.8a2.5 2.5 0 0 0 0-3.5Z" />
    </svg>
  )
}
