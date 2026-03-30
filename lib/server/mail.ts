import "server-only"

const RESEND_SEND_EMAIL_URL = "https://api.resend.com/emails"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function isTransactionalEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.MAIL_FROM?.trim())
}

export async function sendPasswordResetEmail(input: {
  to: string
  recipientName: string
  resetUrl: string
  expiresInMinutes: number
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.MAIL_FROM?.trim()

  if (!apiKey || !from) {
    throw new Error("خدمة البريد لإعادة تعيين كلمة المرور غير مهيأة")
  }

  const safeName = escapeHtml(input.recipientName || "المستخدم")
  const safeResetUrl = escapeHtml(input.resetUrl)
  const subject = "رابط إعادة تعيين كلمة المرور"
  const text = [
    `مرحباً ${input.recipientName || "المستخدم"},`,
    "",
    "تم استلام طلب لإعادة تعيين كلمة المرور الخاصة بحسابك.",
    `استخدم الرابط التالي خلال ${input.expiresInMinutes} دقيقة:`,
    input.resetUrl,
    "",
    "إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذه الرسالة.",
  ].join("\n")

  const html = `
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.8;color:#0f172a;max-width:640px">
      <h2 style="color:#0a8a74;margin-bottom:16px">إعادة تعيين كلمة المرور</h2>
      <p>مرحباً ${safeName}،</p>
      <p>تم استلام طلب لإعادة تعيين كلمة المرور الخاصة بحسابك في نظام المدرسة.</p>
      <p>اضغط على الزر التالي لإدخال كلمة مرور جديدة. صلاحية الرابط ${input.expiresInMinutes} دقيقة فقط.</p>
      <p style="margin:24px 0">
        <a
          href="${safeResetUrl}"
          style="display:inline-block;background:#0a8a74;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700"
        >
          إعادة تعيين كلمة المرور
        </a>
      </p>
      <p>إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذه الرسالة ولن يتغير شيء في حسابك.</p>
      <p style="font-size:13px;color:#475569">إذا لم يعمل الزر، انسخ الرابط التالي في المتصفح:</p>
      <p style="font-size:13px;word-break:break-all;color:#475569">${safeResetUrl}</p>
    </div>
  `.trim()

  const response = await fetch(RESEND_SEND_EMAIL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject,
      html,
      text,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error("Failed to send password reset email:", errorBody)
    throw new Error("تعذر إرسال رابط إعادة تعيين كلمة المرور")
  }
}
