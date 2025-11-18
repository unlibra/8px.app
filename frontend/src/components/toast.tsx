'use client'

import { Transition, TransitionChild } from '@headlessui/react'
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { createContext, Fragment, useCallback, useContext, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast (): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider ({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = `${Date.now()}-${Math.random()}`
    const toast: Toast = { id, message, type, duration }

    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration)
  }, [showToast])

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer ({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) {
  return (
    <div className='pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-end gap-2 p-4 sm:p-6'>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem ({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
  const [show, setShow] = useState(true)

  const handleClose = () => {
    setShow(false)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className='size-6 text-green-600 dark:text-green-200' />
      case 'error':
        return <XCircleIcon className='size-6 text-red-600 dark:text-red-200' />
      case 'warning':
        return <ExclamationCircleIcon className='size-6 text-yellow-600 dark:text-yellow-200' />
      case 'info':
        return <InformationCircleIcon className='size-6 text-blue-600 dark:text-blue-200' />
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-800'
    }
  }

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800 dark:text-green-200'
      case 'error':
        return 'text-red-800 dark:text-red-200'
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200'
      case 'info':
        return 'text-blue-800 dark:text-blue-200'
    }
  }

  return (
    <Transition show={show} as={Fragment}>
      <div className='pointer-events-auto w-fit max-w-screen-sm'>
        <TransitionChild
          as={Fragment}
          enter='transform ease-out duration-300 transition'
          enterFrom='translate-x-full opacity-0'
          enterTo='translate-x-0 opacity-100'
          leave='transition ease-in duration-200'
          leaveFrom='translate-x-0 opacity-100'
          leaveTo='translate-x-full opacity-0'
        >
          <div className={`flex items-center gap-3 rounded-lg border p-4 shadow-lg ${getBgColor()}`}>
            {getIcon()}
            <div className={`flex-1 text-sm font-medium ${getTextColor()}`}>
              {toast.message}
            </div>
            <button
              onClick={handleClose}
              className='shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5'
              aria-label='閉じる'
            >
              <XMarkIcon className='size-5' />
            </button>
          </div>
        </TransitionChild>
      </div>
    </Transition>
  )
}
