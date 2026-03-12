"use client"

export default function MinimalClassesPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">صفحة الفصول الدراسية المبسطة</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2">الصف الأول أ</h2>
          <div className="flex gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">الأول</span>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-400">
              الشعبة أ
            </span>
          </div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">المعلم:</span>
              <span>أ. فاطمة محمد</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">عدد الطلاب:</span>
              <span>25</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2">الصف الثاني ب</h2>
          <div className="flex gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">الثاني</span>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-400">
              الشعبة ب
            </span>
          </div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">المعلم:</span>
              <span>أ. نورة أحمد</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">عدد الطلاب:</span>
              <span>22</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2">الصف الثالث ج</h2>
          <div className="flex gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">الثالث</span>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-400">
              الشعبة ج
            </span>
          </div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">المعلم:</span>
              <span>أ. عائشة علي</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">عدد الطلاب:</span>
              <span>28</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
