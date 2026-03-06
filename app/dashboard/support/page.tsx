"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HelpCircle, MessageSquare, Phone, Mail, FileText, ExternalLink } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SupportPage() {
  const { userName, email } = useAuth()
  const { toast } = useToast()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [issueType, setIssueType] = useState("")

  const handleContactEmail = (e: React.FormEvent) => {
    e.preventDefault()

    // بناء رابط البريد الإلكتروني مع البيانات
    const mailtoSubject = encodeURIComponent(`[نظام إدارة المدرسة] ${subject || "استفسار"}`)
    const mailtoBody = encodeURIComponent(`
      الاسم: ${userName || ""}
      البريد الإلكتروني: ${email || ""}
      نوع المشكلة: ${issueType || ""}
      
      ${message || ""}
      
      ----------------------------------------
      تم إرسال هذه الرسالة من نظام إدارة المدرسة المتوسطة ١٣٦
    `)

    // فتح البريد الإلكتروني في نافذة جديدة لتجنب المشاكل في التطبيق
    window.open(`mailto:mohamm3dalfeel@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`, "_blank")

    // عرض رسالة نجاح
    toast({
      title: "تم فتح تطبيق البريد الإلكتروني",
      description: "يرجى إكمال إرسال الرسالة من خلال تطبيق البريد الإلكتروني الخاص بك",
    })
  }

  // فتح البريد الإلكتروني مباشرة
  const handleDirectEmail = () => {
    window.open("mailto:mohamm3dalfeel@gmail.com", "_blank")

    toast({
      title: "تم فتح البريد الإلكتروني",
      description: "تم فتح تطبيق البريد الإلكتروني للتواصل مع مدير النظام",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الدعم الفني</h1>
        <p className="text-gray-500 mt-1">تواصل مع مدير النظام للحصول على المساعدة</p>
      </div>

      <Tabs defaultValue="contact">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contact">
            <MessageSquare className="ml-2 h-4 w-4" />
            تواصل مع المدير
          </TabsTrigger>
          <TabsTrigger value="faq">
            <HelpCircle className="ml-2 h-4 w-4" />
            الأسئلة الشائعة
          </TabsTrigger>
          <TabsTrigger value="guides">
            <FileText className="ml-2 h-4 w-4" />
            أدلة الاستخدام
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>تواصل مع مدير النظام</CardTitle>
                <CardDescription>يمكنك إرسال رسالة إلى مدير النظام عبر البريد الإلكتروني</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم</Label>
                    <Input id="name" value={userName || ""} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" value={email || ""} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issueType">نوع المشكلة</Label>
                    <Select value={issueType} onValueChange={setIssueType}>
                      <SelectTrigger id="issueType">
                        <SelectValue placeholder="اختر نوع المشكلة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">مشكلة تقنية</SelectItem>
                        <SelectItem value="account">مشكلة في الحساب</SelectItem>
                        <SelectItem value="suggestion">اقتراح تحسين</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">الموضوع</Label>
                    <Input
                      id="subject"
                      placeholder="أدخل عنوان الموضوع"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">الرسالة</Label>
                    <Textarea
                      id="message"
                      placeholder="اكتب رسالتك هنا..."
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" className="flex-1">
                      <Mail className="ml-2 h-4 w-4" />
                      إرسال عبر البريد الإلكتروني
                    </Button>

                    <Button type="button" variant="outline" className="flex-1" onClick={handleDirectEmail}>
                      <ExternalLink className="ml-2 h-4 w-4" />
                      فتح البريد الإلكتروني مباشرة
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>معلومات الاتصال</CardTitle>
                <CardDescription>طرق التواصل المباشر مع مدير النظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">البريد الإلكتروني</h3>
                    <a
                      href="mailto:mohamm3dalfeel@gmail.com"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      mohamm3dalfeel@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4 space-x-reverse">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">رقم الجوال</h3>
                    <p>05XXXXXXXX</p>
                    <p className="text-sm text-muted-foreground">متاح من الأحد إلى الخميس، 8 صباحاً - 2 ظهراً</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full" onClick={handleDirectEmail}>
                  <Mail className="ml-2 h-4 w-4" />
                  تواصل مباشرة
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>الأسئلة الشائعة</CardTitle>
              <CardDescription>إجابات على الأسئلة المتكررة حول استخدام النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>كيف يمكنني تغيير كلمة المرور الخاصة بي؟</AccordionTrigger>
                  <AccordionContent>
                    يمكنك تغيير كلمة المرور من خلال الذهاب إلى صفحة الإعدادات، ثم اختيار تبويب "الحساب"، وستجد قسم تغيير
                    كلمة المرور. قم بإدخال كلمة المرور الحالية ثم كلمة المرور الجديدة وتأكيدها.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>ماذا أفعل إذا نسيت كلمة المرور؟</AccordionTrigger>
                  <AccordionContent>
                    في حالة نسيان كلمة المرور، يمكنك الضغط على رابط "نسيت كلمة المرور؟" في صفحة تسجيل الدخول. سيتم إرسال
                    رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني المسجل. إذا استمرت المشكلة، يرجى التواصل مع مدير
                    النظام.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>كيف يمكنني تحديث معلوماتي الشخصية؟</AccordionTrigger>
                  <AccordionContent>
                    يمكنك تحديث معلوماتك الشخصية من خلال الذهاب إلى صفحة الإعدادات، ثم اختيار تبويب "الحساب". قم بتعديل
                    المعلومات المطلوبة ثم اضغط على زر "حفظ التغييرات".
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>كيف يمكنني الإبلاغ عن مشكلة في النظام؟</AccordionTrigger>
                  <AccordionContent>
                    يمكنك الإبلاغ عن أي مشكلة في النظام من خلال صفحة الدعم الفني (الصفحة الحالية). قم بتعبئة النموذج مع
                    وصف تفصيلي للمشكلة وسيتم التواصل معك في أقرب وقت ممكن.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>كم من الوقت يستغرق الرد على طلبات الدعم الفني؟</AccordionTrigger>
                  <AccordionContent>
                    يتم الرد على طلبات الدعم الفني خلال 24 ساعة عمل في أيام الدوام الرسمي. للحالات العاجلة، يرجى التواصل
                    مباشرة مع مدير النظام عبر رقم الجوال المذكور.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides">
          <Card>
            <CardHeader>
              <CardTitle>أدلة الاستخدام</CardTitle>
              <CardDescription>دليل شامل لاستخدام نظام إدارة المدرسة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border shadow-sm">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">دليل المستخدم العام</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      دليل شامل لجميع المستخدمين يشرح الوظائف الأساسية للنظام وكيفية استخدامها.
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" className="w-full">
                      تحميل الدليل (PDF)
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">دليل المعلمين</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      دليل خاص بالمعلمين يشرح كيفية إدارة الفصول، تسجيل الدرجات، ومتابعة الحضور والغياب.
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" className="w-full">
                      تحميل الدليل (PDF)
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">دليل الطلاب</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      دليل خاص بالطلاب يشرح كيفية متابعة الدرجات، الواجبات، والجدول الدراسي.
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" className="w-full">
                      تحميل الدليل (PDF)
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">دليل مدير النظام</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      دليل خاص بمديري النظام يشرح كيفية إدارة المستخدمين، الإعدادات، والتقارير.
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" className="w-full">
                      تحميل الدليل (PDF)
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">فيديوهات تعليمية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border shadow-sm">
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">كيفية استخدام لوحة التحكم</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">فيديو تعليمي</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border shadow-sm">
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">كيفية إدارة الفصول والطلاب</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">فيديو تعليمي</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
