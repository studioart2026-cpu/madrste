"use client"

import { useEffect } from "react"

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"
const EASTERN_ARABIC_INDIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹"

function toEnglishDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_INDIC_DIGITS.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(EASTERN_ARABIC_INDIC_DIGITS.indexOf(digit)))
}

function normalizeTextNode(node: Text): void {
  const parentTag = node.parentElement?.tagName
  if (!parentTag) return
  if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(parentTag)) return

  const current = node.nodeValue ?? ""
  const normalized = toEnglishDigits(current)
  if (current !== normalized) {
    node.nodeValue = normalized
  }
}

function normalizeInputs(): void {
  const fields = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")
  fields.forEach((field) => {
    const normalized = toEnglishDigits(field.value)
    if (field.value !== normalized) {
      const selectionStart = field.selectionStart
      const selectionEnd = field.selectionEnd
      field.value = normalized
      if (selectionStart !== null && selectionEnd !== null) {
        field.setSelectionRange(selectionStart, selectionEnd)
      }
    }
  })
}

export function EnglishNumeralsProvider() {
  useEffect(() => {
    const walkAndNormalize = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      let current = walker.nextNode()
      while (current) {
        normalizeTextNode(current as Text)
        current = walker.nextNode()
      }
    }

    walkAndNormalize(document.body)
    normalizeInputs()

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData" && mutation.target.nodeType === Node.TEXT_NODE) {
          normalizeTextNode(mutation.target as Text)
          continue
        }

        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            normalizeTextNode(node as Text)
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            walkAndNormalize(node)
          }
        })
      }
      normalizeInputs()
    })

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    })

    const handleInput = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
      const normalized = toEnglishDigits(target.value)
      if (target.value !== normalized) {
        const selectionStart = target.selectionStart
        const selectionEnd = target.selectionEnd
        target.value = normalized
        if (selectionStart !== null && selectionEnd !== null) {
          target.setSelectionRange(selectionStart, selectionEnd)
        }
      }
    }

    document.addEventListener("input", handleInput, true)
    document.addEventListener("change", handleInput, true)

    return () => {
      observer.disconnect()
      document.removeEventListener("input", handleInput, true)
      document.removeEventListener("change", handleInput, true)
    }
  }, [])

  return null
}
