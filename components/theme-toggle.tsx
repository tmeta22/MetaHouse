"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sun, Moon, Sparkles, Palette } from 'lucide-react'
import { useTheme, ThemeMode } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'default', icon: <Sun className="h-4 w-4" />, label: 'Light' },
    { mode: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
    { mode: 'glassmorphism', icon: <Sparkles className="h-4 w-4" />, label: 'Glassmorphism' }
  ]

  const currentTheme = themes.find(t => t.mode === theme) || themes[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full p-0 hover:bg-muted transition-colors"
          title="Switch theme"
        >
          {currentTheme.icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map(({ mode, icon, label }) => (
          <DropdownMenuItem
            key={mode}
            onClick={() => setTheme(mode)}
            className={cn(
              'flex items-center gap-2 cursor-pointer',
              theme === mode && 'bg-accent text-accent-foreground'
            )}
          >
            {icon}
            <span>{label}</span>
            {theme === mode && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}