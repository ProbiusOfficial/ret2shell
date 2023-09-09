import { get, writable } from 'svelte/store'
import { nanoid } from 'nanoid'

interface Toast {
  id: string
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
  persistTime?: number
  reject?: () => void
  rejectMessage?: string
  accept?: () => void
  acceptMessage?: string
}

class ToastStore {
  toasts: Toast[]
  constructor() {
    this.toasts = []
  }
}

export const toast = writable(new ToastStore())

export function showMessage(
  level: 'info' | 'success' | 'warning' | 'error',
  message: string,
  persistTime?: number,
  reject?: () => void,
  rejectMessage?: string,
  accept?: () => void,
  acceptMessage?: string
) {
  const id = nanoid()
  const msgObj = {
    id,
    level,
    message,
    persistTime,
    reject,
    rejectMessage,
    accept,
    acceptMessage,
  }
  toast.update((t) => {
    t.toasts.push(msgObj)
    return t
  })
  if (persistTime && persistTime > 0) {
    setTimeout(() => {
      removeMessage(id)
    }, persistTime)
  }
  return id
}

export function clearMessage() {
  toast.update((t) => {
    t.toasts = []
    return t
  })
}

export function removeMessage(id: string) {
  toast.update((t) => {
    t.toasts = t.toasts.filter((m) => m.id !== id)
    return t
  })
}
