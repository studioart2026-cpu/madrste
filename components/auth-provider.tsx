"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { registrationStore } from "@/lib/registration-store"
import { usersStore } from "@/lib/users-store"

type UserType = "admin" | "vice_admin" | "teacher" | "student" | "parent" | null // دعم حساب ولي الأمر
type AuthUserType = Exclude<UserType, null>

interface AuthContextType {
  isLoggedIn: boolean
  userType: UserType
  userName: string | null
  email: string | null
  isApproved: boolean
  isEmailVerified: boolean
  login: (userType: AuthUserType, userName: string, email: string, isApproved: boolean) => void
  logout: () => Promise<void>
  register: (userType: AuthUserType, userName: string, email: string, isApproved: boolean) => void
  registerWithVerification: (
    userType: AuthUserType,
    userName: string,
    email: string,
    password: string,
    phoneNumber: string,
  ) => Promise<void>
  verifyEmail: (email: string, code: string) => Promise<boolean>
  resendVerificationCode: (email: string) => Promise<void>
  approveUser: (email: string) => void
  rejectUser: (email: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [userType, setUserType] = useState<UserType>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [isApproved, setIsApproved] = useState<boolean>(false)
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Load auth state from localStorage on initial mount
  useEffect(() => {
    try {
      const storedIsLoggedIn = localStorage.getItem("isLoggedIn")
      const storedUserType = localStorage.getItem("userType") as UserType
      const storedUserName = localStorage.getItem("userName")
      const storedEmail = localStorage.getItem("email")
      const storedIsApproved = localStorage.getItem("isApproved") === "true"
      const storedIsEmailVerified = localStorage.getItem("isEmailVerified") === "true"

      if (storedIsLoggedIn === "true" && storedUserType && storedUserName) {
        setIsLoggedIn(true)
        setUserType(storedUserType)
        setUserName(storedUserName)
        setEmail(storedEmail)
        setIsApproved(storedIsApproved)
        setIsEmailVerified(storedIsEmailVerified)
      }

      setIsInitialized(true)
    } catch (e) {
      console.error("Error loading auth state from localStorage:", e)
      setIsInitialized(true)
    }
  }, [])

  // Handle authentication redirects
  useEffect(() => {
    if (!isInitialized) return

    try {
      const isAuthRoute = pathname === "/login" || pathname === "/register"
      const isPendingRoute = pathname === "/pending-approval"
      const isVerifyRoute = pathname === "/verify-email"

      if (isLoggedIn && isApproved && isEmailVerified && (isAuthRoute || isPendingRoute || isVerifyRoute)) {
        router.push("/dashboard")
      } else if (isLoggedIn && !isEmailVerified && !isVerifyRoute) {
        router.push(`/verify-email?email=${encodeURIComponent(email || "")}`)
      } else if (isLoggedIn && isEmailVerified && !isApproved && !isPendingRoute && !isAuthRoute) {
        router.push("/pending-approval")
      } else if (!isLoggedIn && pathname?.startsWith("/dashboard") && isInitialized) {
        router.push("/login")
      }
    } catch (e) {
      console.error("Error in auth redirects:", e)
    }
  }, [isLoggedIn, isApproved, isEmailVerified, pathname, router, isInitialized, email])

  // Handle browser back button and history navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        // Re-check authentication when navigating with browser history
        const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true"
        const storedUserType = localStorage.getItem("userType") as UserType
        const storedUserName = localStorage.getItem("userName")
        const storedEmail = localStorage.getItem("email")
        const storedIsApproved = localStorage.getItem("isApproved") === "true"
        const storedIsEmailVerified = localStorage.getItem("isEmailVerified") === "true"

        if (storedIsLoggedIn && storedUserType && storedUserName) {
          setIsLoggedIn(true)
          setUserType(storedUserType)
          setUserName(storedUserName)
          setEmail(storedEmail)
          setIsApproved(storedIsApproved)
          setIsEmailVerified(storedIsEmailVerified)
        }
      } catch (e) {
        console.error("Error in popstate handler:", e)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const login = (type: AuthUserType, name: string, userEmail: string, approved: boolean) => {
    try {
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userType", type)
      localStorage.setItem("userName", name)
      localStorage.setItem("email", userEmail)
      localStorage.setItem("isApproved", approved.toString())
      localStorage.setItem("isEmailVerified", "true")
      setIsLoggedIn(true)
      setUserType(type)
      setUserName(name)
      setEmail(userEmail)
      setIsApproved(approved)
      setIsEmailVerified(true)

      // التحقق من وجود طلب تسجيل للمستخدم
      const existingRequest = registrationStore.getRequestByEmail(userEmail)

      // إذا لم يكن هناك طلب تسجيل، قم بإنشاء واحد (للمستخدمين المسجلين مسبقاً)
      if (!existingRequest && type !== "admin") {
        registrationStore.addRequest({
          name,
          email: userEmail,
          // cast إلى النوع الجديد الذي يشمل الوالدين
          userType: type as "teacher" | "student" | "parent",
          phoneNumber: "05xxxxxxxx", // رقم افتراضي للمستخدمين المسجلين مسبقاً
        })

        // إذا كان المستخدم معتمداً، قم بتحديث حالة الطلب
        if (approved) {
          const newRequest = registrationStore.getRequestByEmail(userEmail)
          if (newRequest) {
            registrationStore.updateRequestStatus(newRequest.id, "approved")
          }
        }
      }
    } catch (e) {
      console.error("Error in login:", e)
    }
  }

  const register = (type: AuthUserType, name: string, userEmail: string, approved: boolean) => {
    try {
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userType", type)
      localStorage.setItem("userName", name)
      localStorage.setItem("email", userEmail)
      localStorage.setItem("isApproved", approved.toString())
      localStorage.setItem("isEmailVerified", "true")
      setIsLoggedIn(true)
      setUserType(type)
      setUserName(name)
      setEmail(userEmail)
      setIsApproved(approved)
      setIsEmailVerified(true)

      // إضافة طلب تسجيل جديد
      if (type !== "admin") {
        registrationStore.addRequest({
          name,
          email: userEmail,
          userType: type as "teacher" | "student" | "parent",
          phoneNumber: "05xxxxxxxx", // رقم افتراضي
        })

        // إذا كان المستخدم معتمداً، قم بتحديث حالة الطلب
        if (approved) {
          const newRequest = registrationStore.getRequestByEmail(userEmail)
          if (newRequest) {
            registrationStore.updateRequestStatus(newRequest.id, "approved")
          }
        }
      }
    } catch (e) {
      console.error("Error in register:", e)
    }
  }

  const registerWithVerification = async (
    type: AuthUserType,
    name: string,
    userEmail: string,
    password: string,
    phoneNumber: string,
  ) => {
    try {
      // تخزين بيانات المستخدم في localStorage
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userType", type)
      localStorage.setItem("userName", name)
      localStorage.setItem("email", userEmail)
      localStorage.setItem("isApproved", "false")
      localStorage.setItem("isEmailVerified", "true") // تعيين التحقق من البريد الإلكتروني إلى true مباشرة

      // تحديث حالة المصادقة
      setIsLoggedIn(true)
      setUserType(type)
      setUserName(name)
      setEmail(userEmail)
      setIsApproved(false)
      setIsEmailVerified(true) // تعيين التحقق من البريد الإلكتروني إلى true مباشرة

      // إضافة المستخدم إلى مخزن المستخدمين
      usersStore.addUser({
        name,
        email: userEmail,
        password: password, // في التطبيق الحقيقي، يجب تشفير كلمة المرور
        userType: type as "admin" | "vice_admin" | "teacher" | "student" | "parent",
        isApproved: false,
      })

      // إضافة طلب تسجيل جديد
      registrationStore.addRequest({
        name,
        email: userEmail,
        userType: type as "teacher" | "student" | "parent",
        phoneNumber,
      })

      console.log("تم تسجيل المستخدم بنجاح")
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const verifyEmail = async (userEmail: string, code: string): Promise<boolean> => {
    try {
      // محاكاة إرسال طلب إلى الخادم للتحقق من الرمز
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          code,
        }),
      })

      if (!response.ok) {
        return false
      }

      // تحديث حالة التحقق من البريد الإلكتروني
      localStorage.setItem("isEmailVerified", "true")
      setIsEmailVerified(true)
      return true
    } catch (error) {
      console.error("Email verification error:", error)
      return false
    }
  }

  const resendVerificationCode = async (userEmail: string): Promise<void> => {
    try {
      // محاكاة إرسال طلب إلى الخادم لإعادة إرسال رمز التحقق
      const response = await fetch("/api/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          resend: true,
        }),
      })

      if (!response.ok) {
        throw new Error("فشل في إعادة إرسال رمز التحقق")
      }
    } catch (error) {
      console.error("Resend verification code error:", error)
      throw error
    }
  }

  const approveUser = (userEmail: string) => {
    try {
      console.log("جاري الموافقة على المستخدم:", userEmail)

      // تحديث حالة المستخدم الحالي إذا كان هو نفس المستخدم المراد الموافقة عليه
      if (email === userEmail) {
        localStorage.setItem("isApproved", "true")
        setIsApproved(true)
        console.log("تم تحديث حالة المستخدم الحالي إلى معتمد")
      }

      // تحديث حالة طلب التسجيل
      const request = registrationStore.getRequestByEmail(userEmail)
      if (request) {
        const updateSuccess = registrationStore.updateRequestStatus(request.id, "approved")
        console.log("نتيجة تحديث حالة الطلب:", updateSuccess)
      } else {
        console.warn("لم يتم العثور على طلب تسجيل للبريد الإلكتروني:", userEmail)
      }

      // تحديث حالة المستخدم في مخزن المستخدمين
      const updateUserSuccess = usersStore.approveUser(userEmail)
      console.log("نتيجة تحديث حالة المستخدم في المخزن:", updateUserSuccess)

      return true
    } catch (e) {
      console.error("خطأ في وظيفة approveUser:", e)
      return false
    }
  }

  const rejectUser = (userEmail: string) => {
    try {
      // في التطبيق الحقيقي، سيتم إرسال طلب إلى الخادم لرفض المستخدم
      if (email === userEmail) {
        logout()
      }

      // تحديث حالة طلب التسجيل
      const request = registrationStore.getRequestByEmail(userEmail)
      if (request) {
        registrationStore.updateRequestStatus(request.id, "rejected")
      }

      // حذف المستخدم من مخزن المستخدمين
      usersStore.deleteUser(userEmail)
    } catch (e) {
      console.error("Error in rejectUser:", e)
    }
  }

  const logout = async () => {
    try {
      // تأخير صغير لضمان إكمال العمليات الأخرى قبل تسجيل الخروج
      await new Promise((resolve) => setTimeout(resolve, 100))

      // مسح بيانات المستخدم من localStorage
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userType")
      localStorage.removeItem("userName")
      localStorage.removeItem("email")
      localStorage.removeItem("isApproved")
      localStorage.removeItem("isEmailVerified")

      // إعادة تعيين حالة المصادقة
      setIsLoggedIn(false)
      setUserType(null)
      setUserName(null)
      setEmail(null)
      setIsApproved(false)
      setIsEmailVerified(true)

      // توجيه المستخدم إلى صفحة تسجيل الدخول
      router.push("/login")

      // إعادة تحميل الصفحة لضمان مسح جميع البيانات من الذاكرة
      if (typeof window !== "undefined") {
        // استخدام setTimeout لتأخير إعادة التحميل حتى يتم الانتقال إلى صفحة تسجيل الدخول
        setTimeout(() => {
          window.location.href = "/login"
        }, 100)
      }
    } catch (e) {
      console.error("Error in logout:", e)
      // في حالة حدوث خطأ، نحاول إعادة توجيه المستخدم بطريقة أخرى
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userType,
        userName,
        email,
        isApproved,
        isEmailVerified,
        login,
        logout,
        register,
        registerWithVerification,
        verifyEmail,
        resendVerificationCode,
        approveUser,
        rejectUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  // إذا كان السياق غير محدد، نعيد قيمة افتراضية بدلاً من رمي خطأ
  if (!context) {
    console.warn("useAuth was called outside of AuthProvider, returning default values")
    return {
      isLoggedIn: false,
      userType: null,
      userName: null,
      email: null,
      isApproved: false,
      isEmailVerified: false,
      login: () => {},
      logout: async () => {},
      register: () => {},
      registerWithVerification: async () => {},
      verifyEmail: async () => false,
      resendVerificationCode: async () => {},
      approveUser: () => {},
      rejectUser: () => {},
    } as AuthContextType
  }
  return context
}
