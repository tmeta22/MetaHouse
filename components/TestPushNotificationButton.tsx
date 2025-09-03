'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/contexts/NotificationContext'
import { Bell } from 'lucide-react'

export default function TestPushNotificationButton() {
  const { sendPushNotification, isPushSupported, isPushSubscribed } = useNotifications()

  const handleTestPushNotification = async () => {
    if (!isPushSupported) {
      alert('Push notifications are not supported in this browser')
      return
    }

    if (!isPushSubscribed) {
      alert('Please enable push notifications in the notification settings first')
      return
    }

    try {
      await sendPushNotification({
        title: 'Test Push Notification',
        body: 'This is a test push notification from Meta Family!',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'test-notification',
        data: {
          type: 'test',
          timestamp: Date.now()
        }
      })
      console.log('Test push notification sent successfully')
    } catch (error) {
      console.error('Failed to send test push notification:', error)
      alert('Failed to send test push notification. Check console for details.')
    }
  }

  return (
    <Button 
      onClick={handleTestPushNotification}
      variant="outline" 
      className="h-12"
      disabled={!isPushSupported}
    >
      <Bell className="h-4 w-4 mr-2" />
      Test Push Notification
    </Button>
  )
}