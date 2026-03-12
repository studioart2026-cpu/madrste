'use client'

import { useEffect, useRef } from "react"
import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { playGentleNotificationTone, unlockNotificationAudio } from "@/lib/notification-sound"

export function Toaster() {
  const { toasts } = useToast()
  const latestToastIdRef = useRef<string | null>(null)

  useEffect(() => {
    const unlockAudio = () => {
      void unlockNotificationAudio()
    }

    window.addEventListener("pointerdown", unlockAudio, { passive: true })
    window.addEventListener("keydown", unlockAudio)

    return () => {
      window.removeEventListener("pointerdown", unlockAudio)
      window.removeEventListener("keydown", unlockAudio)
    }
  }, [])

  useEffect(() => {
    const latestToast = toasts[0]
    if (!latestToast) return
    if (latestToast.id === latestToastIdRef.current) return

    latestToastIdRef.current = latestToast.id
    void playGentleNotificationTone()
  }, [toasts])

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
