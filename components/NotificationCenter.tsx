"use client"

import React, { useState } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'
import type { Notification, NotificationSettings } from '@/contexts/NotificationContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, BellOff, Settings, X, Check, CheckCheck, Trash2, Clock, AlertTriangle, Info, Calendar, CreditCard, CheckSquare, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface NotificationCenterProps {
  className?: string
  onNavigate?: (section: string) => void
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'schedule':
      return <Calendar className="h-4 w-4" />
    case 'subscription':
      return <CreditCard className="h-4 w-4" />
    case 'task':
      return <CheckSquare className="h-4 w-4" />
    case 'family':
      return <Users className="h-4 w-4" />
    case 'reminder':
      return <Clock className="h-4 w-4" />
    case 'system':
      return <Info className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

const getPriorityColor = (priority: Notification['priority']) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500 text-white'
    case 'high':
      return 'bg-orange-500 text-white'
    case 'medium':
      return 'bg-blue-500 text-white'
    case 'low':
      return 'bg-gray-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

const NotificationItem: React.FC<{ notification: Notification; onNavigate?: (section: string) => void }> = ({ notification, onNavigate }) => {
  const { markAsRead, removeNotification } = useNotifications()

  const handleAction = () => {
    if (notification.actionUrl && onNavigate) {
      // Extract section from actionUrl (e.g., "/?section=schedule" -> "schedule")
      const urlParams = new URLSearchParams(notification.actionUrl.split('?')[1] || '')
      const section = urlParams.get('section')
      if (section) {
        onNavigate(section)
      }
    }
    markAsRead(notification.id)
  }

  return (
    <Card className={`mb-3 transition-all duration-200 hover:shadow-md ${
      notification.read ? 'opacity-70' : 'border-l-4 border-l-blue-500'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-full ${
              notification.read ? 'bg-gray-100' : 'bg-blue-50'
            }`}>
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className={`font-medium text-sm ${
                  notification.read ? 'text-gray-600' : 'text-gray-900'
                }`}>
                  {notification.title}
                </h4>
                <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                  {notification.priority}
                </Badge>
              </div>
              <p className={`text-sm mb-2 ${
                notification.read ? 'text-gray-500' : 'text-gray-700'
              }`}>
                {notification.message}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                </span>
                <div className="flex items-center space-x-2">
                  {notification.actionLabel && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAction}
                      className="text-xs h-7"
                    >
                      {notification.actionLabel}
                    </Button>
                  )}
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs h-7 px-2"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeNotification(notification.id)}
                    className="text-xs h-7 px-2 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const NotificationSettings: React.FC = () => {
  const { settings, updateSettings, requestPermission, isPushSupported, isPushSubscribed, subscribeToPush, unsubscribeFromPush } = useNotifications()
  const [permissionRequested, setPermissionRequested] = useState(false)

  const handleRequestPermission = async () => {
    setPermissionRequested(true)
    const granted = await requestPermission()
    if (granted) {
      updateSettings({ enableBrowserNotifications: true })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notification Preferences</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="browser-notifications">Browser Notifications</Label>
              <p className="text-sm text-gray-500">Show desktop notifications</p>
            </div>
            <div className="flex items-center space-x-2">
              {!permissionRequested && Notification.permission === 'default' && (
                <Button size="sm" onClick={handleRequestPermission}>
                  Enable
                </Button>
              )}
              <Switch
                id="browser-notifications"
                checked={settings.enableBrowserNotifications}
                onCheckedChange={(checked) => updateSettings({ enableBrowserNotifications: checked })}
                disabled={Notification.permission === 'denied'}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="schedule-reminders">Schedule Reminders</Label>
              <p className="text-sm text-gray-500">Get notified about upcoming events</p>
            </div>
            <Switch
              id="schedule-reminders"
              checked={settings.enableScheduleReminders}
              onCheckedChange={(checked) => updateSettings({ enableScheduleReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="subscription-alerts">Subscription Alerts</Label>
              <p className="text-sm text-gray-500">Get notified about due payments</p>
            </div>
            <Switch
              id="subscription-alerts"
              checked={settings.enableSubscriptionAlerts}
              onCheckedChange={(checked) => updateSettings({ enableSubscriptionAlerts: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="task-reminders">Task Reminders</Label>
              <p className="text-sm text-gray-500">Get notified about due tasks</p>
            </div>
            <Switch
              id="task-reminders"
              checked={settings.enableTaskReminders}
              onCheckedChange={(checked) => updateSettings({ enableTaskReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="family-updates">Family Updates</Label>
              <p className="text-sm text-gray-500">Get notified about family activities</p>
            </div>
            <Switch
              id="family-updates"
              checked={settings.enableFamilyUpdates}
              onCheckedChange={(checked) => updateSettings({ enableFamilyUpdates: checked })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Push Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Enable Push Notifications</Label>
              <p className="text-sm text-gray-500">
                {isPushSupported ? 'Receive notifications even when the app is closed' : 'Push notifications not supported in this browser'}
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={isPushSubscribed}
              disabled={!isPushSupported}
              onCheckedChange={async (checked) => {
                if (checked) {
                  await subscribeToPush()
                } else {
                  await unsubscribeFromPush()
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Timing Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Reminder Time (minutes before)</Label>
            <Select
              value={settings.reminderMinutesBefore.toString()}
              onValueChange={(value) => updateSettings({ reminderMinutesBefore: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quiet-start">Quiet Hours Start</Label>
            <input
              type="time"
              id="quiet-start"
              value={settings.quietHoursStart}
              onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiet-end">Quiet Hours End</Label>
            <input
              type="time"
              id="quiet-end"
              value={settings.quietHoursEnd}
              onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className, onNavigate }) => {
  const { notifications, unreadCount, markAllAsRead, clearAllNotifications } = useNotifications()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          {unreadCount > 0 ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge className="bg-red-500">{unreadCount}</Badge>
              )}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              {notifications.length > 0 && (
                <>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      <CheckCheck className="h-4 w-4 mr-1" />
                      Mark All Read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {showSettings ? (
            <NotificationSettings />
          ) : (
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-sm">You'll see family updates and reminders here</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} onNavigate={onNavigate} />
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NotificationCenter