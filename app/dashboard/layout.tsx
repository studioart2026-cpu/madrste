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
  ClipboardList,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { defaultDashboardContent } from "@/lib/dashboard-data"
import { fetchDashboardData } from "@/lib/school-api"
import { type SmartAlert } from "@/lib/school-insights"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { userName, userType, email, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [notificationItems, setNotificationItems] = useState<SmartAlert[]>([])
  const [readAlertIds, setReadAlertIds] = useState<string[]>([])

  // إغلاق القائمة عند تغيير المسار (للهواتف المحمولة)
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof window === "undefined") return

    let isMounted = true

    const loadProfileImage = () => {
      if (!email) {
        setProfileImage(null)
        return
      }

      const storedImage = localStorage.getItem(`profile-image:${email}`)
      setProfileImage(storedImage || null)
    }

    const loadNotifications = async () => {
      try {
        const notificationsEnabled = localStorage.getItem("notifications-enabled")
        if (notificationsEnabled === "false") {
          setNotificationItems([])
          return
        }

        const response = await fetchDashboardData()
        if (!isMounted) {
          return
        }

        const parsedAlerts = response.dashboard.smartAlerts
        const visibleAlerts = parsedAlerts.filter((alert) => {
          if (userType === "admin") return alert.audience.includes("admin")
          if (userType === "teacher") return alert.audience.includes("teacher")
          if (userType === "student") return alert.audience.includes("student")
          return false
        })
        setNotificationItems(visibleAlerts)
      } catch {
        if (!isMounted) {
          return
        }

        const fallbackAlerts = defaultDashboardContent.smartAlerts.filter((alert) => {
          if (userType === "admin") return alert.audience.includes("admin")
          if (userType === "teacher") return alert.audience.includes("teacher")
          if (userType === "student") return alert.audience.includes("student")
          return false
        })
        setNotificationItems(fallbackAlerts)
      }

      try {
        const readIds = localStorage.getItem(`read-alert-ids:${email || userType || "guest"}`)
        if (isMounted) {
          setReadAlertIds(readIds ? (JSON.parse(readIds) as string[]) : [])
        }
      } catch {
        if (isMounted) {
          setReadAlertIds([])
        }
      }
    }

    const handleProfileUpdated = () => {
      loadProfileImage()
      void loadNotifications()
    }

    loadProfileImage()
    void loadNotifications()
    window.addEventListener("profile-updated", handleProfileUpdated)
    window.addEventListener("dashboard-data-updated", handleProfileUpdated)
    window.addEventListener("storage", handleProfileUpdated)

    return () => {
      isMounted = false
      window.removeEventListener("profile-updated", handleProfileUpdated)
      window.removeEventListener("dashboard-data-updated", handleProfileUpdated)
      window.removeEventListener("storage", handleProfileUpdated)
    }
  }, [email, userType])

  const unreadCount = notificationItems.filter((alert) => !readAlertIds.includes(alert.id)).length

  const markAllNotificationsAsRead = () => {
    const nextIds = notificationItems.map((alert) => alert.id)
    setReadAlertIds(nextIds)
    if (typeof window !== "undefined") {
      localStorage.setItem(`read-alert-ids:${email || userType || "guest"}`, JSON.stringify(nextIds))
    }
  }

  const markNotificationAsRead = (alertId: string) => {
    const nextIds = Array.from(new Set([...readAlertIds, alertId]))
    setReadAlertIds(nextIds)
    if (typeof window !== "undefined") {
      localStorage.setItem(`read-alert-ids:${email || userType || "guest"}`, JSON.stringify(nextIds))
    }
  }

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
      showFor: ["student", "teacher", "admin", "vice_admin"],
    },
    {
      label: "الطلاب",
      href: "/dashboard/students",
      icon: <GraduationCap className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/students",
      showFor: ["teacher", "admin", "vice_admin"],
    },
    {
      label: "المعلمين",
      href: "/dashboard/teachers",
      icon: <Users className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/teachers",
      showFor: ["admin", "vice_admin"],
    },
    {
      label: "الفصول الدراسية",
      href: "/dashboard/classes",
      icon: <School className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/classes",
      showFor: ["teacher", "admin", "vice_admin"],
    },
    {
      label: "الجدول الدراسي",
      href: "/dashboard/schedule",
      icon: <Calendar className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/schedule",
      showFor: ["student", "teacher", "admin", "vice_admin"],
    },
    {
      label: "الحضور والغياب",
      href: "/dashboard/attendance",
      icon: <FileText className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/attendance",
      showFor: ["teacher", "admin", "vice_admin"],
    },
    {
      label: "الدرجات",
      href: "/dashboard/grades",
      icon: <PieChart className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/grades",
      showFor: ["student", "teacher", "admin", "vice_admin"],
    },
    {
      label: "الواجبات المنزلية",
      href: "/dashboard/homework",
      icon: <BookText className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/homework",
      showFor: ["student", "teacher", "admin", "vice_admin"],
    },
    {
      label: "التقارير",
      href: "/dashboard/reports",
      icon: <FileText className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/reports",
      showFor: ["student", "teacher", "admin", "vice_admin"],
    },
    {
      label: "الملف الموحد",
      href: "/dashboard/student-profile",
      icon: <ClipboardList className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/student-profile",
      showFor: ["student", "teacher", "admin", "vice_admin"],
    },
    {
      label: "الملاحظات",
      href: "/dashboard/notes",
      icon: <PanelLeft className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/notes",
      showFor: ["student", "teacher", "admin", "vice_admin"],
    },
    {
      label: "لوح الرسم",
      href: "/dashboard/drawing-board",
      icon: <Palette className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/drawing-board",
      showFor: ["student", "teacher", "admin", "vice_admin"],
    },
    {
      label: "طلبات تسجيل الدخول",
      href: "/dashboard/admin/user-approvals",
      icon: <User className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/admin/user-approvals",
      showFor: ["admin"],
    },
    {
      label: "المستخدمون",
      href: "/dashboard/users",
      icon: <Users className="w-5 h-5 ml-2" />,
      active: pathname === "/dashboard/users",
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label="الإشعارات">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel className="p-0">الإشعارات</DropdownMenuLabel>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={markAllNotificationsAsRead}>
                      تعيين الكل كمقروء
                    </Button>
                  </div>
                  <DropdownMenuSeparator />
                  {notificationItems.length === 0 && (
                    <div className="px-2 py-3 text-sm text-muted-foreground">لا توجد إشعارات حالياً</div>
                  )}
                  {notificationItems.map((alert) => {
                    const isUnread = !readAlertIds.includes(alert.id)
                    return (
                      <DropdownMenuItem
                        key={alert.id}
                        className="flex flex-col items-start gap-1 py-3"
                        onClick={() => markNotificationAsRead(alert.id)}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className={cn("font-medium", isUnread && "text-primary")}>{alert.title}</span>
                          {isUnread && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-normal">{alert.description}</span>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center gap-2">
                <span className="hidden text-sm md:inline-block">{userName || "مستخدم النظام"}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profileImage || "/placeholder.svg"} alt={userName || "المستخدم"} />
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
