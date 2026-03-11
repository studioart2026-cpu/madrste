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

function normalizeElementAttributes(root: ParentNode): void {
  const elements = root.querySelectorAll<HTMLElement>("*")
  elements.forEach((element) => {
    const placeholder = element.getAttribute("placeholder")
    if (placeholder) {
      const normalized = toEnglishDigits(placeholder)
      if (placeholder !== normalized) {
        element.setAttribute("placeholder", normalized)
      }
    }

    const title = element.getAttribute("title")
    if (title) {
      const normalized = toEnglishDigits(title)
      if (title !== normalized) {
        element.setAttribute("title", normalized)
      }
    }

    const ariaLabel = element.getAttribute("aria-label")
    if (ariaLabel) {
      const normalized = toEnglishDigits(ariaLabel)
      if (ariaLabel !== normalized) {
        element.setAttribute("aria-label", normalized)
      }
    }
  })
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
    const originalDateToLocaleDateString = Date.prototype.toLocaleDateString
    const originalDateToLocaleString = Date.prototype.toLocaleString
    const originalNumberToLocaleString = Number.prototype.toLocaleString

    Date.prototype.toLocaleDateString = function (...args: Parameters<Date["toLocaleDateString"]>) {
      return toEnglishDigits(originalDateToLocaleDateString.apply(this, args))
    }

    Date.prototype.toLocaleString = function (...args: Parameters<Date["toLocaleString"]>) {
      return toEnglishDigits(originalDateToLocaleString.apply(this, args))
    }

    Number.prototype.toLocaleString = function (...args: Parameters<Number["toLocaleString"]>) {
      return toEnglishDigits(originalNumberToLocaleString.apply(this, args))
    }

    const walkAndNormalize = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      let current = walker.nextNode()
      while (current) {
        normalizeTextNode(current as Text)
        current = walker.nextNode()
      }
    }

    walkAndNormalize(document.body)
    normalizeElementAttributes(document.body)
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
            normalizeElementAttributes(node as ParentNode)
          }
        })
      }
      normalizeElementAttributes(document.body)
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
      Date.prototype.toLocaleDateString = originalDateToLocaleDateString
      Date.prototype.toLocaleString = originalDateToLocaleString
      Number.prototype.toLocaleString = originalNumberToLocaleString
      observer.disconnect()
      document.removeEventListener("input", handleInput, true)
      document.removeEventListener("change", handleInput, true)
    }
  }, [])

  return null
}
