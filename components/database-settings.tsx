'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Database, Cloud, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DatabaseConfig {
  type: 'sqlite' | 'neon' | 'postgresql'
  url: string
  name: string
}

export function DatabaseSettings() {
  const { toast } = useToast()
  const [currentDb, setCurrentDb] = useState('Local SQLite')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')
  const [isConnecting, setIsConnecting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [config, setConfig] = useState<DatabaseConfig>({
    type: 'sqlite',
    url: '',
    name: 'Local SQLite'
  })
  const [isFormatting, setIsFormatting] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load current database configuration
    loadCurrentConfig()
  }, [])

  const loadCurrentConfig = async () => {
    try {
      const response = await fetch('/api/database/config')
      if (response.ok) {
        const data = await response.json()
        setCurrentDb(data.name || 'Local SQLite')
        setConnectionStatus(data.connected ? 'connected' : 'disconnected')
      }
    } catch (error) {
      console.error('Failed to load database config:', error)
    }
  }

  const testConnection = async () => {
    if (!config.url && config.type !== 'sqlite') {
      toast({
        title: 'Connection URL Required',
        description: 'Please enter a valid database connection URL.',
        variant: 'destructive'
      })
      return
    }

    setIsConnecting(true)
    try {
      const response = await fetch('/api/database/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setConnectionStatus('connected')
        toast({
          title: 'Connection Successful',
          description: `Successfully connected to ${config.name || config.type} database.`
        })
      } else {
        setConnectionStatus('error')
        toast({
          title: 'Connection Failed',
          description: result.error || 'Failed to connect to database.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      setConnectionStatus('error')
      toast({
        title: 'Connection Error',
        description: 'An error occurred while testing the connection.',
        variant: 'destructive'
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const saveConnection = async () => {
    if (!mounted) return
    
    if (connectionStatus !== 'connected') {
      toast({
        title: 'Test Connection First',
        description: 'Please test the connection before saving.',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/database/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        setCurrentDb(config.name || config.type)
        toast({
          title: 'Database Updated',
          description: 'Database connection has been saved successfully. Please refresh the page to use the new database.'
        })
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save database configuration.',
        variant: 'destructive'
      })
    }
  }

  const formatDatabase = async () => {
    if (!mounted) return
    
    const confirmed = window.confirm(
      'Are you sure you want to format the database? This will permanently delete ALL data including tasks, schedules, family members, transactions, and settings. This action cannot be undone.'
    )
    
    if (!confirmed) return
    
    const doubleConfirmed = window.confirm(
      'This is your final warning! All data will be permanently lost. Are you absolutely sure you want to proceed?'
    )
    
    if (!doubleConfirmed) return

    setIsFormatting(true)
    try {
      const response = await fetch('/api/database/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        toast({
          title: 'Database Formatted',
          description: 'All data has been successfully deleted. The database has been reset to its initial state.'
        })
        // Reload the page to reflect the changes
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast({
          title: 'Format Failed',
          description: result.error || 'Failed to format database.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Format Error',
        description: 'An error occurred while formatting the database.',
        variant: 'destructive'
      })
    } finally {
      setIsFormatting(false)
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Database className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Not Connected</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection
          </CardTitle>
          <CardDescription>
            Configure your database connection. Currently using: <strong>{currentDb}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="db-type">Database Type</Label>
              <Select
                value={config.type}
                onValueChange={(value: 'sqlite' | 'neon' | 'postgresql') => 
                  setConfig({ ...config, type: value, url: value === 'sqlite' ? '' : config.url })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqlite">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Local SQLite
                    </div>
                  </SelectItem>
                  <SelectItem value="neon">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      Neon Database
                    </div>
                  </SelectItem>
                  <SelectItem value="postgresql">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      PostgreSQL
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="db-name">Connection Name</Label>
              <Input
                id="db-name"
                placeholder="My Database"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
              />
            </div>
          </div>

          {config.type !== 'sqlite' && (
            <div className="space-y-2">
              <Label htmlFor="db-url">Connection URL</Label>
              <Input
                id="db-url"
                type="password"
                placeholder={config.type === 'neon' 
                  ? 'postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require'
                  : 'postgresql://username:password@host:port/database'
                }
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
              />
            </div>
          )}

          {config.type === 'neon' && (
            <Alert>
              <Cloud className="h-4 w-4" />
              <AlertDescription>
                Get your Neon connection string from your{' '}
                <a 
                  href="https://console.neon.tech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600"
                >
                  Neon Console
                </a>
                {' '}dashboard under "Connection Details".
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              {getStatusBadge()}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              
              <Button
                onClick={saveConnection}
                disabled={connectionStatus !== 'connected'}
              >
                Save & Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 font-semibold">
            <Trash2 className="h-5 w-5" />
            Format Database
          </CardTitle>
          <CardDescription>
            Permanently delete all data from the database. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-300 bg-red-100">
            <AlertCircle className="h-4 w-4 text-red-700" />
            <AlertDescription className="text-red-900 font-medium">
              <strong>Warning:</strong> This will permanently delete all your data including:
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>All family members and their information</li>
                <li>All tasks and schedules</li>
                <li>All financial transactions and subscriptions</li>
                <li>All settings and preferences</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={formatDatabase}
              disabled={isFormatting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-red-600 hover:border-red-700"
            >
              {isFormatting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Formatting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Format Database
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}