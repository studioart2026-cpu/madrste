"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  appointments,
  archivedDocuments,
  behaviorEntries,
  interventionPlans,
  parentMessages,
  unifiedStudentRecord,
} from "@/lib/school-insights"
import { fetchStudentProfilesData, saveStudentProfilesData } from "@/lib/school-api"
import type { StudentProfileRecord } from "@/lib/school-data"
import { CheckCircle2, FileArchive, MessageSquareMore, Save, School, ShieldAlert, Target } from "lucide-react"

type RiskLevel = "منخفض" | "متوسط" | "مرتفع"

interface StudentDirectoryItem {
  id: string
  name: string
  classroom: string
}

const studentEmailToName: Record<string, string> = {
  "student@example.com": "سارة أحمد",
  "student2@example.com": "نورة محمد",
}

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim()

export default function StudentProfilePage() {
  const { userType, userName, email } = useAuth()
  const { toast } = useToast()
  const isStudent = userType === "student"
  const canEdit = userType === "admin"
  const currentStudentName = normalizeText((email && studentEmailToName[email]) || userName || unifiedStudentRecord.name)

  const [studentDirectory, setStudentDirectory] = useState<StudentDirectoryItem[]>([])
  const [profiles, setProfiles] = useState<Record<string, StudentProfileRecord>>({})
  const [selectedStudentName, setSelectedStudentName] = useState(currentStudentName)
  const [draftProfile, setDraftProfile] = useState<StudentProfileRecord>({
    id: "seed-student",
    ...unifiedStudentRecord,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fallbackDirectory: StudentDirectoryItem[] = [
      { id: "1", name: unifiedStudentRecord.name, classroom: unifiedStudentRecord.className },
    ]
    const fallbackProfiles: Record<string, StudentProfileRecord> = {
      [normalizeText(unifiedStudentRecord.name)]: {
        id: "1",
        ...unifiedStudentRecord,
      },
    }

    let isMounted = true

    const loadProfiles = async () => {
      try {
        const response = await fetchStudentProfilesData()
        if (!isMounted) {
          return
        }

        const mappedDirectory = response.students.map((student, index) => ({
          id: student.id || `student-${index + 1}`,
          name: student.name || unifiedStudentRecord.name,
          classroom: student.classroom || unifiedStudentRecord.className,
        }))

        const mappedProfiles = Object.fromEntries(
          response.profiles.map((profile) => [
            normalizeText(profile.name),
            profile,
          ]),
        ) as Record<string, StudentProfileRecord>

        setStudentDirectory(mappedDirectory.length > 0 ? mappedDirectory : fallbackDirectory)
        setProfiles(Object.keys(mappedProfiles).length > 0 ? mappedProfiles : fallbackProfiles)
      } catch {
        if (!isMounted) {
          return
        }

        setProfiles(fallbackProfiles)
        setStudentDirectory(fallbackDirectory)
      }
    }

    void loadProfiles()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (isStudent) {
      setSelectedStudentName(currentStudentName)
    } else if (!selectedStudentName && studentDirectory.length > 0) {
      setSelectedStudentName(studentDirectory[0].name)
    }
  }, [currentStudentName, isStudent, selectedStudentName, studentDirectory])

  const selectedProfile = useMemo(() => {
    const selectedFromStorage = profiles[normalizeText(selectedStudentName)]
    if (selectedFromStorage) return selectedFromStorage

    const selectedFromDirectory = studentDirectory.find((student) => student.name === selectedStudentName)
    return {
      id: selectedFromDirectory?.id || "fallback-student",
      ...unifiedStudentRecord,
      name: selectedStudentName || unifiedStudentRecord.name,
      className: selectedFromDirectory?.classroom || unifiedStudentRecord.className,
    }
  }, [profiles, selectedStudentName, studentDirectory])

  useEffect(() => {
    setDraftProfile(selectedProfile)
  }, [selectedProfile])

  const filteredPlans = interventionPlans.filter((plan) => plan.studentName === selectedProfile.name)
  const filteredBehavior = behaviorEntries.filter((entry) => entry.studentName === selectedProfile.name)
  const filteredDocuments = archivedDocuments.filter((entry) => entry.studentName === selectedProfile.name)
  const filteredMessages = parentMessages.filter((entry) => entry.studentName === selectedProfile.name)
  const filteredAppointments = appointments.filter(
    (entry) => entry.title.includes(selectedProfile.name) || entry.title.includes("خطة علاجية"),
  )

  const saveProfile = async () => {
    const profileKey = normalizeText(selectedProfile.name)
    const previousProfiles = profiles
    const nextProfiles = {
      ...profiles,
      [profileKey]: {
        ...draftProfile,
        id: selectedProfile.id,
        name: selectedProfile.name,
      },
    }

    setProfiles(nextProfiles)
    setIsSaving(true)

    try {
      const response = await saveStudentProfilesData(Object.values(nextProfiles))
      const returnedProfiles = Object.fromEntries(
        response.profiles.map((profile) => [normalizeText(profile.name), profile]),
      ) as Record<string, StudentProfileRecord>

      setProfiles(returnedProfiles)
      toast({
        title: "تم حفظ الملف",
        description: `تم تحديث الملف الموحد للطالبة ${selectedProfile.name}`,
      })
    } catch (error) {
      setProfiles(previousProfiles)
      toast({
        title: "تعذر حفظ الملف",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ الملف الموحد",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">الملف الموحد للطالبة</h1>
          <p className="text-muted-foreground mt-1">عرض شامل للأداء الأكاديمي والحضور والسلوك والخطط والمراسلات</p>
        </div>

        <div className="flex items-center gap-2">
          {!isStudent && (
            <Select value={selectedStudentName} onValueChange={setSelectedStudentName}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="اختر الطالبة" />
              </SelectTrigger>
              <SelectContent>
                {studentDirectory.map((student) => (
                  <SelectItem key={student.id} value={student.name}>
                    {student.name} - {student.classroom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {canEdit && (
            <Button onClick={() => void saveProfile()} className="bg-[#0a8a74] hover:bg-[#097a67]" disabled={isSaving}>
              <Save className="ml-2 h-4 w-4" />
              {isSaving ? "جارٍ الحفظ..." : "حفظ الملف"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard title="الطالبة" value={selectedProfile.name} note={selectedProfile.className} />
        <SummaryCard title="متوسط الدرجات" value={`${selectedProfile.averageGrade}%`} note="آخر تحديث أكاديمي" />
        <SummaryCard title="نسبة الحضور" value={`${selectedProfile.attendanceRate}%`} note="الحضور الشهري" />
        <SummaryCard title="مستوى الخطورة" value={selectedProfile.riskLevel} note={selectedProfile.guardian} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="plans">الخطط</TabsTrigger>
          <TabsTrigger value="behavior">السلوك</TabsTrigger>
          <TabsTrigger value="documents">المستندات</TabsTrigger>
          <TabsTrigger value="communication">التواصل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" />
                  البيانات الأساسية
                </CardTitle>
                <CardDescription>ملف تعريفي موحد للطالبة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProfileField
                  label="اسم الطالبة"
                  value={draftProfile.name}
                  disabled
                  onChange={() => undefined}
                />
                <ProfileField
                  label="الفصل"
                  value={draftProfile.className}
                  disabled={!canEdit}
                  onChange={(value) => setDraftProfile((current) => ({ ...current, className: value }))}
                />
                <ProfileField
                  label="ولي الأمر"
                  value={draftProfile.guardian}
                  disabled={!canEdit}
                  onChange={(value) => setDraftProfile((current) => ({ ...current, guardian: value }))}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <NumericField
                    label="الحضور"
                    value={draftProfile.attendanceRate}
                    disabled={!canEdit}
                    onChange={(value) => setDraftProfile((current) => ({ ...current, attendanceRate: value }))}
                  />
                  <NumericField
                    label="الدرجات"
                    value={draftProfile.averageGrade}
                    disabled={!canEdit}
                    onChange={(value) => setDraftProfile((current) => ({ ...current, averageGrade: value }))}
                  />
                  <NumericField
                    label="السلوك"
                    value={draftProfile.behaviorScore}
                    disabled={!canEdit}
                    onChange={(value) => setDraftProfile((current) => ({ ...current, behaviorScore: value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>مستوى الخطورة</Label>
                  <Select
                    value={draftProfile.riskLevel}
                    onValueChange={(value) =>
                      setDraftProfile((current) => ({ ...current, riskLevel: value as RiskLevel }))
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="منخفض">منخفض</SelectItem>
                      <SelectItem value="متوسط">متوسط</SelectItem>
                      <SelectItem value="مرتفع">مرتفع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>نقاط القوة واحتياجات الدعم</CardTitle>
                <CardDescription>توصيف سريع يساعد على القرار التربوي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>نقاط القوة</Label>
                  <Textarea
                    value={draftProfile.strengths.join("\n")}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraftProfile((current) => ({
                        ...current,
                        strengths: e.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                      }))
                    }
                    rows={5}
                    dir="rtl"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>احتياجات الدعم</Label>
                  <Textarea
                    value={draftProfile.supportNeeds.join("\n")}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraftProfile((current) => ({
                        ...current,
                        supportNeeds: e.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                      }))
                    }
                    rows={5}
                    dir="rtl"
                    className="text-right"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <SectionCard
            title="الخطط العلاجية والإثرائية"
            description="إجراءات الدعم والتدخلات المعتمدة"
            icon={<Target className="h-5 w-5 text-primary" />}
            emptyMessage="لا توجد خطط مرتبطة بهذه الطالبة حالياً"
            items={filteredPlans.map((plan) => ({
              id: plan.id,
              title: `${plan.subject} - ${plan.status}`,
              lines: [`المسؤولة: ${plan.owner}`, `الاستحقاق: ${plan.dueDate}`, ...plan.actions],
              badge: plan.status,
            }))}
          />
        </TabsContent>

        <TabsContent value="behavior">
          <SectionCard
            title="السلوك والانضباط"
            description="ملاحظات إيجابية وتربوية واستدعاءات"
            icon={<ShieldAlert className="h-5 w-5 text-primary" />}
            emptyMessage="لا توجد سجلات سلوكية لهذه الطالبة"
            items={filteredBehavior.map((entry) => ({
              id: entry.id,
              title: entry.type,
              lines: [entry.note, entry.date],
              badge: entry.type,
            }))}
          />
        </TabsContent>

        <TabsContent value="documents">
          <SectionCard
            title="أرشيف المستندات"
            description="المرفقات والأعذار والخطط والنماذج"
            icon={<FileArchive className="h-5 w-5 text-primary" />}
            emptyMessage="لا توجد مستندات محفوظة لهذه الطالبة"
            items={filteredDocuments.map((document) => ({
              id: document.id,
              title: document.title,
              lines: [document.category, `آخر تحديث: ${document.updatedAt}`],
              badge: document.category,
            }))}
          />
        </TabsContent>

        <TabsContent value="communication">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <SectionCard
              title="التواصل مع ولي الأمر"
              description="متابعة الرسائل والطلبات"
              icon={<MessageSquareMore className="h-5 w-5 text-primary" />}
              emptyMessage="لا توجد رسائل مرتبطة بهذه الطالبة"
              items={filteredMessages.map((message) => ({
                id: message.id,
                title: message.parentName,
                lines: [message.subject, `آخر تحديث: ${message.lastUpdate}`],
                badge: message.status,
              }))}
            />

            <SectionCard
              title="المواعيد والمتابعات"
              description="الاجتماعات واللقاءات المجدولة"
              icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
              emptyMessage="لا توجد مواعيد مرتبطة بهذه الطالبة"
              items={filteredAppointments.map((appointment) => ({
                id: appointment.id,
                title: appointment.title,
                lines: [appointment.owner, appointment.date],
                badge: appointment.status,
              }))}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SummaryCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{note}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

function ProfileField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} dir="rtl" className="text-right" />
    </div>
  )
}

function NumericField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        value={value}
        min={0}
        max={100}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        disabled={disabled}
        dir="rtl"
        className="text-right"
      />
    </div>
  )
}

function SectionCard({
  title,
  description,
  icon,
  emptyMessage,
  items,
}: {
  title: string
  description: string
  icon: React.ReactNode
  emptyMessage: string
  items: Array<{ id: string; title: string; lines: string[]; badge: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">{emptyMessage}</p>}
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{item.title}</p>
              <Badge variant="outline">{item.badge}</Badge>
            </div>
            <div className="mt-2 space-y-1">
              {item.lines.map((line) => (
                <p key={line} className="text-sm text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
