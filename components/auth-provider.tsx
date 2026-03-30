"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { RegistrationUserType, SessionUser, UserType } from "@/lib/auth-types"

interface AuthContextType {
  isReady: boolean
  isLoggedIn: boolean
  userType: UserType | null
  userName: string | null
  email: string | null
  isApproved: boolean
  isEmailVerified: boolean
  login: (email: string, password: string) => Promise<SessionUser>
  logout: () => Promise<void>
  register: (
    userType: RegistrationUserType,
    userName: string,
    email: string,
    password: string,
    phoneNumber: string,
  ) => Promise<SessionUser>
  registerWithVerification: (
    userType: RegistrationUserType,
    userName: string,
    email: string,
    password: string,
    phoneNumber: string,
  ) => Promise<SessionUser>
  verifyEmail: (email: string, code: string) => Promise<boolean>
  resendVerificationCode: (email: string) => Promise<void>
  approveUser: (requestId: string) => Promise<boolean>
  rejectUser: (requestId: string) => Promise<boolean>
  refreshSession: () => Promise<SessionUser | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const SESSION_CACHE_KEY = "school-session-user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const applySessionUser = (user: SessionUser | null) => {
    setSessionUser(user)

    if (typeof window === "undefined") {
      return
    }

    if (user) {
      window.localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(user))
      return
    }

    window.localStorage.removeItem(SESSION_CACHE_KEY)
  }

  const requestSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      })

      if (!response.ok) {
        if (response.status === 401) {
          applySessionUser(null)
          return { resolved: true, user: null }
        }

        return { resolved: false, user: sessionUser }
      }

      const data = (await response.json()) as { user: SessionUser | null }
      applySessionUser(data.user || null)
      return { resolved: true, user: data.user || null }
    } catch (error) {
      console.error("Failed to refresh session:", error)
      return { resolved: false, user: sessionUser }
    }
  }

  const refreshSession = async () => {
    const result = await requestSession()
    return result.user ?? null
  }

  useEffect(() => {
    let active = true

    void (async () => {
      if (typeof window !== "undefined") {
        try {
          const cachedSessionUser = window.localStorage.getItem(SESSION_CACHE_KEY)
          if (cachedSessionUser) {
            setSessionUser(JSON.parse(cachedSessionUser) as SessionUser)
          }
        } catch (error) {
          console.error("Failed to read cached session:", error)
        }
      }

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const result = await requestSession()
        if (result.resolved) {
          if (active) {
            setIsReady(true)
          }
          return
        }

        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
      }

      if (active) {
        setIsReady(true)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isReady) {
      return
    }

    const isAuthRoute = pathname === "/login" || pathname === "/register"
    const isPendingRoute = pathname === "/pending-approval"
    const isVerifyRoute = pathname === "/verify-email"
    const isDashboardRoute = pathname?.startsWith("/dashboard")
    const isLoggedIn = Boolean(sessionUser)
    const isApproved = sessionUser?.isApproved ?? false

    if (!isLoggedIn && (isDashboardRoute || isPendingRoute || isVerifyRoute)) {
      router.replace("/login")
      return
    }

    if (isLoggedIn && isApproved && (isAuthRoute || isPendingRoute || isVerifyRoute)) {
      router.replace("/dashboard")
      return
    }

    if (isLoggedIn && !isApproved && !isPendingRoute && !isAuthRoute && !isVerifyRoute) {
      router.replace("/pending-approval")
    }
  }, [isReady, pathname, router, sessionUser])

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = (await response.json()) as { user?: SessionUser; error?: string }
    if (!response.ok || !data.user) {
      throw new Error(data.error || "تعذر تسجيل الدخول")
    }

    applySessionUser(data.user)
    return data.user
  }

  const registerWithVerification = async (
    userType: RegistrationUserType,
    userName: string,
    email: string,
    password: string,
    phoneNumber: string,
  ) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        userType,
        name: userName,
        email,
        password,
        phoneNumber,
      }),
    })

    const data = (await response.json()) as { user?: SessionUser; error?: string }
    if (!response.ok || !data.user) {
      throw new Error(data.error || "تعذر إنشاء الحساب")
    }

    applySessionUser(data.user)
    return data.user
  }

  const approveUser = async (requestId: string) => {
    const response = await fetch("/api/admin/registration-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        requestId,
        action: "approve",
      }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ error: "تعذر الموافقة على الطلب" }))) as { error?: string }
      throw new Error(data.error || "تعذر الموافقة على الطلب")
    }

    await refreshSession()
    return true
  }

  const rejectUser = async (requestId: string) => {
    const response = await fetch("/api/admin/registration-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        requestId,
        action: "reject",
      }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ error: "تعذر رفض الطلب" }))) as { error?: string }
      throw new Error(data.error || "تعذر رفض الطلب")
    }

    await refreshSession()
    return true
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      })
    } catch (error) {
      console.error("Logout request failed:", error)
    } finally {
      applySessionUser(null)
      router.replace("/login")
      router.refresh()
    }
  }

  const contextValue: AuthContextType = {
    isReady,
    isLoggedIn: Boolean(sessionUser),
    userType: sessionUser?.userType ?? null,
    userName: sessionUser?.name ?? null,
    email: sessionUser?.email ?? null,
    isApproved: sessionUser?.isApproved ?? false,
    isEmailVerified: sessionUser?.isEmailVerified ?? true,
    login,
    logout,
    register: registerWithVerification,
    registerWithVerification,
    verifyEmail: async () => true,
    resendVerificationCode: async () => {},
    approveUser,
    rejectUser,
    refreshSession,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    return {
      isReady: false,
      isLoggedIn: false,
      userType: null,
      userName: null,
      email: null,
      isApproved: false,
      isEmailVerified: false,
      login: async () => {
        throw new Error("AuthProvider is not mounted")
      },
      logout: async () => {},
      register: async () => {
        throw new Error("AuthProvider is not mounted")
      },
      registerWithVerification: async () => {
        throw new Error("AuthProvider is not mounted")
      },
      verifyEmail: async () => false,
      resendVerificationCode: async () => {},
      approveUser: async () => false,
      rejectUser: async () => false,
      refreshSession: async () => null,
    } satisfies AuthContextType
  }

  return context
}
