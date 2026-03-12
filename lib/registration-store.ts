// نموذج بيانات طلب التسجيل
export interface RegistrationRequest {
  id: string
  name: string
  email: string
  // تم دعم ولي الأمر ضمن طلبات التسجيل
  userType: "teacher" | "student" | "parent"
  phoneNumber: string
  date: string
  status: "pending" | "approved" | "rejected"
}

// بيانات تجريبية لطلبات التسجيل
export const initialRequests: RegistrationRequest[] = [
  {
    id: "1",
    name: "نورة محمد",
    email: "noura@example.com",
    userType: "teacher",
    phoneNumber: "0501234567",
    date: "2023-05-10",
    status: "pending",
  },
  {
    id: "2",
    name: "سارة أحمد",
    email: "sara@example.com",
    userType: "student",
    phoneNumber: "0551234567",
    date: "2023-05-11",
    status: "pending",
  },
  {
    id: "3",
    name: "هند خالد",
    email: "hind@example.com",
    userType: "teacher",
    phoneNumber: "0561234567",
    date: "2023-05-09",
    status: "approved",
  },
  {
    id: "4",
    name: "ريم سعد",
    email: "reem@example.com",
    userType: "student",
    phoneNumber: "0571234567",
    date: "2023-05-08",
    status: "rejected",
  },
  {
    id: "5",
    name: "لمى عبدالله",
    email: "lama@example.com",
    userType: "teacher",
    phoneNumber: "0581234567",
    date: "2023-05-12",
    status: "pending",
  },
]

// مخزن طلبات التسجيل - نمط Singleton للتأكد من وجود نسخة واحدة فقط
class RegistrationStore {
  private static instance: RegistrationStore
  private requests: RegistrationRequest[] = [...initialRequests]
  private subscribers: (() => void)[] = []

  // تعديل المُنشئ لتحميل البيانات من التخزين المحلي
  private constructor() {
    // تحميل البيانات من التخزين المحلي عند إنشاء المخزن
    this.loadFromStorage()
    this.requests = this.normalizeRequests(this.requests)
  }

  public static getInstance(): RegistrationStore {
    if (!RegistrationStore.instance) {
      RegistrationStore.instance = new RegistrationStore()
    }
    return RegistrationStore.instance
  }

  public getRequests(): RegistrationRequest[] {
    return this.requests
  }

  public addRequest(request: Omit<RegistrationRequest, "id" | "date" | "status">): RegistrationRequest {
    const newRequest: RegistrationRequest = {
      ...request,
      id: (this.requests.length + 1).toString(),
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    }

    this.requests.push(newRequest)
    this.notifySubscribers()

    // حفظ الطلبات في localStorage للاحتفاظ بها بين جلسات التصفح
    if (typeof window !== "undefined") {
      localStorage.setItem("registrationRequests", JSON.stringify(this.requests))
    }

    return newRequest
  }

  public updateRequestStatus(id: string, status: "approved" | "rejected"): boolean {
    const requestIndex = this.requests.findIndex((req) => req.id === id)
    if (requestIndex === -1) return false

    // تحديث حالة الطلب
    this.requests[requestIndex].status = status

    // إشعار المشتركين بالتغيير
    this.notifySubscribers()

    // تحديث الطلبات في localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("registrationRequests", JSON.stringify(this.requests))
        console.log("تم تحديث حالة الطلب بنجاح:", id, status)
        console.log("الطلبات المحدثة:", this.requests)
      } catch (e) {
        console.error("خطأ في حفظ الطلبات في التخزين المحلي:", e)
      }
    }

    return true
  }

  public getRequestByEmail(email: string): RegistrationRequest | undefined {
    return this.requests.find((req) => req.email === email)
  }

  // تحسين طريقة تحميل البيانات من التخزين المحلي
  public loadFromStorage(): void {
    if (typeof window !== "undefined") {
      const storedRequests = localStorage.getItem("registrationRequests")
      if (storedRequests) {
        try {
          // استخدام البيانات المخزنة بدلاً من البيانات الافتراضية
          this.requests = JSON.parse(storedRequests)
          this.requests = this.normalizeRequests(this.requests)
          console.log("تم تحميل طلبات التسجيل من التخزين المحلي:", this.requests.length)
        } catch (e) {
          console.error("خطأ في تحميل طلبات التسجيل من التخزين المحلي:", e)
          // في حالة الخطأ، استخدام البيانات الافتراضية
          this.requests = [...initialRequests]
        }
      } else {
        // إذا لم تكن هناك بيانات مخزنة، استخدام البيانات الافتراضية
        this.requests = [...initialRequests]
        // حفظ البيانات الافتراضية في التخزين المحلي
        if (typeof window !== "undefined") {
          localStorage.setItem("registrationRequests", JSON.stringify(this.requests))
        }
      }
    }
  }

  private normalizeRequests(requests: RegistrationRequest[]): RegistrationRequest[] {
    return requests.filter((req) => req.userType !== "parent" && req.email !== "parent@example.com")
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

export const registrationStore = RegistrationStore.getInstance()

// تحميل الطلبات من التخزين المحلي عند بدء التطبيق
if (typeof window !== "undefined") {
  setTimeout(() => {
    registrationStore.loadFromStorage()
  }, 0)
}
