'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle, Calendar, Users, DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface NotificationSettings {
  taskReminders: boolean
  eventNotifications: boolean
  familyUpdates: boolean
  transactionAlerts: boolean
  subscriptionReminders: boolean
  pushNotifications: boolean
  emailNotifications: boolean
}

const defaultSettings: NotificationSettings = {
  taskReminders: true,
  eventNotifications: true,
  familyUpdates: true,
  transactionAlerts: false,
  subscriptionReminders: true,
  pushNotifications: true,
  emailNotifications: false
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
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
                  Receive notifications directly in your browser
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div>
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  Email Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications via email (coming soon)
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                disabled
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