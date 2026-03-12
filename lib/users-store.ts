// نموذج بيانات المستخدم
export interface User {
  id: string
  name: string
  email: string
  password: string
  // تمت إضافة نوع "parent" ليشمل أولياء الأمور إلى جانبي المعلمين والطلاب
  userType: "admin" | "vice_admin" | "teacher" | "student" | "parent"
  phoneNumber?: string
  isApproved: boolean
  createdAt: string
}

// بيانات تجريبية للمستخدمين
export const initialUsers: User[] = [
  {
    id: "1",
    name: "مدير النظام",
    email: "mohamm3dalfeel@gmail.com",
    password: "Mo1020304050",
    userType: "admin",
    isApproved: true,
    createdAt: "2023-01-01",
  },
  {
    id: "2",
    name: "الجازي العقيل",
    email: "principal@school.edu.sa",
    password: "Principal@123",
    userType: "vice_admin",
    phoneNumber: "0501111111",
    isApproved: true,
    createdAt: "2023-01-02",
  },
  {
    id: "3",
    name: "سارة محمد",
    email: "teacher@example.com",
    password: "teacher123",
    userType: "teacher",
    phoneNumber: "0501234567",
    isApproved: true,
    createdAt: "2023-01-03",
  },
  {
    id: "4",
    name: "نورة أحمد",
    email: "teacher2@example.com",
    password: "teacher123",
    userType: "teacher",
    phoneNumber: "0502345678",
    isApproved: true,
    createdAt: "2023-01-04",
  },
  {
    id: "5",
    name: "عبدالله محمد",
    email: "student@example.com",
    password: "student123",
    userType: "student",
    phoneNumber: "0503456789",
    isApproved: true,
    createdAt: "2023-01-05",
  },
  {
    id: "6",
    name: "فهد خالد",
    email: "student2@example.com",
    password: "student123",
    userType: "student",
    phoneNumber: "0504567890",
    isApproved: true,
    createdAt: "2023-01-06",
  },
  {
    id: "7",
    name: "مشرف النظام",
    email: "admin2@school.edu.sa",
    password: "Admin@123",
    userType: "admin",
    phoneNumber: "0505678901",
    isApproved: true,
    createdAt: "2023-01-07",
  },
]

// مخزن المستخدمين - نمط Singleton للتأكد من وجود نسخة واحدة فقط
class UsersStore {
  private static instance: UsersStore
  private users: User[] = [...initialUsers]
  private subscribers: (() => void)[] = []

  private constructor() {
    // تحميل البيانات من التخزين المحلي عند إنشاء المخزن
    this.loadFromStorage()
    this.users = this.normalizeUsers(this.users)
    this.saveToStorage()
  }

  public static getInstance(): UsersStore {
    if (!UsersStore.instance) {
      UsersStore.instance = new UsersStore()
    }
    return UsersStore.instance
  }

  public getUsers(): User[] {
    return this.users
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email)
  }

  public addUser(user: Omit<User, "id" | "createdAt">): User {
    const newUser: User = {
      ...user,
      id: (this.users.length + 1).toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }

    this.users.push(newUser)
    this.saveToStorage()
    this.notifySubscribers()
    return newUser
  }

  public updateUser(email: string, updates: Partial<User>): boolean {
    const userIndex = this.users.findIndex((user) => user.email === email)
    if (userIndex === -1) return false

    this.users[userIndex] = { ...this.users[userIndex], ...updates }
    this.saveToStorage()
    this.notifySubscribers()
    return true
  }

  public updateUserPassword(email: string, newPassword: string): boolean {
    if (!newPassword || newPassword.length < 8) return false
    return this.updateUser(email, { password: newPassword })
  }

  public approveUser(email: string): boolean {
    const userIndex = this.users.findIndex((user) => user.email === email)
    if (userIndex === -1) {
      console.warn("لم يتم العثور على المستخدم للموافقة عليه:", email)
      return false
    }

    // تحديث حالة المستخدم
    this.users[userIndex].isApproved = true
    console.log("تم تحديث حالة المستخدم إلى معتمد:", email)

    // إشعار المشتركين بالتغيير
    this.notifySubscribers()

    // تحديث المستخدمين في localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("users", JSON.stringify(this.users))
        console.log("تم تحديث بيانات المستخدمين في التخزين المحلي")
      } catch (e) {
        console.error("خطأ في حفظ المستخدمين في التخزين المحلي:", e)
      }
    }

    return true
  }

  public deleteUser(email: string): boolean {
    const userIndex = this.users.findIndex((user) => user.email === email)
    if (userIndex === -1) return false

    this.users.splice(userIndex, 1)
    this.saveToStorage()
    this.notifySubscribers()
    return true
  }

  public validateCredentials(email: string, password: string): User | null {
    const user = this.users.find((u) => u.email === email && u.password === password)
    return user || null
  }

  // تحسين طريقة حفظ البيانات في التخزين المحلي
  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("users", JSON.stringify(this.users))
        console.log("تم حفظ بيانات المستخدمين في التخزين المحلي:", this.users.length)
      } catch (e) {
        console.error("خطأ في حفظ بيانات المستخدمين في التخزين المحلي:", e)
      }
    }
  }

  // تحسين طريقة تحميل البيانات من التخزين المحلي
  private loadFromStorage(): void {
    if (typeof window !== "undefined") {
      const storedUsers = localStorage.getItem("users")
      if (storedUsers) {
        try {
          // استخدام البيانات المخزنة بدلاً من البيانات الافتراضية
          this.users = JSON.parse(storedUsers)
          this.users = this.normalizeUsers(this.users)
          console.log("تم تحميل بيانات المستخدمين من التخزين المحلي:", this.users.length)
        } catch (e) {
          console.error("خطأ في تحميل بيانات المستخدمين من التخزين المحلي:", e)
          // في حالة الخطأ، استخدام البيانات الافتراضية
          this.users = [...initialUsers]
        }
      } else {
        // إذا لم تكن هناك بيانات مخزنة، استخدام البيانات الافتراضية
        this.users = [...initialUsers]
        // حفظ البيانات الافتراضية في التخزين المحلي
        this.saveToStorage()
      }
    }
  }

  private normalizeUsers(users: User[]): User[] {
    const filteredUsers = users.filter((user) => user.email !== "parent@example.com")
    const hasSecondaryAdmin = filteredUsers.some((user) => user.email === "admin2@school.edu.sa")

    if (!hasSecondaryAdmin) {
      filteredUsers.push({
        id: (filteredUsers.length + 1).toString(),
        name: "مشرف النظام",
        email: "admin2@school.edu.sa",
        password: "Admin@123",
        userType: "admin",
        phoneNumber: "0505678901",
        isApproved: true,
        createdAt: new Date().toISOString().split("T")[0],
      })
    }

    return filteredUsers
  }

  // نظام الاشتراك للإشعار بالتغييرات
  public subscribe(callback: () => void): () => void {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback())
  }
}

export const usersStore = UsersStore.getInstance()
