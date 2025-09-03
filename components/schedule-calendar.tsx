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
import { useData, type Event } from "@/contexts/DataContext"

export default function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week">("month")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Use shared data context
  const { events, addEvent, updateEvent, deleteEvent } = useData()

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

  // Get events for a specific date
  const getEventsForDate = (date: string) => {
    return events.filter((event) => event.date === date)
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

  const days = getDaysInMonth()
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">{formatDate(currentDate)}</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex rounded-md border">
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
              className="rounded-r-none"
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("week")}
              className="rounded-l-none"
            >
              Week
            </Button>
          </div>

          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
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
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-4 text-center font-medium text-muted-foreground border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dateStr = day
                ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : ""
              const dayEvents = day ? getEventsForDate(dateStr) : []
              const isToday = dateStr === today

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                    day ? "bg-background hover:bg-muted/50" : "bg-muted/20"
                  } ${isToday ? "bg-primary/5 border-primary/20" : ""}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${isToday ? "text-primary" : ""}`}>{day}</div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className="group relative">
                            <div
                              className={`text-xs p-1 rounded cursor-pointer ${categoryColors[event.category as keyof typeof categoryColors] || 'bg-gray-500'} text-white truncate`}
                              onClick={() => handleEditEvent(event)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">
                                  {event.time} {event.title}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                                  <Edit className="h-3 w-3" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteEvent(event.id)
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</div>
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
            {getEventsForDate(today).length > 0 ? (
              getEventsForDate(today).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${categoryColors[event.category as keyof typeof categoryColors] || 'bg-gray-500'}`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{event.member}</span>
                      </div>
                      {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={categoryBadgeColors[event.category]}>{event.category}</Badge>
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
