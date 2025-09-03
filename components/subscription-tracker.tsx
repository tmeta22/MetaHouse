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
import { CreditCard, Plus, Edit, Trash2, Calendar, DollarSign, TrendingUp, AlertCircle } from "lucide-react"
import { useData, type Subscription } from "@/contexts/DataContext"

export default function SubscriptionTracker() {
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  // Use shared data context
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription } = useData()

  const [newSubscription, setNewSubscription] = useState<Partial<Subscription>>({
    name: "",
    cost: 0,
    billingCycle: "monthly",
    category: "entertainment",
    status: "active",
    nextPayment: "",
    description: "",
    website: "",
  })

  const categoryColors = {
    entertainment: "bg-purple-500",
    productivity: "bg-blue-500",
    health: "bg-green-500",
    education: "bg-yellow-500",
    other: "bg-gray-500",
  }

  const statusColors = {
    active: "default",
    due: "secondary",
    cancelled: "outline",
    paused: "secondary",
  } as const

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const categoryMatch = filterCategory === "all" || sub.category === filterCategory
    const statusMatch = filterStatus === "all" || sub.status === filterStatus
    return categoryMatch && statusMatch
  })

  // Calculate statistics
  const totalMonthly = subscriptions
    .filter((sub) => sub.status !== "cancelled")
    .reduce((sum, sub) => {
      return sum + (sub.billingCycle === "monthly" ? sub.cost : sub.cost / 12)
    }, 0)

  const totalYearly = totalMonthly * 12

  const upcomingPayments = subscriptions.filter((sub) => sub.status === "due").length

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active").length

  // Handle subscription creation/editing
  const handleSaveSubscription = () => {
    if (!newSubscription.name || !newSubscription.cost || !newSubscription.nextPayment) return

    if (editingSubscription) {
      // Update existing subscription
      updateSubscription(editingSubscription.id, {
        name: newSubscription.name!,
        cost: newSubscription.cost!,
        billingCycle: newSubscription.billingCycle as Subscription["billingCycle"],
        category: newSubscription.category as Subscription["category"],
        status: newSubscription.status as Subscription["status"],
        nextPayment: newSubscription.nextPayment!,
        description: newSubscription.description,
        website: newSubscription.website,
      })
    } else {
      // Create new subscription
      addSubscription({
        name: newSubscription.name!,
        cost: newSubscription.cost!,
        billingCycle: newSubscription.billingCycle as Subscription["billingCycle"],
        category: newSubscription.category as Subscription["category"],
        status: newSubscription.status as Subscription["status"],
        nextPayment: newSubscription.nextPayment!,
        description: newSubscription.description,
        website: newSubscription.website,
      })
    }

    // Reset form
    setNewSubscription({
      name: "",
      cost: 0,
      billingCycle: "monthly",
      category: "entertainment",
      status: "active",
      nextPayment: "",
      description: "",
      website: "",
    })
    setEditingSubscription(null)
    setIsSubscriptionDialogOpen(false)
  }

  // Handle subscription deletion
  const handleDeleteSubscription = (subscriptionId: string) => {
    deleteSubscription(subscriptionId)
  }

  // Handle subscription editing
  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setNewSubscription(subscription)
    setIsSubscriptionDialogOpen(true)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Check if payment is due soon
  const isDueSoon = (nextPayment: string) => {
    const paymentDate = new Date(nextPayment)
    const today = new Date()
    const diffTime = paymentDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Tracker</h2>
          <p className="text-muted-foreground">Manage your family's subscriptions and expenses</p>
        </div>

        <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSubscription ? "Edit Subscription" : "Add New Subscription"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={newSubscription.name || ""}
                  onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                  placeholder="e.g., Netflix, Spotify"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={newSubscription.cost || ""}
                    onChange={(e) =>
                      setNewSubscription({ ...newSubscription, cost: Number.parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select
                    value={newSubscription.billingCycle || "monthly"}
                    onValueChange={(value) =>
                      setNewSubscription({ ...newSubscription, billingCycle: value as Subscription["billingCycle"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newSubscription.category || "entertainment"}
                    onValueChange={(value) =>
                      setNewSubscription({ ...newSubscription, category: value as Subscription["category"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newSubscription.status || "active"}
                    onValueChange={(value) =>
                      setNewSubscription({ ...newSubscription, status: value as Subscription["status"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="due">Due</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="nextPayment">Next Payment Date</Label>
                <Input
                  id="nextPayment"
                  type="date"
                  value={newSubscription.nextPayment || ""}
                  onChange={(e) => setNewSubscription({ ...newSubscription, nextPayment: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  value={newSubscription.website || ""}
                  onChange={(e) => setNewSubscription({ ...newSubscription, website: e.target.value })}
                  placeholder="e.g., netflix.com"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newSubscription.description || ""}
                  onChange={(e) => setNewSubscription({ ...newSubscription, description: e.target.value })}
                  placeholder="Add notes about this subscription"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSubscriptionDialogOpen(false)
                    setEditingSubscription(null)
                    setNewSubscription({
                      name: "",
                      cost: 0,
                      billingCycle: "monthly",
                      category: "entertainment",
                      status: "active",
                      nextPayment: "",
                      description: "",
                      website: "",
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveSubscription}>
                  {editingSubscription ? "Update Subscription" : "Add Subscription"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMonthly.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">${totalYearly.toFixed(2)} yearly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">{subscriptions.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingPayments}</div>
            <p className="text-xs text-muted-foreground">Due payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${activeSubscriptions > 0 ? (totalMonthly / activeSubscriptions).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Per subscription</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="categoryFilter">Category:</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="productivity">Productivity</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="statusFilter">Status:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="due">Due</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubscriptions.map((subscription) => (
          <Card key={subscription.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${categoryColors[subscription.category as keyof typeof categoryColors] || 'bg-gray-500'}`} />
                  <CardTitle className="text-lg">{subscription.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditSubscription(subscription)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSubscription(subscription.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    ${subscription.cost}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{subscription.billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </span>
                  <Badge variant={statusColors[subscription.status as keyof typeof statusColors] || "default"}>{subscription.status}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next Payment:</span>
                    <div className="flex items-center space-x-1">
                      {isDueSoon(subscription.nextPayment) && <AlertCircle className="h-3 w-3 text-orange-500" />}
                      <span className={isDueSoon(subscription.nextPayment) ? "text-orange-500 font-medium" : ""}>
                        {formatDate(subscription.nextPayment)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline" className="capitalize">
                      {subscription.category}
                    </Badge>
                  </div>

                  {subscription.website && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Website:</span>
                      <a
                        href={`https://${subscription.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {subscription.website}
                      </a>
                    </div>
                  )}

                  {subscription.description && (
                    <p className="text-sm text-muted-foreground mt-2">{subscription.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubscriptions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subscriptions found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {filterCategory !== "all" || filterStatus !== "all"
                ? "Try adjusting your filters or add a new subscription."
                : "Get started by adding your first subscription."}
            </p>
            <Button onClick={() => setIsSubscriptionDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subscription
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
