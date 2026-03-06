"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { CheckCircle, XCircle, UserCheck, UserX, Eye, RefreshCw } from "lucide-react"
import { registrationStore, type RegistrationRequest } from "@/lib/registration-store"
import { usersStore } from "@/lib/users-store"

const addApprovedStudentToDirectory = (request: RegistrationRequest) => {
  if (request.userType !== "student") return

  try {
    const raw = localStorage.getItem("studentsData")
    const existing = raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : []
    const students = Array.isArray(existing) ? existing : []

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
    })

    localStorage.setItem("studentsData", JSON.stringify(students))
  } catch {
    // ignore local storage failures
  }
}

export default function UserApprovalsPage() {
  const { toast } = useToast()
  const { userType, approveUser, rejectUser } = useAuth()
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [currentRequest, setCurrentRequest] = useState<RegistrationRequest | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // جلب طلبات التسجيل من المخزن
  useEffect(() => {
    // جلب الطلبات الأولية
    setRequests(registrationStore.getRequests())

    // الاشتراك في التحديثات
    const unsubscribe = registrationStore.subscribe(() => {
      setRequests(registrationStore.getRequests())
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // تعديل وظيفة refreshRequests لتحسين تحديث قائمة الطلبات
  const refreshRequests = () => {
    setIsLoading(true)

    // محاكاة تأخير الشبكة
    setTimeout(() => {
      // الحصول على أحدث الطلبات من المخزن
      const updatedRequests = registrationStore.getRequests()
      console.log("الطلبات المحدثة:", updatedRequests)

      setRequests([...updatedRequests]) // استخدام نسخة جديدة من المصفوفة لضمان إعادة العرض
      setIsLoading(false)

      toast({
        title: "تم تحديث الطلبات",
        description: "تم تحديث قائمة طلبات التسجيل بنجاح",
      })
    }, 500)
  }

  // التحقق من صلاحيات المستخدم
  if (userType !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-2xl font-bold text-red-600 mb-4">غير مصرح بالوصول</h1>
        <p className="text-gray-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
      </div>
    )
  }

  // الموافقة على طلب التسجيل
  const handleApproveRequest = () => {
    if (!currentRequest) return

    try {
      // تحديث حالة الطلب في مخزن الطلبات
      const updateSuccess = registrationStore.updateRequestStatus(currentRequest.id, "approved")

      if (!updateSuccess) {
        throw new Error("فشل تحديث حالة الطلب")
      }

      // البحث عن المستخدم في مخزن المستخدمين
      const user = usersStore.getUserByEmail(currentRequest.email)

      if (user) {
        // تحديث حالة المستخدم إلى معتمد
        usersStore.approveUser(currentRequest.email)
      } else {
        // إذا لم يكن المستخدم موجوداً في المخزن، أضفه
        usersStore.addUser({
          name: currentRequest.name,
          email: currentRequest.email,
          password: "password123", // كلمة مرور افتراضية
          userType: currentRequest.userType,
          phoneNumber: currentRequest.phoneNumber,
          isApproved: true,
        })
      }

      // استدعاء وظيفة الموافقة من مزود المصادقة
      approveUser(currentRequest.email)
      addApprovedStudentToDirectory(currentRequest)

      // إغلاق مربع الحوار وعرض رسالة نجاح
      setApproveDialogOpen(false)
      toast({
        title: "تمت الموافقة بنجاح",
        description: `تمت الموافقة على حساب ${currentRequest.name}`,
        variant: "default",
      })

      // تحديث قائمة الطلبات
      refreshRequests()
    } catch (error) {
      console.error("Error approving user:", error)
      toast({
        title: "حدث خطأ",
        description: "حدث خطأ أثناء الموافقة على الطلب",
        variant: "destructive",
      })
    }
  }

  // رفض طلب التسجيل
  const handleRejectRequest = () => {
    if (!currentRequest) return

    try {
      // تحديث حالة الطلب في مخزن الطلبات
      registrationStore.updateRequestStatus(currentRequest.id, "rejected")

      // حذف المستخدم من مخزن المستخدمين إذا كان موجوداً
      usersStore.deleteUser(currentRequest.email)

      // استدعاء وظيفة الرفض من مزود المصادقة
      rejectUser(currentRequest.email)

      // إغلاق مربع الحوار وعرض رسالة نجاح
      setRejectDialogOpen(false)
      toast({
        title: "تم الرفض",
        description: `تم رفض حساب ${currentRequest.name}`,
        variant: "destructive",
      })

      // تحديث قائمة الطلبات
      setRequests(registrationStore.getRequests())
    } catch (error) {
      console.error("Error rejecting user:", error)
      toast({
        title: "حدث خطأ",
        description: "حدث خطأ أثناء رفض الطلب",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة طلبات التسجيل</h1>
          <p className="text-gray-500 mt-1">الموافقة على طلبات التسجيل الجديدة ورفضها</p>
        </div>
        <Button
          onClick={refreshRequests}
          variant="outline"
          className="flex items-center gap-2 border-[#0a8a74] text-[#0a8a74]"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          تحديث الطلبات
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>طلبات التسجيل</CardTitle>
          <CardDescription>
            إجمالي الطلبات: {requests.length} | في الانتظار: {requests.filter((req) => req.status === "pending").length}{" "}
            | تمت الموافقة: {requests.filter((req) => req.status === "approved").length} | مرفوضة:{" "}
            {requests.filter((req) => req.status === "rejected").length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">في الانتظار</TabsTrigger>
              <TabsTrigger value="approved">تمت الموافقة</TabsTrigger>
              <TabsTrigger value="rejected">مرفوضة</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <RequestsTable
                requests={requests.filter((req) => req.status === "pending")}
                setCurrentRequest={setCurrentRequest}
                setViewDialogOpen={setViewDialogOpen}
                setApproveDialogOpen={setApproveDialogOpen}
                setRejectDialogOpen={setRejectDialogOpen}
              />
            </TabsContent>

            <TabsContent value="approved">
              <RequestsTable
                requests={requests.filter((req) => req.status === "approved")}
                setCurrentRequest={setCurrentRequest}
                setViewDialogOpen={setViewDialogOpen}
                setApproveDialogOpen={setApproveDialogOpen}
                setRejectDialogOpen={setRejectDialogOpen}
                hideActions
              />
            </TabsContent>

            <TabsContent value="rejected">
              <RequestsTable
                requests={requests.filter((req) => req.status === "rejected")}
                setCurrentRequest={setCurrentRequest}
                setViewDialogOpen={setViewDialogOpen}
                setApproveDialogOpen={setApproveDialogOpen}
                setRejectDialogOpen={setRejectDialogOpen}
                hideActions
              />
            </TabsContent>

            <TabsContent value="all">
              <RequestsTable
                requests={requests}
                setCurrentRequest={setCurrentRequest}
                setViewDialogOpen={setViewDialogOpen}
                setApproveDialogOpen={setApproveDialogOpen}
                setRejectDialogOpen={setRejectDialogOpen}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* مربع حوار عرض تفاصيل الطلب */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل طلب التسجيل</DialogTitle>
            <DialogDescription>عرض معلومات طلب التسجيل</DialogDescription>
          </DialogHeader>

          {currentRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-medium">{currentRequest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium">{currentRequest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">نوع المستخدم</p>
                  <p className="font-medium">{currentRequest.userType === "teacher" ? "معلم/ة" : "طالب/ة"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">رقم الجوال</p>
                  <p className="font-medium" dir="ltr">
                    {currentRequest.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                  <p className="font-medium">{currentRequest.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الحالة</p>
                  <StatusBadge status={currentRequest.status} />
                </div>
              </div>

              {currentRequest.status === "pending" && (
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                      setViewDialogOpen(false)
                      setRejectDialogOpen(true)
                    }}
                  >
                    <UserX className="ml-2 h-4 w-4" />
                    رفض
                  </Button>
                  <Button
                    onClick={() => {
                      setViewDialogOpen(false)
                      setApproveDialogOpen(true)
                    }}
                    className="bg-[#0a8a74] hover:bg-[#097a67]"
                  >
                    <UserCheck className="ml-2 h-4 w-4" />
                    موافقة
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction onClick={handleApproveRequest} className="bg-[#0a8a74]">
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

// مكون جدول طلبات التسجيل
function RequestsTable({
  requests,
  setCurrentRequest,
  setViewDialogOpen,
  setApproveDialogOpen,
  setRejectDialogOpen,
  hideActions = false,
}: {
  requests: RegistrationRequest[]
  setCurrentRequest: (request: RegistrationRequest) => void
  setViewDialogOpen: (open: boolean) => void
  setApproveDialogOpen: (open: boolean) => void
  setRejectDialogOpen: (open: boolean) => void
  hideActions?: boolean
}) {
  return (
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCurrentRequest(request)
                        setViewDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">عرض</span>
                    </Button>

                    {!hideActions && request.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => {
                            setCurrentRequest(request)
                            setApproveDialogOpen(true)
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="sr-only">موافقة</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setCurrentRequest(request)
                            setRejectDialogOpen(true)
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">رفض</span>
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
