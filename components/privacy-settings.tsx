'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Shield, Download, Trash2, Eye, EyeOff, Lock, Database } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PrivacySettings {
  dataCollection: boolean
  analyticsTracking: boolean
  crashReporting: boolean
  autoLock: boolean
  shareUsageData: boolean
}

const defaultSettings: PrivacySettings = {
  dataCollection: true,
  analyticsTracking: false,
  crashReporting: true,
  autoLock: true,
  shareUsageData: false
}

export function PrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedSettings = localStorage.getItem('privacySettings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Failed to parse privacy settings:', error)
      }
    }
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    if (!mounted) return
    
    setIsLoading(true)
    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem('privacySettings', JSON.stringify(settings))
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast({
        title: "Settings saved",
        description: "Your privacy preferences have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save privacy settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async () => {
    try {
      // In a real app, this would call an API to generate and download user data
      const userData = {
        exportDate: new Date().toISOString(),
        settings: settings,
        message: "This is a sample data export. In a real application, this would contain all your family data."
      }
      
      const dataStr = JSON.stringify(userData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `family-hub-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your data.",
        variant: "destructive",
      })
    }
  }

  const deleteAllData = async () => {
    try {
      // Get all data first to know what to delete
      const [tasksRes, eventsRes, subscriptionsRes, familyMembersRes, transactionsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/events'),
        fetch('/api/subscriptions'),
        fetch('/api/family-members'),
        fetch('/api/transactions')
      ])

      const [tasks, events, subscriptions, familyMembers, transactions] = await Promise.all([
        tasksRes.ok ? tasksRes.json() : [],
        eventsRes.ok ? eventsRes.json() : [],
        subscriptionsRes.ok ? subscriptionsRes.json() : [],
        familyMembersRes.ok ? familyMembersRes.json() : [],
        transactionsRes.ok ? transactionsRes.json() : []
      ])

      // Delete all data in parallel
      const deletePromises: Promise<Response>[] = []
      
      // Delete tasks
      if (Array.isArray(tasks)) {
        tasks.forEach(task => {
          deletePromises.push(fetch(`/api/tasks?id=${task.id}`, { method: 'DELETE' }))
        })
      }
      
      // Delete events
      if (Array.isArray(events)) {
        events.forEach(event => {
          deletePromises.push(fetch(`/api/events?id=${event.id}`, { method: 'DELETE' }))
        })
      }
      
      // Delete subscriptions
      if (Array.isArray(subscriptions)) {
        subscriptions.forEach(subscription => {
          deletePromises.push(fetch(`/api/subscriptions?id=${subscription.id}`, { method: 'DELETE' }))
        })
      }
      
      // Delete family members
      if (Array.isArray(familyMembers)) {
        familyMembers.forEach(member => {
          deletePromises.push(fetch(`/api/family-members?id=${member.id}`, { method: 'DELETE' }))
        })
      }
      
      // Delete transactions
      if (Array.isArray(transactions)) {
        transactions.forEach(transaction => {
          deletePromises.push(fetch(`/api/transactions?id=${transaction.id}`, { method: 'DELETE' }))
        })
      }

      // Wait for all deletions to complete
      await Promise.all(deletePromises)
      
      // Clear localStorage as well
      localStorage.clear()
      
      toast({
        title: "Data deleted",
        description: "All your data has been permanently deleted from the database.",
      })
    } catch (error) {
      console.error('Delete all data error:', error)
      toast({
        title: "Deletion failed",
        description: "Failed to delete your data. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data Collection
          </CardTitle>
          <CardDescription>
            Control how your data is collected, used, and shared.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="h-4 w-4 text-blue-500" />
                <div>
                  <Label htmlFor="data-collection" className="text-sm font-medium">
                    Essential Data Collection
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allow collection of data necessary for app functionality
                  </p>
                </div>
              </div>
              <Switch
                id="data-collection"
                checked={settings.dataCollection}
                onCheckedChange={(checked) => handleSettingChange('dataCollection', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="h-4 w-4 text-green-500" />
                <div>
                  <Label htmlFor="analytics-tracking" className="text-sm font-medium">
                    Analytics Tracking
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Help improve the app by sharing anonymous usage data
                  </p>
                </div>
              </div>
              <Switch
                id="analytics-tracking"
                checked={settings.analyticsTracking}
                onCheckedChange={(checked) => handleSettingChange('analyticsTracking', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-orange-500" />
                <div>
                  <Label htmlFor="crash-reporting" className="text-sm font-medium">
                    Crash Reporting
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically send crash reports to help fix issues
                  </p>
                </div>
              </div>
              <Switch
                id="crash-reporting"
                checked={settings.crashReporting}
                onCheckedChange={(checked) => handleSettingChange('crashReporting', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="h-4 w-4 text-purple-500" />
                <div>
                  <Label htmlFor="share-usage-data" className="text-sm font-medium">
                    Share Usage Data
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Share anonymous usage statistics to help improve the app
                  </p>
                </div>
              </div>
              <Switch
                id="share-usage-data"
                checked={settings.shareUsageData}
                onCheckedChange={(checked) => handleSettingChange('shareUsageData', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure security and authentication options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-lock" className="text-sm font-medium">
                Auto-Lock
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically lock the app when inactive
              </p>
            </div>
            <Switch
              id="auto-lock"
              checked={settings.autoLock}
              onCheckedChange={(checked) => handleSettingChange('autoLock', checked)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={saveSettings} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export or delete your personal data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Export Your Data</h3>
              <p className="text-xs text-muted-foreground">
                Download a copy of all your family data
              </p>
            </div>
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-destructive">Delete All Data</h3>
              <p className="text-xs text-muted-foreground">
                Permanently delete all your family data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your
                    family data including events, tasks, transactions, and family member information.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}