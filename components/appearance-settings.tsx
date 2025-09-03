'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Palette, Sun, Moon, Monitor, Paintbrush } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from '@/contexts/ThemeContext'

interface AppearanceSettings {
  theme: 'default' | 'glassmorphism'
  accentColor: string
  fontSize: 'small' | 'medium' | 'large'
  compactMode: boolean
}

const defaultSettings: AppearanceSettings = {
  theme: 'default',
  accentColor: 'blue',
  fontSize: 'medium',
  compactMode: false
}

const accentColors = [
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
]

export function AppearanceSettings() {
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('appearanceSettings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
    }
  }, [])

  const handleThemeChange = (newTheme: 'default' | 'glassmorphism') => {
    setSettings(prev => ({ ...prev, theme: newTheme }))
    setTheme(newTheme)
  }

  const handleSettingChange = (key: keyof AppearanceSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    if (!mounted) return
    
    setIsLoading(true)
    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem('appearanceSettings', JSON.stringify(settings))
      
      // Apply CSS custom properties for accent color
      document.documentElement.style.setProperty('--accent-color', `var(--${settings.accentColor}-500)`)
      document.documentElement.style.setProperty('--font-size-base', 
        settings.fontSize === 'small' ? '14px' : 
        settings.fontSize === 'large' ? '18px' : '16px'
      )
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast({
        title: "Settings saved",
        description: "Your appearance preferences have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save appearance settings.",
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
            <Palette className="h-5 w-5" />
            Theme Settings
          </CardTitle>
          <CardDescription>
            Customize the appearance and theme of your Family Hub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Theme Mode</Label>
              <RadioGroup
                value={settings.theme}
                onValueChange={(value) => handleThemeChange(value as 'default' | 'glassmorphism')}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="default" />
                  <Label htmlFor="default" className="flex items-center gap-2 cursor-pointer">
                    <Sun className="h-4 w-4" />
                    Light
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="glassmorphism" id="glassmorphism" />
                  <Label htmlFor="glassmorphism" className="flex items-center gap-2 cursor-pointer">
                    <Monitor className="h-4 w-4" />
                    Glassmorphism
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Accent Color</Label>
              <div className="grid grid-cols-3 gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleSettingChange('accentColor', color.value)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      settings.accentColor === color.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${color.class}`} />
                    <span className="text-sm">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="font-size" className="text-sm font-medium mb-3 block">
                Font Size
              </Label>
              <Select
                value={settings.fontSize}
                onValueChange={(value) => handleSettingChange('fontSize', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium (Default)</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-mode" className="text-sm font-medium">Compact Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Reduce spacing and padding for a more compact interface
                </p>
              </div>
              <Switch
                id="compact-mode"
                checked={settings.compactMode}
                onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Paintbrush className="h-4 w-4" />
              Preview
            </h3>
            <div className="p-4 border rounded-lg bg-card">
              <div className="space-y-2">
                <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
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