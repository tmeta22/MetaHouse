'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle, Calendar, Users, DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useNotifications } from '@/contexts/NotificationContext'

interface NotificationSettings {
  taskReminders: boolean
  eventNotifications: boolean
  familyUpdates: boolean
  transactionAlerts: boolean
  subscriptionReminders: boolean
  pushNotifications: boolean
}

const defaultSettings: NotificationSettings = {
  taskReminders: true,
  eventNotifications: true,
  familyUpdates: true,
  transactionAlerts: false,
  subscriptionReminders: true,
  pushNotifications: true
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const { 
    requestPermission, 
    subscribeToPush, 
    unsubscribeFromPush, 
    isPushSupported, 
    isPushSubscribed 
  } = useNotifications()

  useEffect(() => {
    setMounted(true)
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Failed to parse notification settings:', error)
      }
    }
  }, [])

  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean) => {
    if (key === 'pushNotifications') {
      await handlePushNotificationToggle(value)
    } else {
      setSettings(prev => ({ ...prev, [key]: value }))
    }
  }

  const handlePushNotificationToggle = async (enable: boolean) => {
    if (enable) {
      // Request browser notification permission first
      const permissionGranted = await requestPermission()
      if (!permissionGranted) {
        toast({
          title: "Permission denied",
          description: "Please allow notifications in your browser settings to enable push notifications.",
          variant: "destructive",
        })
        return
      }

      // Subscribe to push notifications
      const subscribed = await subscribeToPush()
      if (subscribed) {
        setSettings(prev => ({ ...prev, pushNotifications: true }))
        toast({
          title: "Push notifications enabled",
          description: "You will now receive push notifications from Family Hub.",
        })
      } else {
        // Check if we're in localhost environment for better error message
        const isLocalhost = window.location.protocol === 'http:' && window.location.hostname === 'localhost'
        toast({
          title: "Push notifications not available",
          description: isLocalhost 
            ? "Push notifications require HTTPS and are not available in localhost development. They will work in production."
            : "There was an error setting up push notifications. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      // Unsubscribe from push notifications
      const unsubscribed = await unsubscribeFromPush()
      if (unsubscribed) {
        setSettings(prev => ({ ...prev, pushNotifications: false }))
        toast({
          title: "Push notifications disabled",
          description: "You will no longer receive push notifications.",
        })
      }
    }
  }

  const saveSettings = async () => {
    if (!mounted) return
    
    setIsLoading(true)
    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem('notificationSettings', JSON.stringify(settings))
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose what notifications you'd like to receive and how you'd like to receive them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Content Notifications</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <div>
                  <Label htmlFor="task-reminders" className="text-sm font-medium">
                    Task Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about upcoming and overdue tasks
                  </p>
                </div>
              </div>
              <Switch
                id="task-reminders"
                checked={settings.taskReminders}
                onCheckedChange={(checked) => handleSettingChange('taskReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-green-500" />
                <div>
                  <Label htmlFor="event-notifications" className="text-sm font-medium">
                    Event Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive alerts for upcoming family events
                  </p>
                </div>
              </div>
              <Switch
                id="event-notifications"
                checked={settings.eventNotifications}
                onCheckedChange={(checked) => handleSettingChange('eventNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-purple-500" />
                <div>
                  <Label htmlFor="family-updates" className="text-sm font-medium">
                    Family Updates
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Stay informed about family member activities
                  </p>
                </div>
              </div>
              <Switch
                id="family-updates"
                checked={settings.familyUpdates}
                onCheckedChange={(checked) => handleSettingChange('familyUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-4 w-4 text-red-500" />
                <div>
                  <Label htmlFor="transaction-alerts" className="text-sm font-medium">
                    Transaction Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about new transactions and expenses
                  </p>
                </div>
              </div>
              <Switch
                id="transaction-alerts"
                checked={settings.transactionAlerts}
                onCheckedChange={(checked) => handleSettingChange('transactionAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-4 w-4 text-orange-500" />
                <div>
                  <Label htmlFor="subscription-reminders" className="text-sm font-medium">
                    Subscription Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Reminders for upcoming subscription renewals
                  </p>
                </div>
              </div>
              <Switch
                id="subscription-reminders"
                checked={settings.subscriptionReminders}
                onCheckedChange={(checked) => handleSettingChange('subscriptionReminders', checked)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Delivery Methods</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications" className="text-sm font-medium">
                  Push Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isPushSupported 
                    ? "Receive notifications directly in your browser" 
                    : "Push notifications are not supported in this browser"}
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={isPushSubscribed}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                disabled={!isPushSupported}
              />
            </div>


          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={saveSettings} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}