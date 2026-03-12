"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DialogTestPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState("")

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">اختبار مكون Dialog</h1>

      <div className="space-y-8">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">اختبار Dialog البسيط</h2>
          <p className="text-muted-foreground mb-6">هذا اختبار لمكون Dialog للتحقق من عمله بشكل صحيح.</p>

          <Dialog>
            <DialogTrigger asChild>
              <Button>فتح الحوار</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>عنوان الحوار</DialogTitle>
                <DialogDescription>هذا وصف للحوار. يمكن أن يحتوي على معلومات إضافية.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>محتوى الحوار يظهر هنا.</p>
              </div>
              <DialogFooter>
                <Button>حفظ</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">اختبار Dialog مع حالة</h2>
          <p className="text-muted-foreground mb-6">هذا اختبار لمكون Dialog مع التحكم في حالة الفتح والإغلاق.</p>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>فتح الحوار مع حالة</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إدخال الاسم</DialogTitle>
                <DialogDescription>أدخل اسمك في الحقل أدناه.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">الاسم</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={() => {
                    alert(`تم إدخال الاسم: ${name}`)
                    setIsDialogOpen(false)
                  }}
                >
                  حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {name && (
            <p className="mt-4">
              الاسم المدخل: <strong>{name}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
