export type UserType = "admin" | "vice_admin" | "teacher" | "student" | "parent"

export type RegistrationUserType = Extract<UserType, "teacher" | "student" | "parent">

export interface AuthUser {
  id: string
  name: string
  email: string
  userType: UserType
  phoneNumber?: string
  isApproved: boolean
  createdAt: string
}

export interface RegistrationRequest {
  id: string
  name: string
  email: string
  userType: RegistrationUserType
  phoneNumber: string
  date: string
  status: "pending" | "approved" | "rejected"
}

export interface SessionUser extends AuthUser {
  isEmailVerified: boolean
}

export type ManagedUserStatus = "active" | "pending" | "inactive"

export interface AdminManagedUser {
  id: string
  name: string
  email: string
  role: UserType
  status: ManagedUserStatus
  lastActive: string
  createdAt: string
  phoneNumber?: string
}
