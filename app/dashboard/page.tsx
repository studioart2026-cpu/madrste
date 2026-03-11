"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BellRing,
  CalendarIcon,
  CheckCircle2,
  Clock,
  FileArchive,
  GraduationCap,
  MessageSquareMore,
  Save,
  School,
  ShieldAlert,
  SquarePen,
  Target,
  Users,
  X,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { defaultDashboardContent, type DashboardContent } from "@/lib/dashboard-data"
import { fetchDashboardData, saveDashboardData, saveDashboardPrincipalMessage } from "@/lib/school-api"
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
  const canEditDashboardData = userType === "admin"
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
  const [editorValues, setEditorValues] = useState<Record<string, string>>({})
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [isSavingDashboard, setIsSavingDashboard] = useState(false)
  const previousAlertsSnapshotRef = useRef<string>("")

  const storageKeys = {
    executiveMetrics: "executiveMetrics",
    smartAlerts: "smartAlerts",
    interventionPlans: "interventionPlans",
    unifiedStudentRecord: "unifiedStudentRecord",
    behaviorEntries: "behaviorEntries",
    archivedDocuments: "archivedDocuments",
    parentMessages: "parentMessages",
    appointments: "appointments",
    internalTasks: "internalTasks",
    monthlyAnalytics: "monthlyAnalytics",
    teacherPerformance: "teacherPerformance",
  } as const

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

  const buildDashboardPayload = (overrides?: Partial<DashboardContent>): DashboardContent => ({
    principalMessage: overrides?.principalMessage || {
      title: principalMessageTitle,
      body: principalMessageBody,
    },
    executiveMetrics: overrides?.executiveMetrics || executiveMetricsState,
    smartAlerts: overrides?.smartAlerts || smartAlertsState,
    interventionPlans: overrides?.interventionPlans || interventionPlansState,
    unifiedStudentRecord: overrides?.unifiedStudentRecord || unifiedStudentRecordState,
    behaviorEntries: overrides?.behaviorEntries || behaviorEntriesState,
    archivedDocuments: overrides?.archivedDocuments || archivedDocumentsState,
    parentMessages: overrides?.parentMessages || parentMessagesState,
    appointments: overrides?.appointments || appointmentsState,
    internalTasks: overrides?.internalTasks || internalTasksState,
    monthlyAnalytics: overrides?.monthlyAnalytics || monthlyAnalyticsState,
    teacherPerformance: overrides?.teacherPerformance || teacherPerformanceState,
  })

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

  const startEditingSection = (section: keyof typeof storageKeys, value: unknown) => {
    setEditingSection(section)
    setEditorError(null)
    setEditorValues((current) => ({
      ...current,
      [section]: JSON.stringify(value, null, 2),
    }))
  }

  const cancelEditingSection = () => {
    setEditingSection(null)
    setEditorError(null)
  }

  const saveEditedSection = async <T,>(
    section: keyof typeof storageKeys,
    _setter: (value: T) => void,
    _storageKey: string,
  ) => {
    const raw = editorValues[section]
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as T
      setIsSavingDashboard(true)
      const response = await saveDashboardData(
        buildDashboardPayload({
          [section]: parsed,
        } as Partial<DashboardContent>),
      )
      applyDashboardData(response.dashboard)
      setEditingSection(null)
      setEditorError(null)
      notifyDashboardUpdate()
      toast({
        title: "تم حفظ التعديلات",
        description: "تم تحديث بيانات لوحة التحكم بنجاح",
      })
    } catch (error) {
      if (error instanceof SyntaxError) {
        setEditorError("تنسيق JSON غير صالح. تأكد من الأقواس والفواصل والنصوص.")
      } else {
        setEditorError(null)
        toast({
          title: "تعذر حفظ التعديلات",
          description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ بيانات لوحة التحكم",
          variant: "destructive",
        })
      }
    } finally {
      setIsSavingDashboard(false)
    }
  }

  const resetEditedSection = async <T,>(
    section: keyof typeof storageKeys,
    fallback: T,
    _setter: (value: T) => void,
    _storageKey: string,
  ) => {
    setIsSavingDashboard(true)

    try {
      const response = await saveDashboardData(
        buildDashboardPayload({
          [section]: fallback,
        } as Partial<DashboardContent>),
      )
      applyDashboardData(response.dashboard)
      setEditorValues((current) => ({
        ...current,
        [section]: JSON.stringify(fallback, null, 2),
      }))
      setEditorError(null)
      notifyDashboardUpdate()
      toast({
        title: "تمت استعادة البيانات",
        description: "تمت إعادة القسم إلى القيم الافتراضية",
      })
    } catch (error) {
      toast({
        title: "تعذر استعادة البيانات",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء استعادة البيانات الافتراضية",
        variant: "destructive",
      })
    } finally {
      setIsSavingDashboard(false)
    }
  }

  const quickAlerts = visibleAlerts.slice(0, 3)

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {executiveMetricsState.map((metric) => (
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">المؤشرات</TabsTrigger>
          <TabsTrigger value="record">الملف الموحد</TabsTrigger>
          <TabsTrigger value="operations">التشغيل</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          {canEditDashboardData && <TabsTrigger value="editor">التحرير</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {executiveMetricsState.map((metric) => (
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  الخطط العلاجية والإثرائية
                </CardTitle>
                <CardDescription>خطة متابعة قابلة للتنفيذ مع مسؤول واضح وموعد إغلاق</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {urgentPlans.map((plan) => (
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
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {plan.actions.map((action) => (
                        <li key={action}>• {action}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="record" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" />
                  الملف الموحد للطالبة
                </CardTitle>
                <CardDescription>عرض موحد للدرجات والحضور والسلوك والخطط والمرفقات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">الطالبة</p>
                    <p className="font-semibold">{dashboardStudentRecord.name}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">الفصل</p>
                    <p className="font-semibold">{dashboardStudentRecord.className}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">نسبة الحضور</p>
                    <p className="font-semibold">{dashboardStudentRecord.attendanceRate}%</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">متوسط الدرجات</p>
                    <p className="font-semibold">{dashboardStudentRecord.averageGrade}%</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">درجة السلوك</p>
                    <p className="font-semibold">{dashboardStudentRecord.behaviorScore}%</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">مستوى الخطورة</p>
                    <p className="font-semibold">{dashboardStudentRecord.riskLevel}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="mb-2 font-medium">نقاط القوة</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {dashboardStudentRecord.strengths.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="mb-2 font-medium">احتياجات الدعم</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {dashboardStudentRecord.supportNeeds.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  السلوك والانضباط
                </CardTitle>
                <CardDescription>توثيق السلوك الإيجابي والملاحظات والاستدعاءات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {behaviorEntriesState.map((entry) => (
                  <div key={entry.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{entry.studentName}</p>
                      <span className="text-xs text-primary">{entry.type}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileArchive className="h-5 w-5 text-primary" />
                أرشفة المستندات
              </CardTitle>
              <CardDescription>أعذار الغياب، النماذج، والمرفقات الأكاديمية والصحية</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {archivedDocumentsState.map((document) => (
                <div key={document.id} className="rounded-lg border p-3">
                  <p className="font-medium">{document.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{document.studentName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{document.category}</p>
                  <p className="mt-2 text-xs text-muted-foreground">آخر تحديث: {document.updatedAt}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareMore className="h-5 w-5 text-primary" />
                  التواصل مع أولياء الأمور
                </CardTitle>
                <CardDescription>سجل الرسائل، حالات الرد، وآخر تحديث</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {parentMessagesState.map((message) => (
                  <div key={message.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">
                        {message.parentName} - {message.studentName}
                      </p>
                      <span className="text-xs text-primary">{message.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{message.subject}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{message.lastUpdate}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  المواعيد والمقابلات
                </CardTitle>
                <CardDescription>جدولة المواعيد بين المدرسة، المعلمات، وأولياء الأمور</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointmentsState.map((appointment) => (
                  <div key={appointment.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{appointment.title}</p>
                      <span className="text-xs text-primary">{appointment.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{appointment.owner}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{appointment.date}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                لوحة المهام الداخلية
              </CardTitle>
              <CardDescription>مهام تشغيلية حسب الأولوية وحالة التنفيذ</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {highPriorityTasks.map((task) => (
                <div key={task.id} className="rounded-lg border p-3">
                  <p className="font-medium">{task.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">المسؤول: {task.owner}</p>
                  <p className="mt-1 text-sm text-muted-foreground">الاستحقاق: {task.dueDate}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-primary">{task.priority}</span>
                    <span className="text-muted-foreground">{task.status}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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

        {canEditDashboardData && (
          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تحرير بيانات اللوحة</CardTitle>
                <CardDescription>يمكنك تعديل جميع الأقسام الجديدة وحفظها مباشرة. التنسيق المستخدم هو JSON.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <EditableJsonSection
                  title="المؤشرات التنفيذية"
                  sectionKey="executiveMetrics"
                  value={executiveMetricsState}
                  editingSection={editingSection}
                  editorValue={editorValues.executiveMetrics || ""}
                  onStartEdit={() => startEditingSection("executiveMetrics", executiveMetricsState)}
                  onChange={(value) => setEditorValues((current) => ({ ...current, executiveMetrics: value }))}
                  onSave={() =>
                    saveEditedSection("executiveMetrics", setExecutiveMetricsState, storageKeys.executiveMetrics)
                  }
                  onCancel={cancelEditingSection}
                  onReset={() =>
                    resetEditedSection("executiveMetrics", executiveMetrics, setExecutiveMetricsState, storageKeys.executiveMetrics)
                  }
                  error={editorError}
                />
                <EditableJsonSection
                  title="التنبيهات الذكية"
                  sectionKey="smartAlerts"
                  value={smartAlertsState}
                  editingSection={editingSection}
                  editorValue={editorValues.smartAlerts || ""}
                  onStartEdit={() => startEditingSection("smartAlerts", smartAlertsState)}
                  onChange={(value) => setEditorValues((current) => ({ ...current, smartAlerts: value }))}
                  onSave={() => saveEditedSection("smartAlerts", setSmartAlertsState, storageKeys.smartAlerts)}
                  onCancel={cancelEditingSection}
                  onReset={() => resetEditedSection("smartAlerts", smartAlerts, setSmartAlertsState, storageKeys.smartAlerts)}
                  error={editorError}
                />
                <EditableJsonSection
                  title="الملف الموحد للطالبة"
                  sectionKey="unifiedStudentRecord"
                  value={unifiedStudentRecordState}
                  editingSection={editingSection}
                  editorValue={editorValues.unifiedStudentRecord || ""}
                  onStartEdit={() => startEditingSection("unifiedStudentRecord", unifiedStudentRecordState)}
                  onChange={(value) => setEditorValues((current) => ({ ...current, unifiedStudentRecord: value }))}
                  onSave={() =>
                    saveEditedSection("unifiedStudentRecord", setUnifiedStudentRecordState, storageKeys.unifiedStudentRecord)
                  }
                  onCancel={cancelEditingSection}
                  onReset={() =>
                    resetEditedSection(
                      "unifiedStudentRecord",
                      unifiedStudentRecord,
                      setUnifiedStudentRecordState,
                      storageKeys.unifiedStudentRecord,
                    )
                  }
                  error={editorError}
                />
                <EditableJsonSection
                  title="الخطط العلاجية"
                  sectionKey="interventionPlans"
                  value={interventionPlansState}
                  editingSection={editingSection}
                  editorValue={editorValues.interventionPlans || ""}
                  onStartEdit={() => startEditingSection("interventionPlans", interventionPlansState)}
                  onChange={(value) => setEditorValues((current) => ({ ...current, interventionPlans: value }))}
                  onSave={() =>
                    saveEditedSection("interventionPlans", setInterventionPlansState, storageKeys.interventionPlans)
                  }
                  onCancel={cancelEditingSection}
                  onReset={() =>
                    resetEditedSection(
                      "interventionPlans",
                      interventionPlans,
                      setInterventionPlansState,
                      storageKeys.interventionPlans,
                    )
                  }
                  error={editorError}
                />
                <EditableJsonSection
                  title="السلوك والانضباط"
                  sectionKey="behaviorEntries"
                  value={behaviorEntriesState}
                  editingSection={editingSection}
                  editorValue={editorValues.behaviorEntries || ""}
                  onStartEdit={() => startEditingSection("behaviorEntries", behaviorEntriesState)}
                  onChange={(value) => setEditorValues((current) => ({ ...current, behaviorEntries: value }))}
                  onSave={() =>
                    saveEditedSection("behaviorEntries", setBehaviorEntriesState, storageKeys.behaviorEntries)
                  }
                  onCancel={cancelEditingSection}
                  onReset={() =>
                    resetEditedSection("behaviorEntries", behaviorEntries, setBehaviorEntriesState, storageKeys.behaviorEntries)
                  }
                  error={editorError}
                />
                <EditableJsonSection
                  title="أرشيف المستندات"
                  sectionKey="archivedDocuments"
                  value={archivedDocumentsState}
                  editingSection={editingSection}
                  editorValue={editorValues.archivedDocuments || ""}
                  onStartEdit={() => startEditingSection("archivedDocuments", archivedDocumentsState)}
                  onChange={(value) => setEditorValues((current) => ({ ...current, archivedDocuments: value }))}
                  onSave={() =>
                    saveEditedSection("archivedDocuments", setArchivedDocumentsState, storageKeys.archivedDocuments)
                  }
                  onCancel={cancelEditingSection}
                  onReset={() =>
                    resetEditedSection(
                      "archivedDocuments",
                      archivedDocuments,
                      setArchivedDocumentsState,
                      storageKeys.archivedDocuments,
                    )
                  }
                  error={editorError}
                />
                <EditableJsonSection
                  title="رسائل أولياء الأمور"
                  sectionKey="parentMessages"
                  value={parentMessagesState}
                  editingSection={editingSection}
                  editorValue={editorValues.parentMessages || ""}
                  onStartEdit={() => startEditingSection("parentMessages", parentMessagesState)}
                  onChange={(value) => setEditorValues((current) => ({ ...current, parentMessages: value }))}
                  onSave={() =>
                    saveEditedSection("parentMessages", setParentMessagesState, storageKeys.parentMessages)
                  }
                  onCancel={cancelEditingSection}
                  onReset={() =>
                    resetEditedSection("parentMessages", parentMessages, setParentMessagesState, storageKeys.parentMessages)
                  }
                  error={editorError}
                />
                <EditableJsonSection
                  title="المواعيد والمقابلات"
                  sectionKey="appointments"
                  value={appointmentsState}
                  editingSection={editingSection}
                  editorValue={editorValues.appointments || ""}
                  onStartEdit={() => startEditingSection("appointments", appointmentsState)}
                  onChange={(value) => setEditorValues((current) => ({ ...current, appointments: value }))}
                  onSave={() => saveEditedSection("appointments", setAppointmentsState, storageKeys.appointments)}
                  onCancel={cancelEditingSection}
                  onReset={() =>
                    resetEditedSection("appointments", appointments, setAppointmentsState, storageKeys.appointments)
                  }
                  error={editorError}
                />
                <EditableJsonSection
                  title="المهام الداخلية"
                  sectionKey="internalTasks"
                  value={internalTasksState}
                  editingSection={editingSection}
                  editorValue={editorValues.internalTasks || ""}
                  onStartEdit={() => startEditingSection("internalTasks", internalTasksState)}
                  onChange={(value) => setEditorValues((current) => ({ ...current, internalTasks: value }))}
                  onSave={() => saveEditedSection("internalTasks", setInternalTasksState, storageKeys.internalTasks)}
                  onCancel={cancelEditingSection}
                  onReset={() =>
                    resetEditedSection("internalTasks", internalTasks, setInternalTasksState, storageKeys.internalTasks)
                  }
                  error={editorError}
                />
                <EditableJsonSection
                  title="التحليلات الشهرية"
                  sectionKey="monthlyAnalytics"
                  value={monthlyAnalyticsState}
                  editingSection={editingSection}
                  editorValue={editorValues.monthlyAnalytics || ""}
                  onStartEdit={() => startEditingSection("monthlyAnalytics", monthlyAnalyticsState)}
                  onChange={(value) => setEditorValues((current) => ({ ...current, monthlyAnalytics: value }))}
                  onSave={() =>
                    saveEditedSection("monthlyAnalytics", setMonthlyAnalyticsState, storageKeys.monthlyAnalytics)
                  }
                  onCancel={cancelEditingSection}
                  onReset={() =>
                    resetEditedSection("monthlyAnalytics", monthlyAnalytics, setMonthlyAnalyticsState, storageKeys.monthlyAnalytics)
                  }
                  error={editorError}
                />
                <EditableJsonSection
                  title="أداء المعلمات"
                  sectionKey="teacherPerformance"
                  value={teacherPerformanceState}
                  editingSection={editingSection}
                  editorValue={editorValues.teacherPerformance || ""}
                  onStartEdit={() => startEditingSection("teacherPerformance", teacherPerformanceState)}
                  onChange={(value) => setEditorValues((current) => ({ ...current, teacherPerformance: value }))}
                  onSave={() =>
                    saveEditedSection("teacherPerformance", setTeacherPerformanceState, storageKeys.teacherPerformance)
                  }
                  onCancel={cancelEditingSection}
                  onReset={() =>
                    resetEditedSection(
                      "teacherPerformance",
                      teacherPerformance,
                      setTeacherPerformanceState,
                      storageKeys.teacherPerformance,
                    )
                  }
                  error={editorError}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
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

function EditableJsonSection({
  title,
  sectionKey,
  value,
  editingSection,
  editorValue,
  onStartEdit,
  onChange,
  onSave,
  onCancel,
  onReset,
  error,
}: {
  title: string
  sectionKey: string
  value: unknown
  editingSection: string | null
  editorValue: string
  onStartEdit: () => void
  onChange: (value: string) => void
  onSave: () => void | Promise<void>
  onCancel: () => void
  onReset: () => void | Promise<void>
  error: string | null
}) {
  const isEditing = editingSection === sectionKey

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">يمكنك تعديل البيانات ثم حفظها مباشرة في النظام.</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button variant="outline" onClick={onStartEdit}>
              تعديل
            </Button>
          ) : (
            <>
              <Button onClick={() => void onSave()}>حفظ</Button>
              <Button variant="outline" onClick={onCancel}>
                إلغاء
              </Button>
              <Button variant="destructive" onClick={() => void onReset()}>
                استعادة الافتراضي
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea value={editorValue} onChange={(e) => onChange(e.target.value)} rows={12} dir="ltr" />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        <pre className="overflow-auto rounded-md bg-slate-50 p-3 text-xs leading-6 text-slate-700" dir="ltr">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
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
