"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { pushNotificationService, PushNotificationPayload, createScheduleNotification, createTaskNotification, createFamilyNotification } from '@/lib/pushNotifications'

export interface Notification {
  id: string
  type: 'schedule' | 'subscription' | 'task' | 'family' | 'reminder' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
  actionLabel?: string
  expiresAt?: Date
  metadata?: Record<string, any>
}

export interface NotificationSettings {
  enableBrowserNotifications: boolean
  enablePushNotifications: boolean
  enableScheduleReminders: boolean
  enableSubscriptionAlerts: boolean
  enableTaskReminders: boolean
  enableFamilyUpdates: boolean
  reminderMinutesBefore: number
  quietHoursStart: string
  quietHoursEnd: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  settings: NotificationSettings
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  updateSettings: (settings: Partial<NotificationSettings>) => void
  requestPermission: () => Promise<boolean>
  scheduleNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>, delay: number) => void
  initializePushNotifications: () => Promise<boolean>
  subscribeToPush: () => Promise<boolean>
  unsubscribeFromPush: () => Promise<boolean>
  sendPushNotification: (payload: PushNotificationPayload) => Promise<void>
  isPushSupported: boolean
  isPushSubscribed: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const defaultSettings: NotificationSettings = {
  enableBrowserNotifications: true,
  enablePushNotifications: false,
  enableScheduleReminders: true,
  enableSubscriptionAlerts: true,
  enableTaskReminders: true,
  enableFamilyUpdates: true,
  reminderMinutesBefore: 15,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [isPushSupported, setIsPushSupported] = useState(false)
  const [isPushSubscribed, setIsPushSubscribed] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load settings and notifications from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedSettings = localStorage.getItem('notificationSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications)
      setNotifications(parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
        expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined
      })))
    }

    // Check initial permission status
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted')
    }

    // Initialize push notifications
    const initPush = async () => {
      const supported = (pushNotificationService.constructor as any).isSupported()
      setIsPushSupported(supported)
      
      if (supported) {
        const initialized = await pushNotificationService.initialize()
        if (initialized) {
          const subscription = await pushNotificationService.getSubscription()
          setIsPushSubscribed(!!subscription)
        }
      }
    }
    initPush()
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('metaFamily_notifications', JSON.stringify(notifications))
    }
  }, [notifications, mounted])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('metaFamily_notificationSettings', JSON.stringify(settings))
    }
  }, [settings, mounted])

  // Clean up expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setNotifications(prev => prev.filter(n => !n.expiresAt || n.expiresAt > now))
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const isQuietHours = () => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const startTime = parseInt(settings.quietHoursStart.split(':')[0]) * 60 + parseInt(settings.quietHoursStart.split(':')[1])
    const endTime = parseInt(settings.quietHoursEnd.split(':')[0]) * 60 + parseInt(settings.quietHoursEnd.split(':')[1])

    if (startTime > endTime) {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime
    } else {
      return currentTime >= startTime && currentTime <= endTime
    }
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev])

    // Show browser notification if enabled and permission granted
    if (settings.enableBrowserNotifications && permissionGranted && !isQuietHours()) {
      showBrowserNotification(newNotification)
    }
  }

  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: notification.priority === 'low',
      })

      browserNotification.onclick = () => {
        window.focus()
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl
        }
        browserNotification.close()
      }

      // Auto-close after 5 seconds for non-urgent notifications
      if (notification.priority !== 'urgent') {
        setTimeout(() => browserNotification.close(), 5000)
      }
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'granted') {
      setPermissionGranted(true)
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    const granted = permission === 'granted'
    setPermissionGranted(granted)
    return granted
  }

  const scheduleNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>, delay: number) => {
    setTimeout(() => {
      addNotification(notification)
    }, delay)
  }

  // Push notification methods
  const initializePushNotifications = async (): Promise<boolean> => {
    const supported = (pushNotificationService.constructor as any).isSupported()
    setIsPushSupported(supported)
    
    if (!supported) {
      return false
    }

    const initialized = await pushNotificationService.initialize()
    if (initialized) {
      const subscription = await pushNotificationService.getSubscription()
      setIsPushSubscribed(!!subscription)
    }
    return initialized
  }

  const subscribeToPush = async (): Promise<boolean> => {
    if (!isPushSupported) {
      return false
    }

    try {
      const subscription = await pushNotificationService.subscribe()
      const success = !!subscription
      setIsPushSubscribed(success)
      
      if (success) {
        // Update settings to enable push notifications
        updateSettings({ enablePushNotifications: true })
      } else {
        // Check if we're in localhost environment
        if (window.location.protocol === 'http:' && window.location.hostname === 'localhost') {
          console.info('Push notifications are not available in localhost development. They will work in production with HTTPS.')
        }
      }
      
      return success
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      setIsPushSubscribed(false)
      return false
    }
  }

  const unsubscribeFromPush = async (): Promise<boolean> => {
    const success = await pushNotificationService.unsubscribe()
    if (success) {
      setIsPushSubscribed(false)
      updateSettings({ enablePushNotifications: false })
    }
    return success
  }

  const sendPushNotification = async (payload: PushNotificationPayload): Promise<void> => {
    if (settings.enablePushNotifications && isPushSubscribed) {
      // In a real app, this would send to your server to trigger push notification
      // For demo purposes, we'll send a local notification
      await pushNotificationService.sendLocalNotification(payload)
    } else if (settings.enableBrowserNotifications) {
      // Fallback to local notification
      await pushNotificationService.sendLocalNotification(payload)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    updateSettings,
    requestPermission,
    scheduleNotification,
    initializePushNotifications,
    subscribeToPush,
    unsubscribeFromPush,
    sendPushNotification,
    isPushSupported,
    isPushSubscribed,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Helper functions for common notification types
export const createScheduleReminder = (eventTitle: string, eventTime: Date, memberName?: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'schedule',
  title: 'Upcoming Event',
  message: `${eventTitle}${memberName ? ` for ${memberName}` : ''} starts in 15 minutes`,
  priority: 'medium',
  actionUrl: '/?section=schedule',
  actionLabel: 'View Schedule',
  metadata: { eventTitle, eventTime, memberName },
})

export const createSubscriptionAlert = (subscriptionName: string, amount: number, dueDate: Date): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'subscription',
  title: 'Subscription Due',
  message: `${subscriptionName} payment of $${amount} is due ${dueDate.toLocaleDateString()}`,
  priority: 'high',
  actionUrl: '/?section=financial',
  actionLabel: 'Manage Subscriptions',
  metadata: { subscriptionName, dueDate, amount },
})

export const createTaskReminder = (taskTitle: string, assignee: string, dueDate: Date): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'task',
  title: 'Task Due Soon',
  message: `"${taskTitle}" assigned to ${assignee} is due ${dueDate.toLocaleDateString()}`,
  priority: 'medium',
  actionUrl: '/?section=activities',
  actionLabel: 'View Tasks',
  metadata: { taskTitle, assignee, dueDate },
})

export const createFamilyUpdate = (memberName: string, action: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'family',
  title: 'Family Update',
  message: `${memberName} ${action}`,
  priority: 'low',
  actionUrl: '/?section=family',
  actionLabel: 'View Family',
  metadata: { memberName, action },
})