import { useToast } from '#imports'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  title?: string
  description?: string
  timeout?: number
}

export const useAppToast = () => {
  const toast = useToast()

  const show = (type: ToastType, message: string, options?: ToastOptions) => {
    const icons: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    }

    toast.add({
      title: options?.title || (icons[type] + ' ' + type.charAt(0).toUpperCase() + type.slice(1)),
      description: options?.description || message,
      color: type === 'error' ? 'red' : type === 'warning' ? 'orange' : type === 'info' ? 'blue' : 'green',
      timeout: options?.timeout || 5000,
    })
  }

  const success = (message: string, options?: ToastOptions) => show('success', message, options)
  const error = (message: string, options?: ToastOptions) => show('error', message, options)
  const warning = (message: string, options?: ToastOptions) => show('warning', message, options)
  const info = (message: string, options?: ToastOptions) => show('info', message, options)

  return { show, success, error, warning, info }
}