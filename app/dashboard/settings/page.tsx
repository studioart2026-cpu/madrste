"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { BellRing, Lock, Save, User, UserCheck, UserX, Shield, Users } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useToast } from "@/hooks/use-toast"
import { NOTIFICATION_SOUND_ENABLED_KEY } from "@/lib/notification-sound"
import { fetchStudents, saveStudents } from "@/lib/school-api"
import type { RegistrationRequest } from "@/lib/auth-types"
import type { ManagedStudent } from "@/lib/student-roster"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const addApprovedStudentToDirectory = async (request: RegistrationRequest) => {
  if (request.userType !== "student") return

  try {
    const response = await fetchStudents()
    const students = Array.isArray(response.students) ? response.students : []

    const normalizedName = request.name.trim()
    const normalizedPhone = (request.phoneNumber || "").replace(/\D/g, "")
    const alreadyExists = students.some((student) => {
      const name = typeof student.name === "string" ? student.name.trim() : ""
      const parentPhone = typeof student.parentPhone === "string" ? student.parentPhone.replace(/\D/g, "") : ""
      return name === normalizedName || (normalizedPhone.length > 0 && parentPhone === normalizedPhone)
    })
    if (alreadyExists) return

    const nextId =
      Math.max(
        0,
        ...students
          .map((student) => Number.parseInt(String(student.id ?? "0"), 10))
          .filter((value) => Number.isFinite(value)),
      ) + 1

    const nextStudentId =
      Math.max(
        10000,
        ...students
          .map((student) => Number.parseInt(String(student.studentId ?? "0"), 10))
          .filter((value) => Number.isFinite(value)),
      ) + 1

    students.push({
      id: nextId.toString(),
      name: normalizedName,
      studentId: nextStudentId.toString(),
      grade: "أول متوسط",
      classroom: "١/١",
      parentPhone: request.phoneNumber || "",
      status: "نشط",
      birthDate: "",
      address: "",
      attendance: 100,
      academicPerformance: 85,
      behaviorRating: 90,
      joinDate: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString().split("T")[0],
      activities: [],
      notes: "تمت إضافتها تلقائيًا بعد الموافقة على التسجيل",
    } satisfies ManagedStudent)

    await saveStudents(students)
  } catch {
    // ignore sync failures here and allow approval flow to continue
  }
}

export default function SettingsPage() {
  const { userName, userType, email, refreshSession, approveUser, rejectUser, isReady } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [name, setName] = useState(userName || "")
  const [userEmail, setUserEmail] = useState(email || "")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(true)
  const [fontSize, setFontSize] = useState("medium")
  const [language, setLanguage] = useState("ar")

  // حالة طلبات التسجيل
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [currentRequest, setCurrentRequest] = useState<RegistrationRequest | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  // حالة إعدادات الأمان
  const [requireEmailVerification, setRequireEmailVerification] = useState(true)
  const [requireAdminApproval, setRequireAdminApproval] = useState(true)
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5")
  const [passwordExpiration, setPasswordExpiration] = useState("90")
  const [minPasswordLength, setMinPasswordLength] = useState("8")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [principalPassword, setPrincipalPassword] = useState("")
  const [confirmPrincipalPassword, setConfirmPrincipalPassword] = useState("")

  useEffect(() => {
    setName(userName || "")
    setUserEmail(email || "")
  }, [email, userName])

  useEffect(() => {
    try {
      if (email) {
        const storedProfileImage = localStorage.getItem(`profile-image:${email}`)
        setProfileImage(storedProfileImage || null)
      }

      const storedNotificationsEnabled = localStorage.getItem("notifications-enabled")
      const storedEmailNotifications = localStorage.getItem("email-notifications-enabled")
      const storedSoundNotifications = localStorage.getItem(NOTIFICATION_SOUND_ENABLED_KEY)

      if (storedNotificationsEnabled !== null) {
        setNotificationsEnabled(storedNotificationsEnabled === "true")
      }

      if (storedEmailNotifications !== null) {
        setEmailNotifications(storedEmailNotifications === "true")
      }

      if (storedSoundNotifications !== null) {
        setNotificationSoundEnabled(storedSoundNotifications === "true")
      }
    } catch {
      // ignore storage load failures
    }
  }, [])

  useEffect(() => {
    if (!isReady || userType !== "admin") {
      return
    }

    void loadRequests(true)
  }, [isReady, userType])

  // حفظ الإعدادات
  const saveSettings = () => {
    try {
      localStorage.setItem("notifications-enabled", notificationsEnabled.toString())
      localStorage.setItem("email-notifications-enabled", emailNotifications.toString())
      localStorage.setItem(NOTIFICATION_SOUND_ENABLED_KEY, notificationSoundEnabled.toString())
    } catch {
      // ignore storage save failures
    }

    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ إعدادات النظام بنجاح",
      variant: "default",
    })
  }

  const loadRequests = async (silent = false) => {
    try {
      const response = await fetch("/api/admin/registration-requests", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      })

      const data = (await response.json()) as { requests?: RegistrationRequest[]; error?: string }
      if (!response.ok || !data.requests) {
        throw new Error(data.error || "تعذر تحميل طلبات التسجيل")
      }

      setRequests(data.requests)

      if (!silent) {
        toast({
          title: "تم تحديث الطلبات",
          description: "تم تحميل أحدث طلبات التسجيل",
        })
      }
    } catch (error) {
      toast({
        title: "تعذر تحميل الطلبات",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive",
      })
    }
  }

  // حفظ إعدادات الحساب
  const saveAccountSettings = async () => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name,
          email: userEmail,
        }),
      })

      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data.error || "تعذر تحديث معلومات الحساب")
      }

      if (email && email !== userEmail) {
        const previousImage = localStorage.getItem(`profile-image:${email}`)
        if (previousImage) {
          localStorage.setItem(`profile-image:${userEmail}`, previousImage)
          localStorage.removeItem(`profile-image:${email}`)
        }
      }

      if (profileImage && userEmail) {
        localStorage.setItem(`profile-image:${userEmail}`, profileImage)
      } else if (userEmail) {
        localStorage.removeItem(`profile-image:${userEmail}`)
      }

      await refreshSession()
      window.dispatchEvent(new Event("profile-updated"))
    } catch (error) {
      toast({
        title: "تعذر تحديث الحساب",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ معلومات الحساب",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "تم حفظ معلومات الحساب",
      description: "تم تحديث معلومات الحساب بنجاح",
      variant: "default",
    })
  }

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "ملف غير صالح",
        description: "يرجى اختيار صورة فقط.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null
      setProfileImage(result)
    }
    reader.readAsDataURL(file)
  }

  // تغيير كلمة المرور
  const changePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "تأكيد كلمة المرور غير مطابق",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data.error || "تعذر تغيير كلمة المرور")
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "تعذر تغيير كلمة المرور",
        variant: "destructive",
      })
      return
    }

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    toast({
      title: "تم تغيير كلمة المرور",
      description: "تم تغيير كلمة المرور بنجاح",
      variant: "default",
    })
  }

  const changePrincipalPassword = async () => {
    if (userType !== "admin") return

    if (!principalPassword || principalPassword.length < 8) {
      toast({
        title: "خطأ",
        description: "كلمة مرور المديرة يجب أن تكون 8 أحرف على الأقل",
        variant: "destructive",
      })
      return
    }

    if (principalPassword !== confirmPrincipalPassword) {
      toast({
        title: "خطأ",
        description: "تأكيد كلمة مرور المديرة غير مطابق",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          targetEmail: "principal@school.edu.sa",
          newPassword: principalPassword,
        }),
      })

      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data.error || "تعذر تغيير كلمة مرور المديرة")
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "تعذر تغيير كلمة مرور المديرة",
        variant: "destructive",
      })
      return
    }

    setPrincipalPassword("")
    setConfirmPrincipalPassword("")
    toast({
      title: "تم التحديث",
      description: "تم تغيير كلمة مرور المديرة بنجاح",
    })
  }

  // حفظ إعدادات الأمان
  const saveSecuritySettings = () => {
    toast({
      title: "تم حفظ إعدادات الأمان",
      description: "تم تحديث إعدادات الأمان بنجاح",
      variant: "default",
    })
  }

  // الموافقة على طلب التسجيل
  const handleApproveRequest = async () => {
    if (!currentRequest) return

    try {
      await approveUser(currentRequest.id)
      await addApprovedStudentToDirectory(currentRequest)
      setApproveDialogOpen(false)
      toast({
        title: "تمت الموافقة بنجاح",
        description: `تمت الموافقة على حساب ${currentRequest.name}`,
        variant: "default",
      })
      await loadRequests(true)
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: error instanceof Error ? error.message : "تعذر الموافقة على الطلب",
        variant: "destructive",
      })
    }
  }

  // رفض طلب التسجيل
  const handleRejectRequest = async () => {
    if (!currentRequest) return

    try {
      await rejectUser(currentRequest.id)
      setRejectDialogOpen(false)
      toast({
        title: "تم الرفض",
        description: `تم رفض حساب ${currentRequest.name}`,
        variant: "destructive",
      })
      await loadRequests(true)
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: error instanceof Error ? error.message : "تعذر رفض الطلب",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-gray-500 mt-1">إدارة إعدادات الحساب والنظام</p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">الحساب</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          {userType === "admin" && <TabsTrigger value="registration">طلبات التسجيل</TabsTrigger>}
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>معلومات الحساب</CardTitle>
              </div>
              <CardDescription>تعديل معلومات الحساب الشخصية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileImage">صورة الحساب</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full border bg-slate-50">
                    {profileImage ? (
                      <img src={profileImage} alt="صورة المستخدم" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        بدون صورة
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input id="profileImage" type="file" accept="image/*" onChange={handleProfileImageChange} />
                    {profileImage && (
                      <Button type="button" variant="outline" size="sm" onClick={() => setProfileImage(null)}>
                        حذف الصورة
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userType">نوع المستخدم</Label>
                <Input
                  id="userType"
                  value={
                    userType === "admin"
                      ? "مدير النظام"
                      : userType === "vice_admin"
                        ? "وكيل/ة الإدارة"
                        : userType === "teacher"
                          ? "معلم/ة"
                          : "طالب/ة"
                  }
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">نبذة تعريفية</Label>
                <Textarea id="bio" placeholder="أدخل نبذة تعريفية عنك" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveAccountSettings}>
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>الأمان</CardTitle>
              </div>
              <CardDescription>إدارة كلمة المرور وإعدادات الأمان</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {userType === "admin" && (
                <div className="space-y-2 border-t pt-4">
                  <Label htmlFor="principalPassword">كلمة مرور المديرة الجديدة</Label>
                  <Input
                    id="principalPassword"
                    type="password"
                    value={principalPassword}
                    onChange={(e) => setPrincipalPassword(e.target.value)}
                    placeholder="تحديث كلمة مرور حساب المديرة"
                  />
                  <Label htmlFor="confirmPrincipalPassword">تأكيد كلمة مرور المديرة</Label>
                  <Input
                    id="confirmPrincipalPassword"
                    type="password"
                    value={confirmPrincipalPassword}
                    onChange={(e) => setConfirmPrincipalPassword(e.target.value)}
                    placeholder="أعيدي كتابة كلمة مرور المديرة"
                  />
                  <Button type="button" variant="outline" onClick={changePrincipalPassword}>
                    تحديث كلمة مرور المديرة
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={changePassword}>تغيير كلمة المرور</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-primary" />
                <CardTitle>إعدادات الإشعارات</CardTitle>
              </div>
              <CardDescription>تخصيص إعدادات الإشعارات والتنبيهات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">تفعيل الإشعارات</Label>
                  <p className="text-sm text-muted-foreground">استلام إشعارات النظام المختلفة</p>
                </div>
                <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">استلام الإشعارات عبر البريد الإلكتروني</p>
                </div>
                <Switch id="emailNotifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notificationSoundEnabled">صوت الإشعارات</Label>
                  <p className="text-sm text-muted-foreground">تشغيل نغمة هادئة عند وصول إشعار أو تحديث جديد</p>
                </div>
                <Switch
                  id="notificationSoundEnabled"
                  checked={notificationSoundEnabled}
                  onCheckedChange={setNotificationSoundEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notificationTypes">أنواع الإشعارات</Label>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch id="attendance" defaultChecked />
                    <Label htmlFor="attendance">إشعارات الحضور والغياب</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch id="grades" defaultChecked />
                    <Label htmlFor="grades">إشعارات الدرجات والاختبارات</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch id="homework" defaultChecked />
                    <Label htmlFor="homework">إشعارات الواجبات المنزلية</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch id="announcements" defaultChecked />
                    <Label htmlFor="announcements">الإعلانات والتنبيهات العامة</Label>
                  </div>
                  {userType === "admin" && (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch id="registrationRequests" defaultChecked />
                      <Label htmlFor="registrationRequests">طلبات التسجيل الجديدة</Label>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveSettings}>حفظ الإعدادات</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات المظهر</CardTitle>
              <CardDescription>تخصيص مظهر النظام وواجهة المستخدم</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">السمة</Label>
                <Select value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="اختر السمة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">فاتح</SelectItem>
                    <SelectItem value="dark">داكن</SelectItem>
                    <SelectItem value="system">حسب النظام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fontSize">حجم الخط</Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger id="fontSize">
                    <SelectValue placeholder="اختر حجم الخط" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">صغير</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="large">كبير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">اللغة</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="اختر اللغة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">الإنجليزية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveSettings}>حفظ الإعدادات</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>إعدادات الأمان</CardTitle>
              </div>
              <CardDescription>إدارة إعدادات الأمان وسياسات تسجيل الدخول</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailVerification">التحقق من البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">طلب تأكيد البريد الإلكتروني للمستخدمين الجدد</p>
                </div>
                <Switch
                  id="emailVerification"
                  checked={requireEmailVerification}
                  onCheckedChange={setRequireEmailVerification}
                  disabled={userType !== "admin"}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="adminApproval">موافقة المدير</Label>
                  <p className="text-sm text-muted-foreground">طلب موافقة المدير على الحسابات الجديدة</p>
                </div>
                <Switch
                  id="adminApproval"
                  checked={requireAdminApproval}
                  onCheckedChange={setRequireAdminApproval}
                  disabled={userType !== "admin"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">الحد الأقصى لمحاولات تسجيل الدخول</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(e.target.value)}
                  disabled={userType !== "admin"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordExpiration">مدة صلاحية كلمة المرور (بالأيام)</Label>
                <Input
                  id="passwordExpiration"
                  type="number"
                  value={passwordExpiration}
                  onChange={(e) => setPasswordExpiration(e.target.value)}
                  disabled={userType !== "admin"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPasswordLength">الحد الأدنى لطول كلمة المرور</Label>
                <Input
                  id="minPasswordLength"
                  type="number"
                  value={minPasswordLength}
                  onChange={(e) => setMinPasswordLength(e.target.value)}
                  disabled={userType !== "admin"}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveSecuritySettings} disabled={userType !== "admin"}>
                حفظ إعدادات الأمان
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {userType === "admin" && (
          <TabsContent value="registration">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>طلبات التسجيل</CardTitle>
                </div>
                <CardDescription>
                  إدارة طلبات التسجيل الجديدة | في الانتظار: {requests.filter((req) => req.status === "pending").length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">البريد الإلكتروني</TableHead>
                        <TableHead className="text-right">نوع المستخدم</TableHead>
                        <TableHead className="text-right">تاريخ الطلب</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.length > 0 ? (
                        requests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.name}</TableCell>
                            <TableCell>{request.email}</TableCell>
                            <TableCell>{request.userType === "teacher" ? "معلم/ة" : "طالب/ة"}</TableCell>
                            <TableCell>{request.date}</TableCell>
                            <TableCell>
                              <StatusBadge status={request.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {request.status === "pending" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => {
                                        setCurrentRequest(request)
                                        setApproveDialogOpen(true)
                                      }}
                                    >
                                      <UserCheck className="ml-1 h-4 w-4" />
                                      موافقة
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => {
                                        setCurrentRequest(request)
                                        setRejectDialogOpen(true)
                                      }}
                                    >
                                      <UserX className="ml-1 h-4 w-4" />
                                      رفض
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            لا توجد طلبات تسجيل
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* مربع حوار تأكيد الموافقة */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الموافقة على الطلب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من الموافقة على طلب {currentRequest?.name}؟ سيتمكن المستخدم من الوصول إلى النظام بعد
              الموافقة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleApproveRequest} className="bg-primary">
              تأكيد الموافقة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* مربع حوار تأكيد الرفض */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد رفض الطلب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رفض طلب {currentRequest?.name}؟ لن يتمكن المستخدم من الوصول إلى النظام بعد الرفض.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectRequest} className="bg-destructive text-destructive-foreground">
              تأكيد الرفض
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// مكون شارة الحالة
function StatusBadge({ status }: { status: RegistrationRequest["status"] }) {
  if (status === "pending") {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        في الانتظار
      </Badge>
    )
  } else if (status === "approved") {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        تمت الموافقة
      </Badge>
    )
  } else {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        مرفوض
      </Badge>
    )
  }
}
