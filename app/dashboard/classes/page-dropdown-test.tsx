"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash, User, Settings, LogOut } from "lucide-react"

export default function DropdownTestPage() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">اختبار مكون DropdownMenu</h1>

      <div className="space-y-8">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">اختبار DropdownMenu البسيط</h2>
          <p className="text-muted-foreground mb-6">هذا اختبار لمكون DropdownMenu للتحقق من عمله بشكل صحيح.</p>

          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">فتح القائمة</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedAction("profile")}>
                  <User className="mr-2 h-4 w-4" />
                  الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedAction("settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedAction("logout")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedAction && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p>
                تم اختيار:{" "}
                <strong>
                  {selectedAction === "profile"
                    ? "الملف الشخصي"
                    : selectedAction === "settings"
                      ? "الإعدادات"
                      : selectedAction === "logout"
                        ? "تسجيل الخروج"
                        : selectedAction}
                </strong>
              </p>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">اختبار DropdownMenu في سياق الجدول</h2>
          <p className="text-muted-foreground mb-6">هذا اختبار لمكون DropdownMenu كما يستخدم في صفحة الفصول.</p>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    اسم الفصل
                  </th>
                  <th scope="col" className="px-6 py-3">
                    المعلم
                  </th>
                  <th scope="col" className="px-6 py-3">
                    عدد الطلاب
                  </th>
                  <th scope="col" className="px-6 py-3">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-card border-b">
                  <td className="px-6 py-4 font-medium">الصف الأول أ</td>
                  <td className="px-6 py-4">أ. فاطمة محمد</td>
                  <td className="px-6 py-4">25</td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedAction("edit-class-1")}>
                          <Pencil className="mr-2 h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedAction("delete-class-1")}>
                          <Trash className="mr-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
                <tr className="bg-card border-b">
                  <td className="px-6 py-4 font-medium">الصف الثاني ب</td>
                  <td className="px-6 py-4">أ. نورة أحمد</td>
                  <td className="px-6 py-4">22</td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedAction("edit-class-2")}>
                          <Pencil className="mr-2 h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedAction("delete-class-2")}>
                          <Trash className="mr-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {selectedAction && selectedAction.startsWith("edit-class") && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p>
                تم اختيار تعديل الفصل:{" "}
                <strong>
                  {selectedAction === "edit-class-1"
                    ? "الصف الأول أ"
                    : selectedAction === "edit-class-2"
                      ? "الصف الثاني ب"
                      : selectedAction}
                </strong>
              </p>
            </div>
          )}

          {selectedAction && selectedAction.startsWith("delete-class") && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-md border border-destructive/20">
              <p className="text-destructive">
                تم اختيار حذف الفصل:{" "}
                <strong>
                  {selectedAction === "delete-class-1"
                    ? "الصف الأول أ"
                    : selectedAction === "delete-class-2"
                      ? "الصف الثاني ب"
                      : selectedAction}
                </strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
