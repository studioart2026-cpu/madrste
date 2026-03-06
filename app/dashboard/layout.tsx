"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-mobile"
import {
  Bell,
  BookText,
  Calendar,
  GraduationCap,
  Home,
  HelpCircle,
  LogOut,
  Menu,
  PieChart,
  Settings,
  User,
  Users,
  FileText,
  PanelLeft,
  Palette,
  School,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { userName, userType, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // إغلاق القائمة عند تغيير المسار (للهواتف المحمولة)
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const getInitials = (name: string | null | undefined) => {
    try {
      // التحقق من أن الاسم موجود وهو سلسلة نصية
      if (!name || typeof name !== "string") {
        return "MS" // قيمة افتراضية: مدرسة
      }

      // تقسيم الاسم إلى كلمات والحصول على الحرف الأول من كل كلمة
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    } catch (error) {
      console.error("Error in getInitials:", error)
      return "MS" // قيمة افتراضية في حالة حدوث خطأ
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      toast({
        title: "جاري تسجيل الخروج...",
        description: "يرجى الانتظار قليلاً",
      })

      await logout()

      // لن يتم تنفيذ هذا الكود لأن logout سيقوم بإعادة توجيه المستخدم
      setIsLoggingOut(false)
    } catch (error) {
      console.error("Error during logout:", error)
      setIsLoggingOut(false)

      toast({
        title: "حدث خطأ أثناء تسجيل الخروج",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    }
  }

  const routes = [
    {
      label: "لوحة التحكم",
      href: "/dashboard",
      icon: <Home className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard",
      showFor: ["student", "teacher", "admin"],
    },
    {
      label: "الطلاب",
      href: "/dashboard/students",
      icon: <GraduationCap className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/students",
      showFor: ["teacher", "admin"],
    },
    {
      label: "المعلمين",
      href: "/dashboard/teachers",
      icon: <Users className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/teachers",
      showFor: ["admin"],
    },
    {
      label: "الفصول الدراسية",
      href: "/dashboard/classes",
      icon: <School className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/classes",
      showFor: ["teacher", "admin"],
    },
    {
      label: "الجدول الدراسي",
      href: "/dashboard/schedule",
      icon: <Calendar className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/schedule",
      showFor: ["student", "teacher", "admin"],
    },
    {
      label: "الحضور والغياب",
      href: "/dashboard/attendance",
      icon: <FileText className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/attendance",
      showFor: ["teacher", "admin"],
    },
    {
      label: "الدرجات",
      href: "/dashboard/grades",
      icon: <PieChart className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/grades",
      showFor: ["student", "teacher", "admin"],
    },
    {
      label: "الواجبات المنزلية",
      href: "/dashboard/homework",
      icon: <BookText className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/homework",
      showFor: ["student", "teacher", "admin"],
    },
    {
      label: "التقارير",
      href: "/dashboard/reports",
      icon: <FileText className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/reports",
      showFor: ["student", "teacher", "admin"],
    },
    {
      label: "الملاحظات",
      href: "/dashboard/notes",
      icon: <PanelLeft className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/notes",
      showFor: ["student", "teacher", "admin"],
    },
    {
      label: "لوح الرسم",
      href: "/dashboard/drawing-board",
      icon: <Palette className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/drawing-board",
      showFor: ["student", "teacher", "admin"],
    },
    {
      label: "طلبات تسجيل الدخول",
      href: "/dashboard/admin/user-approvals",
      icon: <User className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/admin/user-approvals",
      showFor: ["admin"],
    },
  ]

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* القائمة للأجهزة الكبيرة */}
      <aside
        className={cn(
          "fixed inset-y-0 z-10 flex w-64 flex-col border-r bg-white transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isMobile ? "translate-x-full" : "translate-x-0",
        )}
      >
        <div className="border-b p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-primary">المدرسة ١٣٦</h2>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto p-4">
          <ul className="grid gap-1">
            {routes
              .filter((route) => route.showFor.includes(userType || ""))
              .map((route) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                      route.active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {route.icon}
                    {route.label}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
        <div className="border-t p-4">
          <ul className="grid gap-1">
            <li>
              <Link
                href="/dashboard/support"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === "/dashboard/support"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <HelpCircle className="w-5 h-5 ml-2" />
                الدعم الفني
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settings"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === "/dashboard/settings"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <Settings className="w-5 h-5 ml-2" />
                الإعدادات
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isLoggingOut && "opacity-50 cursor-not-allowed",
                )}
              >
                <LogOut className="w-5 h-5 ml-2" />
                {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* القائمة للهواتف المحمولة */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="absolute top-3 right-3">
            <Menu />
            <span className="sr-only">القائمة</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="px-0 w-64">
          <div className="border-b p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-primary">المدرسة ١٣٦</h2>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto p-4">
            <ul className="grid gap-1">
              {routes
                .filter((route) => route.showFor.includes(userType || ""))
                .map((route) => (
                  <li key={route.href}>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                        route.active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {route.icon}
                      {route.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
          <div className="border-t p-4">
            <ul className="grid gap-1">
              <li>
                <Link
                  href="/dashboard/support"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === "/dashboard/support"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <HelpCircle className="w-5 h-5 ml-2" />
                  الدعم الفني
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === "/dashboard/settings"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Settings className="w-5 h-5 ml-2" />
                  الإعدادات
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isLoggingOut && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <LogOut className="w-5 h-5 ml-2" />
                  {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
                </button>
              </li>
            </ul>
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:px-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">القائمة</span>
          </Button>
          <div className="flex-1 flex items-center justify-end md:justify-between">
            <nav className="hidden md:block">
              <h2 className="text-xl font-bold">نظام إدارة المدرسة المتوسطة ١٣٦</h2>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative" aria-label="الإشعارات">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
              <div className="flex items-center gap-2">
                <span className="hidden text-sm md:inline-block">{userName || "مستخدم النظام"}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={userName || "المستخدم"} />
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 space-y-4 p-4 md:p-8 pb-16 md:pb-8 pt-6">{children}</div>
      </main>
    </div>
  )
}
