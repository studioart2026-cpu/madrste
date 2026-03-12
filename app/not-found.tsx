import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FileQuestion className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">الصفحة غير موجودة</CardTitle>
          <CardDescription>عذراً، الصفحة التي تبحث عنها غير موجودة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="font-semibold mb-2">للتواصل مع مدير النظام:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="font-semibold ml-2">البريد الإلكتروني:</span>
                <a href="mailto:mohamm3dalfeel@gmail.com" className="text-primary hover:underline">
                  mohamm3dalfeel@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <span className="font-semibold ml-2">رقم الجوال:</span>
                <span>05XXXXXXXX</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">العودة إلى الصفحة الرئيسية</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
