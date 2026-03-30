import { ResetPasswordForm } from "@/components/reset-password-form"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const resolvedSearchParams = await searchParams
  const tokenValue = resolvedSearchParams.token
  const token = typeof tokenValue === "string" ? tokenValue : Array.isArray(tokenValue) ? tokenValue[0] || "" : ""

  return <ResetPasswordForm token={token} />
}
