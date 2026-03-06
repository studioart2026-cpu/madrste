export const verificationCodes: Record<string, string> = {}

export const registeredUsers: Record<string, { name: string; userType: string; isApproved: boolean }> = {
  "admin@school.edu.sa": { name: "مدير النظام", userType: "admin", isApproved: true },
  "vice@school.edu.sa": { name: "وكيلة المدرسة", userType: "vice_admin", isApproved: true },
  "teacher1@school.edu.sa": { name: "نورة المعلمة", userType: "teacher", isApproved: true },
  "teacher2@school.edu.sa": { name: "هند المعلمة", userType: "teacher", isApproved: true },
  "student1@school.edu.sa": { name: "سارة الطالبة", userType: "student", isApproved: true },
  "student2@school.edu.sa": { name: "ريم الطالبة", userType: "student", isApproved: true },
}
