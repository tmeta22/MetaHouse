'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, MapPin, Calendar, Users, DollarSign, Clock, PartyPopper } from 'lucide-react'
import { Trip, Party } from '@/lib/db/schema'
import { useData } from '@/contexts/DataContext'
import { syncPlanningWithCalendar, tripToCalendarEvents, partyToCalendarEvent } from '@/lib/calendar-sync'
import TripPlanning from '@/components/trip-planning'
import PartyPlanning from '@/components/party-planning'

export default function FamilyPlanningPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [parties, setParties] = useState<Party[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [showTripForm, setShowTripForm] = useState(false)
  const [showPartyForm, setShowPartyForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { addEvent } = useData()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tripsResponse, partiesResponse] = await Promise.all([
        fetch('/api/trips'),
        fetch('/api/parties')
      ])
      
      const tripsData = await tripsResponse.json()
      const partiesData = await partiesResponse.json()
      
      // Ensure we have arrays, fallback to empty arrays if API returns error objects
      setTrips(Array.isArray(tripsData) ? tripsData : [])
      setParties(Array.isArray(partiesData) ? partiesData : [])
    } catch (error) {
      console.error('Error fetching planning data:', error)
      setTrips([])
      setParties([])
    } finally {
      setLoading(false)
    }
  }

  // Enhanced trip handler with calendar integration
  const handleTripsChange = async (newTrips: Trip[]) => {
    const addedTrips = newTrips.filter(trip => !trips.find(t => t.id === trip.id))
    
    // Sync new trips with calendar
    for (const trip of addedTrips) {
      try {
        const calendarEvents = tripToCalendarEvents(trip)
        for (const event of calendarEvents) {
          await addEvent(event)
        }
      } catch (error) {
        console.error('Failed to sync trip with calendar:', error)
      }
    }
    
    setTrips(newTrips)
  }

  // Enhanced party handler with calendar integration
  const handlePartiesChange = async (newParties: Party[]) => {
    const addedParties = newParties.filter(party => !parties.find(p => p.id === party.id))
    
    // Sync new parties with calendar
    for (const party of addedParties) {
      try {
        const calendarEvent = partyToCalendarEvent(party)
        await addEvent(calendarEvent)
      } catch (error) {
        console.error('Failed to sync party with calendar:', error)
      }
    }
    
    setParties(newParties)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading family planning...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Family Planning</h1>
          <p className="text-muted-foreground mt-2">
            Plan and organize family trips, parties, and special events
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="parties">Parties</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trips.length}</div>
                <p className="text-xs text-muted-foreground">
                  {trips.filter(t => t.status === 'planning').length} in planning
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Parties</CardTitle>
                <PartyPopper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{parties.length}</div>
                <p className="text-xs text-muted-foreground">
                  {parties.filter(p => p.status === 'planning').length} in planning
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {[...trips, ...parties].filter(event => {
                    const eventDate = new Date('startDate' in event ? event.startDate : event.date)
                    return eventDate > new Date() && (event.status === 'planning' || event.status === 'confirmed')
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${[...trips, ...parties]
                    .filter(event => event.budget)
                    .reduce((sum, event) => sum + (event.budget || 0), 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Planned expenses</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Trips</CardTitle>
                <CardDescription>Latest family trip plans</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trips.slice(0, 3).map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{trip.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {trip.destination}
                        <Calendar className="h-3 w-3 ml-2" />
                        {formatDate(trip.startDate)}
                      </div>
                    </div>
                    <Badge className={getStatusColor(trip.status)}>
                      {trip.status}
                    </Badge>
                  </div>
                ))}
                {trips.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No trips planned yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Parties</CardTitle>
                <CardDescription>Latest party plans</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {parties.slice(0, 3).map((party) => (
                  <div key={party.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{party.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <PartyPopper className="h-3 w-3" />
                        {party.type}
                        <Calendar className="h-3 w-3 ml-2" />
                        {formatDate(party.date)}
                      </div>
                    </div>
                    <Badge className={getStatusColor(party.status)}>
                      {party.status}
                    </Badge>
                  </div>
                ))}
                {parties.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No parties planned yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trips">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Family Trips</h2>
            <Button onClick={() => setShowTripForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Plan New Trip
            </Button>
          </div>
          <TripPlanning 
            trips={trips} 
            onTripsChange={handleTripsChange}
            showForm={showTripForm}
            onShowFormChange={setShowTripForm}
          />
        </TabsContent>

        <TabsContent value="parties">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Family Parties</h2>
            <Button onClick={() => setShowPartyForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Plan New Party
            </Button>
          </div>
          <PartyPlanning 
            parties={parties} 
            onPartiesChange={handlePartiesChange}
            showForm={showPartyForm}
            onShowFormChange={setShowPartyForm}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}