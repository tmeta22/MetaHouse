"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, User, Edit, Trash2 } from "lucide-react"
import { useData, type Event, type Task } from "@/contexts/DataContext"

export default function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week">("month")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Use shared data context
  const { events, addEvent, updateEvent, deleteEvent, tasks, updateTask } = useData()

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    date: "",
    time: "",
    member: "",
    category: "personal",
    description: "",
  })

  const categoryColors = {
    work: "bg-blue-500",
    personal: "bg-green-500",
    family: "bg-purple-500",
    health: "bg-red-500",
    social: "bg-yellow-500",
  }

  const categoryBadgeColors = {
    work: "default",
    personal: "secondary",
    family: "outline",
    health: "destructive",
    social: "secondary",
  } as const

  // Get days in current month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  // Interface for calendar items (events and tasks)
  interface CalendarItem {
    id: string
    title: string
    time?: string
    member?: string
    category?: string
    type: 'event' | 'task'
    priority?: 'high' | 'medium' | 'low'
    completed?: boolean
    assignee?: string
    date?: string
    description?: string
    dueDate?: string
    createdAt?: string
    updatedAt?: string
  }

  // Get events and tasks for a specific date
  const getItemsForDate = (date: string): CalendarItem[] => {
    const dateEvents: CalendarItem[] = events
      .filter((event) => event.date === date)
      .map((event) => ({
        ...event,
        type: 'event' as const
      }))
    
    const dateTasks: CalendarItem[] = tasks
      .filter((task) => task.dueDate === date)
      .map((task) => ({
        id: task.id,
        title: task.title,
        time: '23:59', // Default time for tasks
        member: task.assignee,
        category: 'task',
        type: 'task' as const,
        priority: task.priority,
        completed: task.completed,
        assignee: task.assignee
      }))
    
    return [...dateEvents, ...dateTasks]
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // Handle event creation/editing
  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.member) return

    if (editingEvent) {
      // Update existing event
      updateEvent(editingEvent.id, {
        title: newEvent.title!,
        date: newEvent.date!,
        time: newEvent.time!,
        member: newEvent.member!,
        category: newEvent.category as Event["category"],
        description: newEvent.description,
      })
    } else {
      // Create new event
      addEvent({
        title: newEvent.title!,
        date: newEvent.date!,
        time: newEvent.time!,
        member: newEvent.member!,
        category: newEvent.category as Event["category"],
        description: newEvent.description,
      })
    }

    // Reset form
    setNewEvent({
      title: "",
      date: "",
      time: "",
      member: "",
      category: "personal",
      description: "",
    })
    setEditingEvent(null)
    setIsEventDialogOpen(false)
  }

  // Handle event deletion
  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId)
  }

  // Handle event editing
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setNewEvent(event)
    setIsEventDialogOpen(true)
  }

  // Handle task completion toggle
  const handleToggleTask = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed: !completed })
  }

  const days = getDaysInMonth()
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-3 sm:space-y-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center sm:text-left">{formatDate(currentDate)}</h2>
          <div className="flex items-center justify-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="flex-shrink-0">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Prev</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="flex-shrink-0">
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <div className="flex rounded-md border mx-auto sm:mx-0">
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
              className="rounded-r-none flex-1 sm:flex-none px-3 sm:px-4"
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("week")}
              className="rounded-l-none flex-1 sm:flex-none px-3 sm:px-4"
            >
              Week
            </Button>
          </div>

          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Add Event</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="member">Family Member</Label>
                    <Select
                      value={newEvent.member || ""}
                      onValueChange={(value) => setNewEvent({ ...newEvent, member: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sarah">Sarah</SelectItem>
                        <SelectItem value="Alex">Alex</SelectItem>
                        <SelectItem value="Family">Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newEvent.category || "personal"}
                      onValueChange={(value) => setNewEvent({ ...newEvent, category: value as Event["category"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Add event description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEventDialogOpen(false)
                      setEditingEvent(null)
                      setNewEvent({
                        title: "",
                        date: "",
                        time: "",
                        member: "",
                        category: "personal",
                        description: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEvent}>{editingEvent ? "Update Event" : "Create Event"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Calendar Header Days */}
          <div className="grid grid-cols-7 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
              <div key={day} className="p-2 sm:p-4 text-center font-medium text-muted-foreground border-r last:border-r-0">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dateStr = day
                ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : ""
              const dayItems = day ? getItemsForDate(dateStr) : []
              const isToday = dateStr === today

              return (
                <div
                  key={index}
                  className={`min-h-[60px] sm:min-h-[80px] md:min-h-[120px] p-1 sm:p-2 border-r border-b last:border-r-0 ${
                    day ? "bg-background hover:bg-muted/50" : "bg-muted/20"
                  } ${isToday ? "bg-primary/5 border-primary/20" : ""}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${isToday ? "text-primary" : ""}`}>{day}</div>
                      <div className="space-y-1">
                        {dayItems.slice(0, 3).map((item, itemIndex) => (
                          <div key={item.id} className={`group relative ${itemIndex >= 2 ? 'hidden sm:block' : ''}`}>
                            <div
                              className={`text-xs p-1 rounded cursor-pointer truncate ${
                                item.type === 'task'
                                  ? item.completed
                                    ? 'bg-green-600 text-white'
                                    : item.priority === 'high'
                                    ? 'bg-red-500 text-white'
                                    : item.priority === 'medium'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-blue-500 text-white'
                                  : `${categoryColors[item.category as keyof typeof categoryColors] || 'bg-gray-500'} text-white`
                              }`}
                              onClick={() => {
                                if (item.type === 'event') {
                                  handleEditEvent(item as Event)
                                } else if (item.type === 'task') {
                                  handleToggleTask(item.id, item.completed || false)
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate text-[10px] sm:text-xs">
                                  {item.type === 'task' ? (
                                    <>
                                      <span className="hidden sm:inline">📋 </span>
                                      {item.completed && <span className="line-through">✓ </span>}
                                      {item.title}
                                    </>
                                  ) : (
                                    <>
                                      <span className="hidden sm:inline">{item.time} </span>{item.title}
                                    </>
                                  )}
                                </span>
                                {item.type === 'event' && (
                                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                                    <Edit className="h-2 w-2 sm:h-3 sm:w-3" />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteEvent(item.id)
                                      }}
                                    >
                                      <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {dayItems.length > 2 && (
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            <span className="sm:hidden">+{dayItems.length - 2} more</span>
                            <span className="hidden sm:inline">+{dayItems.length > 3 ? dayItems.length - 3 : 0} more</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Events Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Today's Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.filter(event => event.date === today).length > 0 ? (
              events.filter(event => event.date === today).map((event) => (
                <div key={event.id} className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 sm:p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${categoryColors[event.category as keyof typeof categoryColors] || 'bg-gray-500'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <h4 className="font-semibold truncate">{event.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="truncate">{event.member}</span>
                      </div>
                      {event.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2">
                    <Badge variant={categoryBadgeColors[event.category]} className="text-xs">{event.category}</Badge>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditEvent(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events scheduled for today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
