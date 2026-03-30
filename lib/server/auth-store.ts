import "server-only"

import { promises as fs } from "node:fs"
import path from "node:path"
import { createHash, randomBytes, randomUUID } from "node:crypto"
import type {
  AdminManagedUser,
  AuthUser,
  ManagedUserStatus,
  RegistrationRequest,
  RegistrationUserType,
  SessionUser,
  UserType,
} from "@/lib/auth-types"
import type { ManagedStudent } from "@/lib/student-roster"
import type { TeacherDirectoryEntry } from "@/lib/teachers-directory"
import { hashPassword, verifyPassword } from "@/lib/server/password"
import { getServerDataDirectory } from "@/lib/server/data-directory"
import { SESSION_DURATION_MS } from "@/lib/server/session"

interface StoredUser extends AuthUser {
  passwordHash: string
  passwordSalt: string
  accountStatus: Extract<ManagedUserStatus, "active" | "inactive">
  isDeletionProtected?: boolean
}

interface StoredSession {
  id: string
  userEmail: string
  createdAt: string
  expiresAt: string
}

interface PasswordResetToken {
  id: string
  email: string
  tokenHash: string
  createdAt: string
  expiresAt: string
}

interface AuthDatabase {
  users: StoredUser[]
  registrationRequests: RegistrationRequest[]
  sessions: StoredSession[]
  passwordResetTokens: PasswordResetToken[]
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
  isDeletionProtected?: boolean
}> = [
  {
    name: "مدير النظام",
    email: "mohamm3dalfeel@gmail.com",
    password: "Mo1020304050",
    userType: "admin" as const,
    isApproved: true,
    isDeletionProtected: true,
  },
  {
    name: "الجازي العقيل",
    email: "principal@school.edu.sa",
    password: "Principal@123",
    userType: "vice_admin" as const,
    phoneNumber: "0501111111",
    isApproved: true,
  },
]

const seedRequests: RegistrationRequest[] = []

const demoUserEmails = new Set([
  "teacher@example.com",
  "teacher2@example.com",
  "student@example.com",
  "student2@example.com",
])

const demoRequestEmails = new Set([
  "noura@example.com",
  "sara@example.com",
])

const DELETION_PROTECTED_EMAILS = new Set(["mohamm3dalfeel@gmail.com"])
const PASSWORD_RESET_TOKEN_DURATION_MS = 1000 * 60 * 30

export const PASSWORD_RESET_TOKEN_DURATION_MINUTES = PASSWORD_RESET_TOKEN_DURATION_MS / (1000 * 60)

let mutationQueue = Promise.resolve()

function todayIsoDate() {
  return new Date().toISOString().split("T")[0]
}

function toPublicUser(user: StoredUser): AuthUser {
  const {
    passwordHash: _passwordHash,
    passwordSalt: _passwordSalt,
    accountStatus: _accountStatus,
    isDeletionProtected: _isDeletionProtected,
    ...publicUser
  } = user
  return publicUser
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function isDeletionProtectedUser(input: { email: string; isDeletionProtected?: boolean }) {
  return Boolean(input.isDeletionProtected) || DELETION_PROTECTED_EMAILS.has(normalizeEmail(input.email))
}

function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

function normalizePhone(value: string | undefined) {
  return String(value || "").replace(/\D/g, "")
}

function normalizeTeacherName(value: string | undefined) {
  return String(value || "")
    .replace(/^أ\.\s*/u, "")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeStudentName(value: string | undefined) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
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
    isDeletionProtected: isDeletionProtectedUser(user),
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
        isDeletionProtected: user.isDeletionProtected,
      }
    }),
    registrationRequests: [...seedRequests],
    sessions: [],
    passwordResetTokens: [],
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

  const users = Array.isArray(parsed.users)
    ? parsed.users
        .map((user) => ({
          ...user,
          email: normalizeEmail(String(user.email || "")),
          accountStatus: (user.accountStatus === "inactive" ? "inactive" : "active") as StoredUser["accountStatus"],
        }))
        .filter((user) => !demoUserEmails.has(user.email))
    : []

  const knownEmails = new Set(users.map((user) => user.email))

  return {
    users,
    registrationRequests: Array.isArray(parsed.registrationRequests)
      ? parsed.registrationRequests.filter((request) => {
          const normalizedEmail = normalizeEmail(String(request.email || ""))
          return !demoRequestEmails.has(normalizedEmail) && !demoUserEmails.has(normalizedEmail)
        })
      : [],
    sessions: Array.isArray(parsed.sessions)
      ? parsed.sessions.filter((session) => knownEmails.has(normalizeEmail(session.userEmail)))
      : [],
    passwordResetTokens: Array.isArray(parsed.passwordResetTokens)
      ? parsed.passwordResetTokens
          .map((token) => ({
            id: String(token.id || ""),
            email: normalizeEmail(String(token.email || "")),
            tokenHash: String(token.tokenHash || ""),
            createdAt: String(token.createdAt || ""),
            expiresAt: String(token.expiresAt || ""),
          }))
          .filter((token) => token.id && token.tokenHash && knownEmails.has(token.email))
      : [],
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

function pruneExpiredPasswordResetTokens(data: AuthDatabase) {
  const now = Date.now()
  data.passwordResetTokens = data.passwordResetTokens.filter((token) => new Date(token.expiresAt).getTime() > now)
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

export async function renewSession(sessionId: string | null) {
  if (!sessionId) {
    return false
  }

  return mutateDatabase((data) => {
    pruneExpiredSessions(data)

    const session = data.sessions.find((entry) => entry.id === sessionId)
    if (!session) {
      return false
    }

    session.expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString()
    return true
  })
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

export async function createPasswordResetRequest(email: string) {
  return mutateDatabase((data) => {
    pruneExpiredPasswordResetTokens(data)

    const normalizedEmail = normalizeEmail(email)
    const user = data.users.find((entry) => entry.email === normalizedEmail)
    if (!user || user.accountStatus === "inactive") {
      return null
    }

    data.passwordResetTokens = data.passwordResetTokens.filter((entry) => entry.email !== normalizedEmail)

    const rawToken = randomBytes(32).toString("hex")
    const createdAt = new Date().toISOString()
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_DURATION_MS).toISOString()

    data.passwordResetTokens.push({
      id: randomUUID(),
      email: normalizedEmail,
      tokenHash: hashPasswordResetToken(rawToken),
      createdAt,
      expiresAt,
    })

    return {
      email: normalizedEmail,
      name: user.name,
      token: rawToken,
      expiresAt,
    }
  })
}

export async function validatePasswordResetToken(token: string) {
  const normalizedToken = token.trim()
  if (!normalizedToken) {
    return null
  }

  const data = await readDatabase()
  const tokenHash = hashPasswordResetToken(normalizedToken)
  const matchedToken = data.passwordResetTokens.find((entry) => entry.tokenHash === tokenHash)
  if (!matchedToken) {
    return null
  }

  if (new Date(matchedToken.expiresAt).getTime() <= Date.now()) {
    return null
  }

  const user = data.users.find((entry) => entry.email === matchedToken.email)
  if (!user || user.accountStatus === "inactive") {
    return null
  }

  return {
    email: matchedToken.email,
    expiresAt: matchedToken.expiresAt,
  }
}

export async function resetPasswordWithToken(input: {
  token: string
  newPassword: string
}) {
  return mutateDatabase((data) => {
    pruneExpiredPasswordResetTokens(data)

    const tokenHash = hashPasswordResetToken(input.token.trim())
    const matchedToken = data.passwordResetTokens.find((entry) => entry.tokenHash === tokenHash)
    if (!matchedToken) {
      throw new Error("رابط إعادة التعيين غير صالح أو انتهت صلاحيته")
    }

    const user = data.users.find((entry) => entry.email === matchedToken.email)
    if (!user || user.accountStatus === "inactive") {
      throw new Error("رابط إعادة التعيين غير صالح أو انتهت صلاحيته")
    }

    const passwordHash = hashPassword(input.newPassword)
    user.passwordHash = passwordHash.hash
    user.passwordSalt = passwordHash.salt

    data.passwordResetTokens = data.passwordResetTokens.filter((entry) => entry.email !== user.email)
    data.sessions = data.sessions.filter((entry) => entry.userEmail !== user.email)

    return {
      email: user.email,
    }
  })
}

export async function changePassword(input: {
  requesterEmail: string
  requesterRole: UserType
  targetEmail: string
  newPassword: string
}) {
  return mutateDatabase((data) => {
    pruneExpiredPasswordResetTokens(data)

    const normalizedRequesterEmail = normalizeEmail(input.requesterEmail)
    const normalizedTargetEmail = normalizeEmail(input.targetEmail)
    const requester = data.users.find((entry) => entry.email === normalizedRequesterEmail)

    if (!requester) {
      throw new Error("تعذر التحقق من المستخدم الحالي")
    }

    if (input.requesterRole !== "admin") {
      throw new Error("تغيير كلمات المرور من مهام مدير النظام فقط")
    }

    const targetUser = data.users.find((entry) => entry.email === normalizedTargetEmail)
    if (!targetUser) {
      throw new Error("لم يتم العثور على الحساب المطلوب")
    }

    const passwordHash = hashPassword(input.newPassword)
    targetUser.passwordHash = passwordHash.hash
    targetUser.passwordSalt = passwordHash.salt
    data.passwordResetTokens = data.passwordResetTokens.filter((entry) => entry.email !== normalizedTargetEmail)
  })
}

export async function updateUserProfile(input: {
  currentEmail: string
  nextName: string
  nextEmail: string
}) {
  return mutateDatabase((data) => {
    pruneExpiredPasswordResetTokens(data)

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

    data.passwordResetTokens = data.passwordResetTokens.filter((entry) => entry.email !== normalizedCurrentEmail)

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
  password?: string
}) {
  return mutateDatabase((data) => {
    pruneExpiredSessions(data)
    pruneExpiredPasswordResetTokens(data)

    const user = data.users.find((entry) => entry.id === input.id)
    if (!user) {
      throw new Error("لم يتم العثور على المستخدم")
    }

    if (isDeletionProtectedUser(user)) {
      user.isDeletionProtected = true
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

      data.passwordResetTokens = data.passwordResetTokens.filter((entry) => entry.email !== previousEmail)
    }

    if (input.password?.trim()) {
      const passwordHash = hashPassword(input.password.trim())
      user.passwordHash = passwordHash.hash
      user.passwordSalt = passwordHash.salt
      data.sessions = data.sessions.filter(
        (session) => session.userEmail !== previousEmail && session.userEmail !== normalizedEmail,
      )
      data.passwordResetTokens = data.passwordResetTokens.filter(
        (entry) => entry.email !== previousEmail && entry.email !== normalizedEmail,
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
    pruneExpiredPasswordResetTokens(data)

    const user = data.users.find((entry) => entry.id === userId)
    if (!user) {
      throw new Error("لم يتم العثور على المستخدم")
    }

    if (isDeletionProtectedUser(user)) {
      throw new Error("لا يمكن حذف هذا الحساب المحمي")
    }

    data.users = data.users.filter((entry) => entry.id !== userId)
    data.registrationRequests = data.registrationRequests.filter((request) => request.email !== user.email)
    data.sessions = data.sessions.filter((session) => session.userEmail !== user.email)
    data.passwordResetTokens = data.passwordResetTokens.filter((entry) => entry.email !== user.email)

    return true
  })
}

export async function deleteManagedTeacherAccountsByDirectoryEntries(
  teachers: Array<Pick<TeacherDirectoryEntry, "name" | "email" | "phone">>,
) {
  const normalizedTeachers = teachers
    .map((teacher) => ({
      name: normalizeTeacherName(teacher.name),
      email: teacher.email ? normalizeEmail(teacher.email) : "",
      phone: normalizePhone(teacher.phone),
    }))
    .filter((teacher) => teacher.name || teacher.email || teacher.phone)

  if (normalizedTeachers.length === 0) {
    return 0
  }

  return mutateDatabase((data) => {
    pruneExpiredSessions(data)

    const removedEmails = new Set<string>()

    const shouldRemoveTeacher = (input: {
      name?: string
      email?: string
      phone?: string
      userType?: UserType | RegistrationUserType
    }) => {
      if (input.userType && input.userType !== "teacher") {
        return false
      }

      const normalizedName = normalizeTeacherName(input.name)
      const normalizedEmail = input.email ? normalizeEmail(input.email) : ""
      const normalizedPhone = normalizePhone(input.phone)

      return normalizedTeachers.some((teacher) => {
        if (teacher.email && normalizedEmail) {
          return teacher.email === normalizedEmail
        }

        if (teacher.phone && normalizedPhone) {
          return teacher.phone === normalizedPhone
        }

        return teacher.name.length > 0 && teacher.name === normalizedName
      })
    }

    data.users.forEach((user) => {
      if (user.userType === "teacher" && shouldRemoveTeacher(user)) {
        removedEmails.add(user.email)
      }
    })

    data.users = data.users.filter((user) => !removedEmails.has(user.email))
    data.sessions = data.sessions.filter((session) => !removedEmails.has(session.userEmail))
    data.registrationRequests = data.registrationRequests.filter((request) => {
      if (removedEmails.has(normalizeEmail(request.email))) {
        return false
      }

      return !shouldRemoveTeacher({
        name: request.name,
        email: request.email,
        phone: request.phoneNumber,
        userType: request.userType,
      })
    })

    return removedEmails.size
  })
}

export async function deleteManagedStudentAccountsByDirectoryEntries(
  students: Array<Pick<ManagedStudent, "name" | "parentPhone">>,
) {
  const normalizedStudents = students
    .map((student) => ({
      name: normalizeStudentName(student.name),
      phone: normalizePhone(student.parentPhone),
    }))
    .filter((student) => student.name || student.phone)

  if (normalizedStudents.length === 0) {
    return 0
  }

  return mutateDatabase((data) => {
    pruneExpiredSessions(data)

    const removedEmails = new Set<string>()

    const shouldRemoveStudent = (input: {
      name?: string
      phone?: string
      userType?: UserType | RegistrationUserType
    }) => {
      if (input.userType && input.userType !== "student") {
        return false
      }

      const normalizedName = normalizeStudentName(input.name)
      const normalizedPhone = normalizePhone(input.phone)

      return normalizedStudents.some((student) => {
        if (student.phone && normalizedPhone) {
          return student.phone === normalizedPhone
        }

        return student.name.length > 0 && student.name === normalizedName
      })
    }

    data.users.forEach((user) => {
      if (user.userType === "student" && shouldRemoveStudent(user)) {
        removedEmails.add(user.email)
      }
    })

    data.users = data.users.filter((user) => !removedEmails.has(user.email))
    data.sessions = data.sessions.filter((session) => !removedEmails.has(session.userEmail))
    data.registrationRequests = data.registrationRequests.filter((request) => {
      if (removedEmails.has(normalizeEmail(request.email))) {
        return false
      }

      return !shouldRemoveStudent({
        name: request.name,
        phone: request.phoneNumber,
        userType: request.userType,
      })
    })

    return removedEmails.size
  })
}
