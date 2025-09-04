// Push Notifications Service for Meta Family App
// Handles push notification subscriptions and messaging

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  url?: string
  requireInteraction?: boolean
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  data?: any
}

class PushNotificationService {
  private vapidPublicKey: string
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null

  constructor() {
    // In a real app, this would come from your server/environment variables
    // For demo purposes, we'll use a placeholder that won't cause errors
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  }

  // Initialize service worker and push notifications
  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported')
      return false
    }

    if (!('PushManager' in window)) {
      console.warn('Push messaging is not supported')
      return false
    }

    try {
      // Register service worker
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service worker registered:', this.serviceWorkerRegistration)

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready

      return true
    } catch (error) {
      console.error('Service worker registration failed:', error)
      return false
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported')
      return 'denied'
    }

    let permission = Notification.permission

    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }

    return permission
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscriptionData | null> {
    if (!this.serviceWorkerRegistration) {
      console.error('Service worker not registered')
      return null
    }

    // Check if VAPID key is properly configured
    if (!this.vapidPublicKey || this.vapidPublicKey === 'demo-vapid-key') {
      console.warn('VAPID public key not configured. Push notifications disabled.')
      return null
    }

    try {
      const permission = await this.requestPermission()
      if (permission !== 'granted') {
        console.warn('Notification permission not granted')
        return null
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey)

      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      })

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      }

      // Store subscription data locally
      localStorage.setItem('pushSubscription', JSON.stringify(subscriptionData))

      console.log('Push subscription successful:', subscriptionData)
      return subscriptionData
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      return false
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        localStorage.removeItem('pushSubscription')
        console.log('Push unsubscription successful')
        return true
      }
      return false
    } catch (error) {
      console.error('Push unsubscription failed:', error)
      return false
    }
  }

  // Get current subscription status
  async getSubscription(): Promise<PushSubscriptionData | null> {
    if (!this.serviceWorkerRegistration) {
      return null
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription()
      if (subscription) {
        return {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
          }
        }
      }
      return null
    } catch (error) {
      console.error('Failed to get subscription:', error)
      return null
    }
  }

  // Send a local notification (for demo purposes)
  async sendLocalNotification(payload: PushNotificationPayload): Promise<void> {
    const permission = await this.requestPermission()
    if (permission !== 'granted') {
      console.warn('Cannot send notification: permission not granted')
      return
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-72x72.png',
      tag: payload.tag || 'meta-family-local',
      requireInteraction: payload.requireInteraction || false,
      data: payload.data || { url: payload.url || '/' }
    })

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault()
      window.focus()
      if (payload.url) {
        window.location.href = payload.url
      }
      notification.close()
    }

    // Auto-close after 5 seconds if not requiring interaction
    if (!payload.requireInteraction) {
      setTimeout(() => {
        notification.close()
      }, 5000)
    }
  }

  // Utility: Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Utility: Convert ArrayBuffer to Base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  // Check if push notifications are supported
  static isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    )
  }

  // Get notification permission status
  static getPermissionStatus(): NotificationPermission {
    return Notification.permission
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService()

// Export utility functions
export const createScheduleNotification = (title: string, scheduledTime: Date): PushNotificationPayload => ({
  title: 'Schedule Reminder',
  body: `${title} is starting soon`,
  icon: '/icon-192x192.png',
  tag: 'schedule-reminder',
  url: '/?tab=schedule',
  requireInteraction: true,
  actions: [
    { action: 'view', title: 'View Schedule' },
    { action: 'dismiss', title: 'Dismiss' }
  ],
  data: { type: 'schedule', title, scheduledTime }
})

export const createTaskNotification = (task: string, priority: string): PushNotificationPayload => ({
  title: 'Task Reminder',
  body: `Don't forget: ${task}`,
  icon: '/icon-192x192.png',
  tag: 'task-reminder',
  url: '/?tab=tasks',
  requireInteraction: priority === 'high',
  actions: [
    { action: 'complete', title: 'Mark Complete' },
    { action: 'snooze', title: 'Snooze' }
  ],
  data: { type: 'task', task, priority }
})

export const createFamilyNotification = (member: string, activity: string): PushNotificationPayload => ({
  title: 'Family Update',
  body: `${member} ${activity}`,
  icon: '/icon-192x192.png',
  tag: 'family-update',
  url: '/?tab=family',
  actions: [
    { action: 'view', title: 'View Details' },
    { action: 'dismiss', title: 'Dismiss' }
  ],
  data: { type: 'family', member, activity }
})