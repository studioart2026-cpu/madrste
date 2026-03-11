"use client"

import Link from "next/link"
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const contactItems = [
  {
    icon: Phone,
    label: "الهاتف",
    value: "0112345678",
    href: "tel:0112345678",
  },
  {
    icon: Mail,
    label: "البريد الإلكتروني",
    value: "school136@example.com",
    href: "mailto:school136@example.com",
  },
  {
    icon: MapPin,
    label: "العنوان",
    value: "الرياض، المملكة العربية السعودية",
    href: "https://maps.google.com/?q=Riyadh",
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e9f5f2] p-4">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center">
        <Card className="w-full max-w-3xl border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-[#0a8a74]">التواصل مع المدرسة</CardTitle>
            <CardDescription>يمكنك استخدام بيانات التواصل التالية للاستفسارات والدعم والمتابعة.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contactItems.map((item) => {
              const Icon = item.icon

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl border border-[#d9eee8] bg-white p-4 transition hover:border-[#0a8a74] hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f5f2] text-[#0a8a74]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-semibold text-slate-800">{item.value}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#0a8a74]" />
                </a>
              )
            })}

            <div className="pt-4 text-center">
              <Link href="/login">
                <Button variant="outline" className="border-[#0a8a74] text-[#0a8a74] hover:bg-[#e9f5f2]">
                  العودة إلى تسجيل الدخول
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
