"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, MoreHorizontal, Trash, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import type { AdminManagedUser, ManagedUserStatus, UserType } from "@/lib/auth-types"

type User = AdminManagedUser

const roleLabels: Record<UserType, string> = {
  admin: "مدير النظام",
  vice_admin: "وكيل/ة الإدارة",
  teacher: "معلم/ة",
  student: "طالب/ة",
  parent: "ولي أمر",
}

const statusLabels: Record<ManagedUserStatus, string> = {
  active: "نشط",
  pending: "معلق",
  inactive: "غير نشط",
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "teacher" as UserType,
    status: "active" as ManagedUserStatus,
    phoneNumber: "",
    password: "",
  })

  const loadUsers = async (showSuccessToast = false) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      })

      const data = (await response.json()) as { users?: User[]; error?: string }
      if (!response.ok || !data.users) {
        throw new Error(data.error || "تعذر تحميل المستخدمين")
      }

      setUsers(data.users)

      if (showSuccessToast) {
        toast({
          title: "تم تحديث المستخدمين",
          description: "تم تحميل أحدث بيانات الحسابات",
        })
      }
    } catch (error) {
      if (showSuccessToast) {
        toast({
          title: "تعذر تحميل المستخدمين",
          description: error instanceof Error ? error.message : "حدث خطأ أثناء تحميل المستخدمين",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers(false)
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.name.includes(searchQuery) ||
      user.email.includes(searchQuery) ||
      roleLabels[user.role].includes(searchQuery) ||
      statusLabels[user.status].includes(searchQuery),
  )

  const resetNewUser = () => {
    setNewUser({
      name: "",
      email: "",
      role: "teacher",
      status: "active",
      phoneNumber: "",
      password: "",
    })
  }

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(newUser),
      })

      const data = (await response.json()) as { user?: User; error?: string }
      if (!response.ok || !data.user) {
        throw new Error(data.error || "تعذر إضافة المستخدم")
      }

      const createdUser = data.user
      setUsers((current) => [...current, createdUser].sort((left, right) => left.name.localeCompare(right.name, "ar")))
      setIsAddDialogOpen(false)
      resetNewUser()
      toast({
        title: "تم إضافة المستخدم",
        description: `تم إضافة ${createdUser.name} بنجاح`,
      })
    } catch (error) {
      toast({
        title: "تعذر إضافة المستخدم",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إضافة المستخدم",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditUser = async () => {
    if (!editingUser) return

    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          status: editingUser.status,
          phoneNumber: editingUser.phoneNumber || "",
        }),
      })

      const data = (await response.json()) as { user?: User; error?: string }
      if (!response.ok || !data.user) {
        throw new Error(data.error || "تعذر تحديث المستخدم")
      }

      const updatedUser = data.user
      setUsers((current) =>
        current
          .map((user) => (user.id === updatedUser.id ? updatedUser : user))
          .sort((left, right) => left.name.localeCompare(right.name, "ar")),
      )
      setIsEditDialogOpen(false)
      setEditingUser(null)
      toast({
        title: "تم تحديث المستخدم",
        description: `تم تحديث ${updatedUser.name} بنجاح`,
      })
    } catch (error) {
      toast({
        title: "تعذر تحديث المستخدم",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث المستخدم",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    const userToDelete = users.find((user) => user.id === id)
    if (!userToDelete) return

    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      })

      const data = (await response.json()) as { success?: boolean; error?: string }
      if (!response.ok || !data.success) {
        throw new Error(data.error || "تعذر حذف المستخدم")
      }

      setUsers((current) => current.filter((user) => user.id !== id))
      toast({
        title: "تم حذف المستخدم",
        description: `تم حذف ${userToDelete.name} بنجاح`,
        variant: "destructive",
      })
    } catch (error) {
      toast({
        title: "تعذر حذف المستخدم",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getRoleBadge = (role: UserType) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-blue-500">مدير</Badge>
      case "vice_admin":
        return <Badge className="bg-sky-500">وكيل/ة</Badge>
      case "teacher":
        return <Badge className="bg-green-500">معلم/ة</Badge>
      case "student":
        return <Badge className="bg-amber-500">طالب/ة</Badge>
      default:
        return <Badge variant="outline">{roleLabels[role]}</Badge>
    }
  }

  const getStatusBadge = (status: ManagedUserStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">نشط</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            معلق
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="text-gray-500 border-gray-500">
            غير نشط
          </Badge>
        )
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="بحث..."
              className="w-64 pl-8 rtl:pr-8 rtl:pl-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => void loadUsers(true)} disabled={isLoading || isSaving}>
            تحديث
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                إضافة مستخدم
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                <DialogDescription>أدخل معلومات المستخدم الجديد ثم احفظها.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">رقم الجوال</Label>
                  <Input
                    id="phoneNumber"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">الدور</Label>
                  <Select value={newUser.role} onValueChange={(value: UserType) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير النظام</SelectItem>
                      <SelectItem value="vice_admin">وكيل/ة الإدارة</SelectItem>
                      <SelectItem value="teacher">معلم/ة</SelectItem>
                      <SelectItem value="student">طالب/ة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select
                    value={newUser.status}
                    onValueChange={(value: ManagedUserStatus) => setNewUser({ ...newUser, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="pending">معلق</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => void handleAddUser()} disabled={isSaving}>
                  حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>آخر نشاط</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingUser(user)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => void handleDeleteUser(user.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {isLoading ? "جاري تحميل المستخدمين..." : "لا توجد نتائج مطابقة"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
            <DialogDescription>قم بتعديل معلومات المستخدم ثم احفظها.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">الاسم</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">رقم الجوال</Label>
                <Input
                  id="edit-phone"
                  value={editingUser.phoneNumber || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">الدور</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: UserType) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير النظام</SelectItem>
                    <SelectItem value="vice_admin">وكيل/ة الإدارة</SelectItem>
                    <SelectItem value="teacher">معلم/ة</SelectItem>
                    <SelectItem value="student">طالب/ة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">الحالة</Label>
                <Select
                  value={editingUser.status}
                  onValueChange={(value: ManagedUserStatus) => setEditingUser({ ...editingUser, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="pending">معلق</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => void handleEditUser()} disabled={isSaving}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
