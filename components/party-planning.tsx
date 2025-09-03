'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { PartyPopper, Calendar, DollarSign, Users, MapPin, Clock, Edit, Trash2, Plus } from 'lucide-react'
import { Party, NewParty } from '@/lib/db/schema'

interface PartyPlanningProps {
  parties: Party[]
  onPartiesChange: (parties: Party[]) => void
  showForm: boolean
  onShowFormChange: (show: boolean) => void
}

export default function PartyPlanning({ parties = [], onPartiesChange, showForm, onShowFormChange }: PartyPlanningProps) {
  // Ensure parties is always an array
  const safeParties = Array.isArray(parties) ? parties : []
  const [editingParty, setEditingParty] = useState<Party | null>(null)
  const [formData, setFormData] = useState<Partial<NewParty>>({
    title: '',
    type: 'birthday',
    date: '',
    time: '',
    location: '',
    budget: undefined,
    guestCount: 0,
    description: '',
    organizer: ''
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'birthday',
      date: '',
      time: '',
      location: '',
      budget: undefined,
      guestCount: 0,
      description: '',
      organizer: ''
    })
    setEditingParty(null)
    onShowFormChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = '/api/parties'
      const method = editingParty ? 'PUT' : 'POST'
      const payload = editingParty ? { ...formData, id: editingParty.id } : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to save party')
      }

      const savedParty = await response.json()

      if (editingParty) {
        onPartiesChange(parties.map(party => party.id === editingParty.id ? savedParty : party))
        toast({ title: 'Party updated successfully!' })
      } else {
        onPartiesChange([savedParty, ...parties])
        toast({ title: 'Party created successfully!' })
      }

      resetForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save party. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (party: Party) => {
    setFormData({
      title: party.title,
      type: party.type,
      date: party.date,
      time: party.time,
      location: party.location,
      budget: party.budget || undefined,
      guestCount: party.guestCount || 0,
      description: party.description || '',
      organizer: party.organizer
    })
    setEditingParty(party)
    onShowFormChange(true)
  }

  const handleDelete = async (partyId: string) => {
    if (!confirm('Are you sure you want to delete this party?')) return

    try {
      const response = await fetch(`/api/parties?id=${partyId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete party')
      }

      onPartiesChange(safeParties.filter(party => party.id !== partyId))
      toast({ title: 'Party deleted successfully!' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete party. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const updateStatus = async (partyId: string, status: string) => {
    try {
      const response = await fetch('/api/parties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: partyId, status })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const updatedParty = await response.json()
      onPartiesChange(parties.map(party => party.id === partyId ? updatedParty : party))
      toast({ title: 'Party status updated!' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'birthday': return '🎂'
      case 'anniversary': return '💕'
      case 'holiday': return '🎄'
      case 'celebration': return '🎉'
      case 'gathering': return '👥'
      default: return '🎊'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="space-y-6">
      <Dialog open={showForm} onOpenChange={onShowFormChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingParty ? 'Edit Party' : 'Plan New Party'}</DialogTitle>
            <DialogDescription>
              {editingParty ? 'Update your party details' : 'Create a new family party plan'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Party Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Sarah's 10th Birthday"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Party Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="celebration">Celebration</SelectItem>
                    <SelectItem value="gathering">Gathering</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Our backyard / Community Center"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guestCount">Expected Guests</Label>
                <Input
                  id="guestCount"
                  type="number"
                  value={formData.guestCount || ''}
                  onChange={(e) => setFormData({ ...formData, guestCount: e.target.value ? parseInt(e.target.value) : 0 })}
                  placeholder="20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organizer">Organizer</Label>
                <Input
                  id="organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  placeholder="Mom"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A fun birthday party with games, cake, and friends..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingParty ? 'Update Party' : 'Create Party'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeParties.map((party) => (
          <Card key={party.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-xl">{getTypeIcon(party.type)}</span>
                    {party.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {party.location}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(party)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(party.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(party.status)}>
                  {party.status}
                </Badge>
                <Select value={party.status} onValueChange={(value) => updateStatus(party.id, value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{formatDate(party.date)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{formatTime(party.time)}</span>
                </div>
                
                {party.budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span>${party.budget.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span>{party.guestCount || 0} guests expected</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <PartyPopper className="h-3 w-3 text-muted-foreground" />
                  <span>Organized by {party.organizer}</span>
                </div>
              </div>

              {party.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {party.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {safeParties.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <PartyPopper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No parties planned yet</h3>
            <p className="text-muted-foreground mb-4">
              Start planning your next family celebration!
            </p>
            <Button onClick={() => onShowFormChange(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Plan Your First Party
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}