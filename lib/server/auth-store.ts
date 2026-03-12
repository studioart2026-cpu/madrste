import "server-only"

import { promises as fs } from "node:fs"
import path from "node:path"
import { randomUUID } from "node:crypto"
import type {
  AdminManagedUser,
  AuthUser,
  ManagedUserStatus,
  RegistrationRequest,
  RegistrationUserType,
  SessionUser,
  UserType,
} from "@/lib/auth-types"
import { hashPassword, verifyPassword } from "@/lib/server/password"
import { getServerDataDirectory } from "@/lib/server/data-directory"
import { SESSION_DURATION_MS } from "@/lib/server/session"

interface StoredUser extends AuthUser {
  passwordHash: string
  passwordSalt: string
  accountStatus: Extract<ManagedUserStatus, "active" | "inactive">
}

interface StoredSession {
  id: string
  userEmail: string
  createdAt: string
  expiresAt: string
}

interface AuthDatabase {
  users: StoredUser[]
  registrationRequests: RegistrationRequest[]
  sessions: StoredSession[]
}

const DATA_DIRECTORY = getServerDataDirectory()
const AUTH_DATA_FILE = path.join(DATA_DIRECTORY, "auth.json")

const seedUsers: Array<{
  name: string
  email: string
  password: string
  userType: UserType
  phoneNumber?: string
  isApproved: boolean
}> = [
  {
    name: "مدير النظام",
    email: "mohamm3dalfeel@gmail.com",
    password: "Mo1020304050",
    userType: "admin" as const,
    isApproved: true,
  },
  {
    name: "الجازي العقيل",
    email: "principal@school.edu.sa",
    password: "Principal@123",
    userType: "vice_admin" as const,
    phoneNumber: "0501111111",
    isApproved: true,
  },
  {
    name: "سارة محمد",
    email: "teacher@example.com",
    password: "teacher123",
    userType: "teacher" as const,
    phoneNumber: "0501234567",
    isApproved: true,
  },
  {
    name: "نورة أحمد",
    email: "teacher2@example.com",
    password: "teacher123",
    userType: "teacher" as const,
    phoneNumber: "0502345678",
    isApproved: true,
  },
  {
    name: "عبدالله محمد",
    email: "student@example.com",
    password: "student123",
    userType: "student" as const,
    phoneNumber: "0503456789",
    isApproved: true,
  },
  {
    name: "فهد خالد",
    email: "student2@example.com",
    password: "student123",
    userType: "student" as const,
    phoneNumber: "0504567890",
    isApproved: true,
  },
]

const seedRequests: RegistrationRequest[] = [
  {
    id: "seed-request-1",
    name: "نورة محمد",
    email: "noura@example.com",
    userType: "teacher",
    phoneNumber: "0501234567",
    date: "2026-03-11",
    status: "pending",
  },
  {
    id: "seed-request-2",
    name: "سارة أحمد",
    email: "sara@example.com",
    userType: "student",
    phoneNumber: "0551234567",
    date: "2026-03-11",
    status: "pending",
  },
] satisfies RegistrationRequest[]

let mutationQueue = Promise.resolve()

function todayIsoDate() {
  return new Date().toISOString().split("T")[0]
}

function toPublicUser(user: StoredUser): AuthUser {
  const { passwordHash: _passwordHash, passwordSalt: _passwordSalt, accountStatus: _accountStatus, ...publicUser } = user
  return publicUser
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function formatLastActive(value: string | undefined) {
  return value ? value.replace("T", " ").slice(0, 16) : "لم يسجل الدخول بعد"
}

function resolveManagedUserStatus(user: StoredUser): ManagedUserStatus {
  if (!user.isApproved) {
    return "pending"
  }
  return user.accountStatus === "inactive" ? "inactive" : "active"
}

function syncRegistrationRequestsForManagedUser(
  data: AuthDatabase,
  user: StoredUser,
  status: ManagedUserStatus,
  phoneNumber: string | undefined,
) {
  if (status === "pending") {
    const existingRequest = data.registrationRequests.find((request) => request.email === user.email)

    if (existingRequest) {
      existingRequest.name = user.name
      existingRequest.email = user.email
      existingRequest.phoneNumber = phoneNumber || ""
      existingRequest.userType = user.userType === "teacher" || user.userType === "student" || user.userType === "parent"
        ? user.userType
        : "teacher"
      existingRequest.date = todayIsoDate()
      existingRequest.status = "pending"
      return
    }

    data.registrationRequests.push({
      id: randomUUID(),
      name: user.name,
      email: user.email,
      userType: user.userType === "teacher" || user.userType === "student" || user.userType === "parent" ? user.userType : "teacher",
      phoneNumber: phoneNumber || "",
      date: todayIsoDate(),
      status: "pending",
    })
    return
  }

  data.registrationRequests = data.registrationRequests.map((request) =>
    request.email === user.email
      ? {
          ...request,
          name: user.name,
          phoneNumber: phoneNumber || "",
          status: "approved",
        }
      : request,
  )
}

function toManagedUser(user: StoredUser, sessions: StoredSession[]): AdminManagedUser {
  const lastSession = sessions
    .filter((session) => session.userEmail === user.email)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0]

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.userType,
    status: resolveManagedUserStatus(user),
    lastActive: formatLastActive(lastSession?.createdAt || user.createdAt),
    createdAt: user.createdAt,
    phoneNumber: user.phoneNumber,
  }
}

function createSeedDatabase(): AuthDatabase {
  return {
    users: seedUsers.map((user) => {
      const password = hashPassword(user.password)
      return {
        id: randomUUID(),
        name: user.name,
        email: normalizeEmail(user.email),
        userType: user.userType,
        phoneNumber: user.phoneNumber,
        isApproved: user.isApproved,
        createdAt: todayIsoDate(),
        passwordHash: password.hash,
        passwordSalt: password.salt,
        accountStatus: "active",
      }
    }),
    registrationRequests: [...seedRequests],
    sessions: [],
  }
}

async function ensureDatabaseFile() {
  try {
    await fs.access(AUTH_DATA_FILE)
  } catch {
    await fs.mkdir(DATA_DIRECTORY, { recursive: true })
    await writeDatabase(createSeedDatabase())
  }
}

async function readDatabase(): Promise<AuthDatabase> {
  await ensureDatabaseFile()
  const raw = await fs.readFile(AUTH_DATA_FILE, "utf8")
  const parsed = JSON.parse(raw) as AuthDatabase
  return {
    users: Array.isArray(parsed.users)
      ? parsed.users.map((user) => ({
          ...user,
          email: normalizeEmail(String(user.email || "")),
          accountStatus: user.accountStatus === "inactive" ? "inactive" : "active",
        }))
      : [],
    registrationRequests: Array.isArray(parsed.registrationRequests) ? parsed.registrationRequests : [],
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
  }
}

async function writeDatabase(data: AuthDatabase) {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true })
  const tempFile = `${AUTH_DATA_FILE}.tmp`
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), "utf8")
  await fs.rename(tempFile, AUTH_DATA_FILE)
}

async function mutateDatabase<T>(mutator: (data: AuthDatabase) => Promise<T> | T): Promise<T> {
  const run = mutationQueue.catch(() => undefined).then(async () => {
    const data = await readDatabase()
    const result = await mutator(data)
    await writeDatabase(data)
    return result
  })

  mutationQueue = run.then(
    () => undefined,
    () => undefined,
  )

  return run
}

function pruneExpiredSessions(data: AuthDatabase) {
  const now = Date.now()
  data.sessions = data.sessions.filter((session) => new Date(session.expiresAt).getTime() > now)
}

export async function getSessionUser(sessionId: string | null): Promise<SessionUser | null> {
  if (!sessionId) {
    return null
  }

  const data = await readDatabase()
  pruneExpiredSessions(data)

  const session = data.sessions.find((entry) => entry.id === sessionId)
  if (!session) {
    return null
  }

  const user = data.users.find((entry) => entry.email === session.userEmail)
  if (!user || user.accountStatus === "inactive") {
    return null
  }

  return {
    ...toPublicUser(user),
    isEmailVerified: true,
  }
}

export async function loginUser(email: string, password: string) {
  return mutateDatabase((data) => {
    pruneExpiredSessions(data)

    const normalizedEmail = normalizeEmail(email)
    const user = data.users.find((entry) => entry.email === normalizedEmail)
    if (!user) {
      return { user: null, sessionId: null }
    }

    if (user.accountStatus === "inactive") {
      return { user: null, sessionId: null }
    }

    const rejectedRequest = data.registrationRequests.find(
      (request) => request.email === normalizedEmail && request.status === "rejected",
    )
    if (rejectedRequest) {
      return { user: null, sessionId: null }
    }

    const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt)
    if (!isValid) {
      return { user: null, sessionId: null }
    }

    const sessionId = randomUUID()
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString()
    data.sessions = data.sessions.filter((entry) => entry.userEmail !== normalizedEmail)
    data.sessions.push({
      id: sessionId,
      userEmail: normalizedEmail,
      createdAt: new Date().toISOString(),
      expiresAt,
    })

    return {
      user: {
        ...toPublicUser(user),
        isEmailVerified: true,
      } satisfies SessionUser,
      sessionId,
    }
  })
}

export async function registerUser(input: {
  name: string
  email: string
  password: string
  phoneNumber: string
  userType: RegistrationUserType
}) {
  return mutateDatabase((data) => {
    pruneExpiredSessions(data)

    const normalizedEmail = normalizeEmail(input.email)
    const existingUser = data.users.find((entry) => entry.email === normalizedEmail)
    if (existingUser) {
      throw new Error("يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل")
    }

    const existingRequest = data.registrationRequests.find(
      (entry) => entry.email === normalizedEmail && entry.status === "pending",
    )
    if (existingRequest) {
      throw new Error("يوجد طلب تسجيل قيد المراجعة لهذا البريد الإلكتروني")
    }

    const passwordHash = hashPassword(input.password)
    const newUser: StoredUser = {
      id: randomUUID(),
      name: input.name.trim(),
      email: normalizedEmail,
      userType: input.userType,
      phoneNumber: input.phoneNumber.trim(),
      isApproved: false,
      createdAt: todayIsoDate(),
      passwordHash: passwordHash.hash,
      passwordSalt: passwordHash.salt,
      accountStatus: "active",
    }

    const newRequest: RegistrationRequest = {
      id: randomUUID(),
      name: newUser.name,
      email: normalizedEmail,
      userType: input.userType,
      phoneNumber: newUser.phoneNumber || "",
      date: todayIsoDate(),
      status: "pending",
    }

    const sessionId = randomUUID()
    data.users.push(newUser)
    data.registrationRequests = data.registrationRequests.filter((entry) => entry.email !== normalizedEmail)
    data.registrationRequests.push(newRequest)
    data.sessions = data.sessions.filter((entry) => entry.userEmail !== normalizedEmail)
    data.sessions.push({
      id: sessionId,
      userEmail: normalizedEmail,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    })

    return {
      user: {
        ...toPublicUser(newUser),
        isEmailVerified: true,
      } satisfies SessionUser,
      request: newRequest,
      sessionId,
    }
  })
}

export async function logoutUser(sessionId: string | null) {
  if (!sessionId) {
    return
  }

  await mutateDatabase((data) => {
    data.sessions = data.sessions.filter((entry) => entry.id !== sessionId)
  })
}

export async function listRegistrationRequests() {
  const data = await readDatabase()
  return [...data.registrationRequests].sort((a, b) => b.date.localeCompare(a.date))
}

export async function updateRegistrationRequestStatus(input: {
  requestId: string
  status: "approved" | "rejected"
}) {
  return mutateDatabase((data) => {
    const request = data.registrationRequests.find((entry) => entry.id === input.requestId)
    if (!request) {
      throw new Error("لم يتم العثور على طلب التسجيل")
    }

    request.status = input.status

    if (input.status === "approved") {
      const user = data.users.find((entry) => entry.email === request.email)
      if (!user) {
        throw new Error("لم يتم العثور على المستخدم المرتبط بهذا الطلب")
      }

      user.isApproved = true
      user.accountStatus = "active"
    }

    if (input.status === "rejected") {
      data.users = data.users.filter((entry) => entry.email !== request.email)
      data.sessions = data.sessions.filter((entry) => entry.userEmail !== request.email)
    }

    return request
  })
}

export async function changePassword(input: {
  requesterEmail: string
  requesterRole: UserType
  targetEmail?: string
  currentPassword?: string
  newPassword: string
}) {
  return mutateDatabase((data) => {
    const normalizedRequesterEmail = normalizeEmail(input.requesterEmail)
    const normalizedTargetEmail = normalizeEmail(input.targetEmail || input.requesterEmail)
    const requester = data.users.find((entry) => entry.email === normalizedRequesterEmail)

    if (!requester) {
      throw new Error("تعذر التحقق من المستخدم الحالي")
    }

    const targetUser = data.users.find((entry) => entry.email === normalizedTargetEmail)
    if (!targetUser) {
      throw new Error("لم يتم العثور على الحساب المطلوب")
    }

    const isSelfService = normalizedRequesterEmail === normalizedTargetEmail
    if (isSelfService) {
      if (!input.currentPassword) {
        throw new Error("كلمة المرور الحالية مطلوبة")
      }

      const isValidCurrent = verifyPassword(input.currentPassword, requester.passwordHash, requester.passwordSalt)
      if (!isValidCurrent) {
        throw new Error("كلمة المرور الحالية غير صحيحة")
      }
    } else if (input.requesterRole !== "admin") {
      throw new Error("ليست لديك صلاحية لتغيير كلمة مرور حساب آخر")
    }

    const passwordHash = hashPassword(input.newPassword)
    targetUser.passwordHash = passwordHash.hash
    targetUser.passwordSalt = passwordHash.salt
  })
}

export async function updateUserProfile(input: {
  currentEmail: string
  nextName: string
  nextEmail: string
}) {
  return mutateDatabase((data) => {
    const normalizedCurrentEmail = normalizeEmail(input.currentEmail)
    const normalizedNextEmail = normalizeEmail(input.nextEmail)
    const user = data.users.find((entry) => entry.email === normalizedCurrentEmail)

    if (!user) {
      throw new Error("تعذر العثور على الحساب الحالي")
    }

    const emailTakenByOtherUser = data.users.some(
      (entry) => entry.email === normalizedNextEmail && entry.email !== normalizedCurrentEmail,
    )
    if (emailTakenByOtherUser) {
      throw new Error("البريد الإلكتروني مستخدم بالفعل")
    }

    user.name = input.nextName.trim()
    user.email = normalizedNextEmail

    data.registrationRequests = data.registrationRequests.map((request) =>
      request.email === normalizedCurrentEmail
        ? {
            ...request,
            name: user.name,
            email: normalizedNextEmail,
          }
        : request,
    )

    data.sessions = data.sessions.map((session) =>
      session.userEmail === normalizedCurrentEmail
        ? {
            ...session,
            userEmail: normalizedNextEmail,
          }
        : session,
    )

    return {
      ...toPublicUser(user),
      isEmailVerified: true,
    } satisfies SessionUser
  })
}

export async function listManagedUsers() {
  const data = await readDatabase()
  pruneExpiredSessions(data)
  return data.users
    .map((user) => toManagedUser(user, data.sessions))
    .sort((left, right) => left.name.localeCompare(right.name, "ar"))
}

export async function createManagedUser(input: {
  name: string
  email: string
  role: UserType
  status: ManagedUserStatus
  phoneNumber?: string
  password: string
}) {
  return mutateDatabase((data) => {
    pruneExpiredSessions(data)

    if (input.status === "pending" && !["teacher", "student", "parent"].includes(input.role)) {
      throw new Error("الحالة المعلقة متاحة فقط للمعلمين والطلاب وأولياء الأمور")
    }

    const normalizedEmail = normalizeEmail(input.email)
    if (data.users.some((entry) => entry.email === normalizedEmail)) {
      throw new Error("يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل")
    }

    const passwordHash = hashPassword(input.password)
    const user: StoredUser = {
      id: randomUUID(),
      name: input.name.trim(),
      email: normalizedEmail,
      userType: input.role,
      phoneNumber: input.phoneNumber?.trim(),
      isApproved: input.status !== "pending",
      createdAt: todayIsoDate(),
      passwordHash: passwordHash.hash,
      passwordSalt: passwordHash.salt,
      accountStatus: input.status === "inactive" ? "inactive" : "active",
    }

    data.users.push(user)
    syncRegistrationRequestsForManagedUser(data, user, input.status, input.phoneNumber)

    return toManagedUser(user, data.sessions)
  })
}

export async function updateManagedUser(input: {
  id: string
  name: string
  email: string
  role: UserType
  status: ManagedUserStatus
  phoneNumber?: string
}) {
  return mutateDatabase((data) => {
    pruneExpiredSessions(data)

    const user = data.users.find((entry) => entry.id === input.id)
    if (!user) {
      throw new Error("لم يتم العثور على المستخدم")
    }

    if (input.status === "pending" && !["teacher", "student", "parent"].includes(input.role)) {
      throw new Error("الحالة المعلقة متاحة فقط للمعلمين والطلاب وأولياء الأمور")
    }

    const normalizedEmail = normalizeEmail(input.email)
    const emailTaken = data.users.some((entry) => entry.email === normalizedEmail && entry.id !== input.id)
    if (emailTaken) {
      throw new Error("البريد الإلكتروني مستخدم بالفعل")
    }

    const previousEmail = user.email
    user.name = input.name.trim()
    user.email = normalizedEmail
    user.userType = input.role
    user.phoneNumber = input.phoneNumber?.trim()
    user.isApproved = input.status !== "pending"
    user.accountStatus = input.status === "inactive" ? "inactive" : "active"

    if (previousEmail !== normalizedEmail) {
      data.registrationRequests = data.registrationRequests.map((request) =>
        request.email === previousEmail
          ? {
              ...request,
              email: normalizedEmail,
              name: user.name,
            }
          : request,
      )

      data.sessions = data.sessions.map((session) =>
        session.userEmail === previousEmail
          ? {
              ...session,
              userEmail: normalizedEmail,
            }
          : session,
      )
    }

    if (input.status === "inactive") {
      data.sessions = data.sessions.filter((session) => session.userEmail !== normalizedEmail)
    }

    syncRegistrationRequestsForManagedUser(data, user, input.status, input.phoneNumber)

    return toManagedUser(user, data.sessions)
  })
}

export async function deleteManagedUser(userId: string) {
  return mutateDatabase((data) => {
    const user = data.users.find((entry) => entry.id === userId)
    if (!user) {
      throw new Error("لم يتم العثور على المستخدم")
    }

    data.users = data.users.filter((entry) => entry.id !== userId)
    data.registrationRequests = data.registrationRequests.filter((request) => request.email !== user.email)
    data.sessions = data.sessions.filter((session) => session.userEmail !== user.email)

    return true
  })
}
