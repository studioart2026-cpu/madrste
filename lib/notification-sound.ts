const NOTIFICATION_SOUND_ENABLED_KEY = "notification-sound-enabled"

let audioContextInstance: AudioContext | null = null

const getAudioContext = () => {
  if (typeof window === "undefined") return null

  const AudioContextConstructor =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioContextConstructor) return null

  if (!audioContextInstance) {
    audioContextInstance = new AudioContextConstructor()
  }

  return audioContextInstance
}

export const isNotificationSoundEnabled = () => {
  if (typeof window === "undefined") return false
  const stored = localStorage.getItem(NOTIFICATION_SOUND_ENABLED_KEY)
  return stored === null ? true : stored === "true"
}

export const setNotificationSoundEnabled = (enabled: boolean) => {
  if (typeof window === "undefined") return
  localStorage.setItem(NOTIFICATION_SOUND_ENABLED_KEY, enabled.toString())
}

export const unlockNotificationAudio = async () => {
  const context = getAudioContext()
  if (!context) return

  if (context.state === "suspended") {
    try {
      await context.resume()
    } catch {
      // Ignore browser resume errors.
    }
  }
}

export const playGentleNotificationTone = async () => {
  if (typeof window === "undefined" || !isNotificationSoundEnabled()) return

  const context = getAudioContext()
  if (!context) return

  try {
    if (context.state === "suspended") {
      await context.resume()
    }

    const now = context.currentTime
    const masterGain = context.createGain()
    masterGain.gain.setValueAtTime(0.0001, now)
    masterGain.gain.exponentialRampToValueAtTime(0.035, now + 0.02)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4)
    masterGain.connect(context.destination)

    const notes = [
      { frequency: 523.25, start: 0, duration: 0.28 },
      { frequency: 659.25, start: 0.18, duration: 0.34 },
    ]

    notes.forEach((note) => {
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(note.frequency, now + note.start)

      gainNode.gain.setValueAtTime(0.0001, now + note.start)
      gainNode.gain.exponentialRampToValueAtTime(0.18, now + note.start + 0.03)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration)

      oscillator.connect(gainNode)
      gainNode.connect(masterGain)
      oscillator.start(now + note.start)
      oscillator.stop(now + note.start + note.duration)
    })
  } catch {
    // Ignore playback failures caused by browser autoplay policies.
  }
}

export { NOTIFICATION_SOUND_ENABLED_KEY }
