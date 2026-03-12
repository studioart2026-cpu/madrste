import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b py-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image src="/images/moe-logo.png" alt="شعار وزارة التعليم" width={120} height={60} className="h-auto" />
            <div>
              <h1 className="text-2xl font-bold text-primary">المدرسة المتوسطة ١٣٦</h1>
              <p className="text-gray-600">نظام الإدارة المدرسية</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild>
              <Link href="/register">إنشاء حساب</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-primary text-white text-center py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">مرحباً بكم في نظام إدارة المدرسة المتوسطة ١٣٦</h1>
            <p className="text-xl md:text-2xl mb-8">منصة متكاملة للطلاب والمعلمين وإدارة المدرسة</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">إنشاء حساب جديد</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">مميزات النظام</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">متابعة الدرجات</h3>
                <p className="text-gray-600">
                  متابعة مستمرة للدرجات والتقييمات وإمكانية الاطلاع على التقارير الدورية للمستوى الدراسي.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">الجدول الدراسي</h3>
                <p className="text-gray-600">عرض الجدول الدراسي ومواعيد الحصص والأنشطة المدرسية بطريقة سهلة ومنظمة.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">متابعة الحضور</h3>
                <p className="text-gray-600">تسجيل ومتابعة حضور وغياب الطلاب وإرسال تنبيهات للمعنيين.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">التواصل الفعال</h3>
                <p className="text-gray-600">تواصل سهل وفعال بين الطلاب والمعلمين وإدارة المدرسة وأولياء الأمور.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">المحتوى التعليمي</h3>
                <p className="text-gray-600">
                  توفير المحتوى التعليمي والمصادر الإثرائية للطلاب وإمكانية تحميلها والاطلاع عليها.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">الإعلانات والتنبيهات</h3>
                <p className="text-gray-600">
                  إرسال الإعلانات والتنبيهات الهامة والإشعارات حول الأحداث والفعاليات المدرسية.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">كيفية استخدام النظام</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2">إنشاء حساب</h3>
                <p className="text-gray-600">
                  قم بإنشاء حساب جديد من خلال تعبئة البيانات المطلوبة وانتظار موافقة إدارة المدرسة.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">تسجيل الدخول</h3>
                <p className="text-gray-600">قم بتسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور الخاصة بك.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">استخدام الخدمات</h3>
                <p className="text-gray-600">
                  استمتع بالخدمات المتنوعة التي يقدمها النظام، من متابعة الدرجات والحضور إلى الجدول الدراسي والتواصل مع
                  المعلمين.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">المدرسة المتوسطة ١٣٦</h3>
              <p className="text-sm">نظام متكامل لإدارة شؤون المدرسة والطلاب والمعلمين.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-sm hover:underline">
                    تسجيل الدخول
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-sm hover:underline">
                    إنشاء حساب
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/support" className="text-sm hover:underline">
                    الدعم الفني
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
              <ul className="space-y-2">
                <li className="text-sm">البريد الإلكتروني: school136@example.com</li>
                <li className="text-sm">الهاتف: 0112345678</li>
                <li className="text-sm">العنوان: الرياض، المملكة العربية السعودية</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">ساعات العمل</h3>
              <ul className="space-y-2">
                <li className="text-sm">الأحد - الخميس: 7:00 صباحًا - 1:00 ظهرًا</li>
                <li className="text-sm">الجمعة - السبت: مغلق</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p>جميع الحقوق محفوظة © المدرسة المتوسطة ١٣٦ - {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
