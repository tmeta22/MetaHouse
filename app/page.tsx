"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, CreditCard, Users, CheckSquare, Bell, Home, Clock, User, DollarSign, BarChart3, FileText, TrendingUp, Activity, Target, Download, Mail, Settings, MapPin, Database, Palette, Shield, Menu } from "lucide-react"
import ScheduleCalendar from "@/components/schedule-calendar"
import SubscriptionTracker from "@/components/subscription-tracker"
import TransactionTracker from "@/components/transaction-tracker"
import PlanningPage from "@/app/planning/page"
import NotificationCenter from "@/components/NotificationCenter"
import TestPushNotificationButton from "@/components/TestPushNotificationButton"
import { ThemeToggle } from "@/components/theme-toggle"
import { DatabaseSettings } from "@/components/database-settings"
import { NotificationSettings } from "@/components/notification-settings"
import { AppearanceSettings } from "@/components/appearance-settings"
import { PrivacySettings } from "@/components/privacy-settings"
import { useNotifications, createScheduleReminder, createSubscriptionAlert, createTaskReminder, createFamilyUpdate } from "@/contexts/NotificationContext"
import { useData } from "@/contexts/DataContext"

export default function FamilyHubDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [showTrackSubscriptionModal, setShowTrackSubscriptionModal] = useState(false)
  const [showManageFamilyModal, setShowManageFamilyModal] = useState(false)
  const [showEditMemberModal, setShowEditMemberModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Form state hooks - moved to top to fix hooks ordering
  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "",
    dueDate: "",
    priority: "medium"
  })
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    member: "",
    category: "personal",
    description: ""
  })
  const [newSubscription, setNewSubscription] = useState({
    name: "",
    cost: 0,
    billingCycle: "monthly",
    category: "entertainment",
    status: "active",
    nextPayment: "",
    website: "",
    description: ""
  })
  const [newMember, setNewMember] = useState({ name: "", role: "", email: "" })
  const [editingMember, setEditingMember] = useState({ index: -1, name: "", role: "", email: "" })
  const [deletingMemberIndex, setDeletingMemberIndex] = useState(-1)
  
  // Use shared data context
  const { 
    isLoading,
    tasks, addTask, updateTask, deleteTask,
    events, addEvent, updateEvent, deleteEvent,
    subscriptions, addSubscription, updateSubscription, deleteSubscription,
    familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember,
    transactions, addTransaction, updateTransaction, deleteTransaction,
    refreshData
  } = useData()
  
  const { addNotification } = useNotifications()

  // Add sample notifications on component mount
  React.useEffect(() => {
    // Add some sample notifications to demonstrate functionality
    addNotification(createScheduleReminder("Team Meeting", new Date(Date.now() + 30 * 60 * 1000))) // 30 minutes from now
    addNotification(createSubscriptionAlert("Netflix", 15.99, new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))) // 3 days from now
    addNotification(createTaskReminder("Buy groceries", "Family", new Date(Date.now() + 2 * 60 * 60 * 1000))) // 2 hours from now
    addNotification(createFamilyUpdate("John", "completed their homework"))
  }, [])

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading Family Hub...</p>
        </div>
      </div>
    )
  }

  // Chart data for analytics
  const monthlyExpenseData = [
    { month: 'Jan', expenses: 2100, income: 3500, subscriptions: 450 },
    { month: 'Feb', expenses: 2300, income: 3500, subscriptions: 470 },
    { month: 'Mar', expenses: 2450, income: 3600, subscriptions: 480 },
    { month: 'Apr', expenses: 2200, income: 3550, subscriptions: 460 },
    { month: 'May', expenses: 2600, income: 3700, subscriptions: 490 },
    { month: 'Jun', expenses: 2450, income: 3650, subscriptions: 485 }
  ]

  const taskCompletionData = [
    { week: 'Week 1', completed: 12, pending: 8, total: 20 },
    { week: 'Week 2', completed: 15, pending: 5, total: 20 },
    { week: 'Week 3', completed: 18, pending: 7, total: 25 },
    { week: 'Week 4', completed: 22, pending: 3, total: 25 }
  ]

  const categoryExpenseData = [
    { name: 'Groceries', value: 850, color: '#8884d8' },
    { name: 'Utilities', value: 420, color: '#82ca9d' },
    { name: 'Entertainment', value: 320, color: '#ffc658' },
    { name: 'Transportation', value: 280, color: '#ff7300' },
    { name: 'Healthcare', value: 180, color: '#00ff88' },
    { name: 'Others', value: 400, color: '#ff8042' }
  ]

  const memberActivityData = familyMembers.map(member => ({
    name: member.name.split(' ')[0],
    tasks: member.tasks || 0,
    events: member.upcoming || 0,
    completion: Math.floor(Math.random() * 30) + 70
  }))

  // Report generation functions
  const generatePDFReport = () => {
    const reportData = {
      generatedAt: new Date().toLocaleString(),
      summary: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        totalEvents: events.length,
        totalTransactions: transactions.length,
        totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
        totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
        subscriptionCosts: subscriptions.reduce((sum, sub) => sum + parseFloat(sub.cost.toString()), 0),
        familyMembers: familyMembers.length
      }
    }
    
    // Create a simple HTML report
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Family Hub Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Family Hub Report</h1>
          <p>Generated on: ${reportData.generatedAt}</p>
        </div>
        
        <div class="section">
          <h2>Summary</h2>
          <div class="metric"><strong>Family Members:</strong> ${reportData.summary.familyMembers}</div>
          <div class="metric"><strong>Total Tasks:</strong> ${reportData.summary.totalTasks}</div>
          <div class="metric"><strong>Completed Tasks:</strong> ${reportData.summary.completedTasks}</div>
          <div class="metric"><strong>Total Events:</strong> ${reportData.summary.totalEvents}</div>
          <div class="metric"><strong>Total Income:</strong> $${reportData.summary.totalIncome.toFixed(2)}</div>
           <div class="metric"><strong>Total Expenses:</strong> $${reportData.summary.totalExpenses.toFixed(2)}</div>
           <div class="metric"><strong>Subscription Costs:</strong> $${reportData.summary.subscriptionCosts.toFixed(2)}</div>
        </div>
        
        <div class="section">
          <h2>Recent Transactions</h2>
          <table>
            <tr><th>Date</th><th>Description</th><th>Type</th><th>Amount</th><th>Category</th></tr>
            ${transactions.slice(0, 10).map(t => `
              <tr>
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td>${t.type}</td>
                <td>$${parseFloat(t.amount.toString()).toFixed(2)}</td>
                <td>${t.category}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      </body>
      </html>
    `
    
    // Create and download the PDF (using browser's print functionality)
     const printWindow = window.open('', '_blank')
     if (printWindow) {
       printWindow.document.write(htmlContent)
       printWindow.document.close()
       printWindow.print()
     }
    
    addNotification({
      type: 'system',
      title: 'Report Generated',
      message: 'PDF report generated successfully!',
      priority: 'medium'
    })
  }

  const generateCSVReport = () => {
    const csvData = [
      ['Family Hub Report - Generated on', new Date().toLocaleString()],
      [''],
      ['Summary'],
      ['Metric', 'Value'],
      ['Family Members', familyMembers.length],
      ['Total Tasks', tasks.length],
      ['Completed Tasks', tasks.filter(t => t.completed).length],
      ['Total Events', events.length],
      ['Total Income', `$${transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0).toFixed(2)}`],
       ['Total Expenses', `$${transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0).toFixed(2)}`],
       ['Subscription Costs', `$${subscriptions.reduce((sum, sub) => sum + parseFloat(sub.cost.toString()), 0).toFixed(2)}`],
      [''],
      ['Transactions'],
      ['Date', 'Description', 'Type', 'Amount', 'Category'],
      ...transactions.map(t => [t.date, t.description, t.type, `$${parseFloat(t.amount.toString()).toFixed(2)}`, t.category]),
      [''],
      ['Tasks'],
      ['Title', 'Assignee', 'Due Date', 'Priority', 'Completed'],
      ...tasks.map(t => [t.title, t.assignee, t.dueDate, t.priority, t.completed ? 'Yes' : 'No']),
      [''],
      ['Events'],
      ['Title', 'Date', 'Time', 'Member', 'Category'],
      ...events.map(e => [e.title, e.date, e.time, e.member, e.category])
    ]
    
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `family-hub-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    addNotification({
      type: 'system',
      title: 'Report Downloaded',
      message: 'CSV report downloaded successfully!',
      priority: 'medium'
    })
  }

  const emailReport = () => {
    const subject = encodeURIComponent('Family Hub Report')
    const body = encodeURIComponent(`
Hi,

Please find the Family Hub report summary below:

📊 FAMILY SUMMARY
• Family Members: ${familyMembers.length}
• Total Tasks: ${tasks.length} (${tasks.filter(t => t.completed).length} completed)
• Upcoming Events: ${events.length}
• Active Subscriptions: ${subscriptions.length}

💰 FINANCIAL OVERVIEW
• Total Income: $${transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0).toFixed(2)}
 • Total Expenses: $${transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0).toFixed(2)}
 • Monthly Subscriptions: $${subscriptions.reduce((sum, sub) => sum + parseFloat(sub.cost.toString()), 0).toFixed(2)}
 • Net Balance: $${(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) - transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)).toFixed(2)}

Generated on: ${new Date().toLocaleString()}

Best regards,
Family Hub
    `)
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
    
    addNotification({
      type: 'system',
      title: 'Email Opened',
      message: 'Email client opened with report data!',
      priority: 'medium'
    })
  }

  // Get today's events from the shared context
  const todaysEvents = events
    .filter(event => event.date === new Date().toISOString().split('T')[0])
    .map(event => ({
      time: event.time,
      title: event.title,
      member: event.member,
      type: event.category
    }))

  const notifications = [
    { type: "schedule", message: "Soccer practice in 2 hours", time: "7:00 AM" },
    { type: "subscription", message: "Spotify payment due tomorrow", time: "6:30 AM" },
    { type: "task", message: "Math homework due today", time: "6:00 AM" },
  ]

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "planning", label: "Planning", icon: MapPin },
    { id: "financial", label: "Financial", icon: CreditCard },
    { id: "family", label: "Family", icon: Users },
    { id: "activities", label: "Activities", icon: CheckSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "schedule":
        return <ScheduleCalendar />
      case "planning":
        return <PlanningPage />
      case "financial":
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Financial Management</h2>
            <Tabs defaultValue="subscriptions" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="subscriptions" className="text-sm py-2">Subscriptions</TabsTrigger>
                <TabsTrigger value="transactions" className="text-sm py-2">Transactions</TabsTrigger>
              </TabsList>
              <TabsContent value="subscriptions">
                <SubscriptionTracker />
              </TabsContent>
              <TabsContent value="transactions">
                <TransactionTracker />
              </TabsContent>
            </Tabs>
          </div>
        )
      case "family":
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Family Management</h2>
            <Tabs defaultValue="members" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="members" className="text-xs sm:text-sm py-2">Members</TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2">Analytics</TabsTrigger>
                <TabsTrigger value="reports" className="text-xs sm:text-sm py-2">Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="members">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Family Members</h3>
                    <Button>
                      <Users className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {familyMembers.map((member, index) => (
                      <Card key={index}>
                        <CardHeader className="text-center">
                          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <User className="h-10 w-10 text-primary" />
                          </div>
                          <CardTitle>{member.name}</CardTitle>
                          <p className="text-muted-foreground">{member.role}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Active Tasks</span>
                              <Badge variant="secondary">{member.tasks}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Upcoming Events</span>
                              <Badge variant="outline">{member.upcoming}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                View Profile
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1">
                                Assign Task
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Family Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{familyMembers.length}</div>
                          <p className="text-sm text-muted-foreground">Total Members</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {familyMembers.reduce((sum, member) => sum + member.tasks, 0)}
                          </div>
                          <p className="text-sm text-muted-foreground">Active Tasks</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-secondary">
                            {familyMembers.reduce((sum, member) => sum + member.upcoming, 0)}
                          </div>
                          <p className="text-sm text-muted-foreground">Upcoming Events</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="analytics">
                 <div className="space-y-6">
                   <div className="flex items-center gap-2">
                     <BarChart3 className="h-6 w-6 text-primary" />
                     <h3 className="text-xl font-semibold">Family Analytics</h3>
                   </div>
                   
                   {/* Key Metrics Cards */}
                   <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                     <Card>
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                         <Target className="h-4 w-4 text-muted-foreground" />
                       </CardHeader>
                       <CardContent>
                         <div className="text-2xl font-bold text-primary">
                           {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
                         </div>
                         <p className="text-xs text-muted-foreground">+12% from last month</p>
                       </CardContent>
                     </Card>
                     
                     <Card>
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                         <DollarSign className="h-4 w-4 text-muted-foreground" />
                       </CardHeader>
                       <CardContent>
                         <div className="text-2xl font-bold text-secondary">
                           ${transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0).toFixed(0)}
                         </div>
                         <p className="text-xs text-muted-foreground">+8% from last month</p>
                       </CardContent>
                     </Card>
                     
                     <Card>
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                         <Activity className="h-4 w-4 text-muted-foreground" />
                       </CardHeader>
                       <CardContent>
                         <div className="text-2xl font-bold text-accent">{subscriptions.length}</div>
                         <p className="text-xs text-muted-foreground">${subscriptions.reduce((sum, sub) => sum + parseFloat(sub.cost.toString()), 0).toFixed(0)}/month</p>
                       </CardContent>
                     </Card>
                     
                     <Card>
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">Family Members</CardTitle>
                         <Users className="h-4 w-4 text-muted-foreground" />
                       </CardHeader>
                       <CardContent>
                         <div className="text-2xl font-bold text-primary">{familyMembers.length}</div>
                         <p className="text-xs text-muted-foreground">{events.length} upcoming events</p>
                       </CardContent>
                     </Card>
                   </div>

                   {/* Charts Section */}
                   <div className="grid gap-6 md:grid-cols-2">
                     {/* Monthly Financial Overview */}
                     <Card>
                       <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                           <TrendingUp className="h-5 w-5" />
                           Monthly Financial Overview
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                           <LineChart data={monthlyExpenseData}>
                             <CartesianGrid strokeDasharray="3 3" />
                             <XAxis dataKey="month" />
                             <YAxis />
                             <Tooltip />
                             <Legend />
                             <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="Income" />
                             <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                             <Line type="monotone" dataKey="subscriptions" stroke="#8b5cf6" strokeWidth={2} name="Subscriptions" />
                           </LineChart>
                         </ResponsiveContainer>
                       </CardContent>
                     </Card>

                     {/* Task Completion Trends */}
                     <Card>
                       <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                           <BarChart3 className="h-5 w-5" />
                           Task Completion Trends
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                           <BarChart data={taskCompletionData}>
                             <CartesianGrid strokeDasharray="3 3" />
                             <XAxis dataKey="week" />
                             <YAxis />
                             <Tooltip />
                             <Legend />
                             <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                             <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                           </BarChart>
                         </ResponsiveContainer>
                       </CardContent>
                     </Card>
                   </div>

                   <div className="grid gap-6 md:grid-cols-2">
                     {/* Expense Categories */}
                     <Card>
                       <CardHeader>
                         <CardTitle>Expense Categories</CardTitle>
                       </CardHeader>
                       <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                           <PieChart>
                             <Pie
                               data={categoryExpenseData}
                               cx="50%"
                               cy="50%"
                               labelLine={false}
                               label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                               outerRadius={80}
                               fill="#8884d8"
                               dataKey="value"
                             >
                               {categoryExpenseData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                             </Pie>
                             <Tooltip />
                           </PieChart>
                         </ResponsiveContainer>
                       </CardContent>
                     </Card>

                     {/* Member Activity */}
                     <Card>
                       <CardHeader>
                         <CardTitle>Member Activity</CardTitle>
                       </CardHeader>
                       <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                           <AreaChart data={memberActivityData}>
                             <CartesianGrid strokeDasharray="3 3" />
                             <XAxis dataKey="name" />
                             <YAxis />
                             <Tooltip />
                             <Legend />
                             <Area type="monotone" dataKey="tasks" stackId="1" stroke="#8884d8" fill="#8884d8" name="Tasks" />
                             <Area type="monotone" dataKey="events" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Events" />
                           </AreaChart>
                         </ResponsiveContainer>
                       </CardContent>
                     </Card>
                   </div>
                 </div>
               </TabsContent>
              <TabsContent value="reports">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">Family Reports</h3>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Monthly Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Tasks Completed:</span>
                            <span className="font-semibold">{tasks.filter(t => t.completed).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Events Attended:</span>
                            <span className="font-semibold">{events.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Transactions:</span>
                            <span className="font-semibold">{transactions.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Subscription Costs:</span>
                            <span className="font-semibold">${subscriptions.reduce((sum, sub) => sum + parseFloat(sub.cost.toString()), 0).toFixed(2)}</span>
                          </div>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Financial Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Total Income:</span>
                            <span className="font-semibold text-primary">
                              ${transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Expenses:</span>
                            <span className="font-semibold text-destructive">
                              ${transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Net Balance:</span>
                            <span className="font-bold">
                              ${(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) - 
                                transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Detailed Report
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Export Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Button variant="outline" className="w-full" onClick={generatePDFReport}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export PDF
                        </Button>
                        <Button variant="outline" className="w-full" onClick={generateCSVReport}>
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button variant="outline" className="w-full" onClick={emailReport}>
                          <Mail className="h-4 w-4 mr-2" />
                          Email Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )
      case "activities":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Family Activities</h2>
              <Button>
                <CheckSquare className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5" />
                    <span>Active Tasks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { task: "Complete math homework", assignee: "Alex", due: "Today", priority: "high" },
                      { task: "Grocery shopping", assignee: "Sarah", due: "Tomorrow", priority: "medium" },
                      { task: "Clean garage", assignee: "Family", due: "This weekend", priority: "low" },
                      { task: "Prepare for school presentation", assignee: "Alex", due: "Friday", priority: "high" },
                    ].map((task, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/50 gap-2 sm:gap-0">
                        <div className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded" />
                          <div>
                            <p className="font-medium">{task.task}</p>
                            <p className="text-sm text-muted-foreground">{task.assignee} • Due: {task.due}</p>
                          </div>
                        </div>
                        <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}>
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Upcoming Activities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { activity: "Family Movie Night", date: "Tonight 7:00 PM", type: "family" },
                      { activity: "Soccer Practice", date: "Tomorrow 4:00 PM", type: "sport" },
                      { activity: "Parent-Teacher Conference", date: "Thursday 3:00 PM", type: "school" },
                      { activity: "Weekend Hiking Trip", date: "Saturday 9:00 AM", type: "outdoor" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{activity.activity}</p>
                          <p className="text-sm text-muted-foreground">{activity.date}</p>
                        </div>
                        <Badge variant="outline">{activity.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">4</div>
                    <p className="text-sm text-muted-foreground">Pending Tasks</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">12</div>
                    <p className="text-sm text-muted-foreground">Completed This Week</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">4</div>
                    <p className="text-sm text-muted-foreground">Upcoming Events</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">85%</div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case "settings":
        return (
          <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Settings className="h-8 w-8" />
                Settings
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your Family Hub application settings and preferences.
              </p>
            </div>

            <Tabs defaultValue="database" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="database" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Database</span>
                  <span className="sm:hidden">DB</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                  <span className="sm:hidden">Notify</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Appearance</span>
                  <span className="sm:hidden">Theme</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Privacy</span>
                  <span className="sm:hidden">Privacy</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="database">
                <DatabaseSettings />
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationSettings />
              </TabsContent>

              <TabsContent value="appearance">
                <AppearanceSettings />
              </TabsContent>

              <TabsContent value="privacy">
                <PrivacySettings />
              </TabsContent>
            </Tabs>
          </div>
        )
      case "dashboard":
      default:
        return (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-balance mb-2">Good morning, Family!</h2>
              <p className="text-muted-foreground">Here's what's happening today</p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Today's Schedule */}
              <Card className="col-span-1 md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todaysEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{event.time}</span>
                          </div>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.member}</p>
                          </div>
                        </div>
                        <Badge variant={event.type === "family" ? "default" : "secondary"}>{event.type}</Badge>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setActiveSection("schedule")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Full Calendar
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-6">
                {/* Subscription Summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Subscriptions</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$116.95</div>
                    <p className="text-xs text-muted-foreground">5 active subscriptions</p>
                    <div className="mt-4 space-y-2">
                      {subscriptions.map((sub, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{sub.name}</span>
                          <Badge variant={sub.status === "due" ? "destructive" : "secondary"}>${sub.cost}</Badge>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setActiveSection("subscriptions")}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Subscriptions
                    </Button>
                  </CardContent>
                </Card>

                {/* Family Overview */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Family Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {familyMembers.map((member, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{member.tasks} tasks</p>
                            <p className="text-xs text-muted-foreground">{member.upcoming} upcoming</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Notifications */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Recent Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            notification.type === "schedule"
                              ? "bg-blue-500"
                              : notification.type === "subscription"
                                ? "bg-orange-500"
                                : "bg-green-500"
                          }`}
                        />
                        <span className="text-sm">{notification.message}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <Button className="h-12" onClick={() => setShowAddEventModal(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Add Event
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => setShowTrackSubscriptionModal(true)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Track Subscription
              </Button>
              <Button variant="outline" className="h-12" onClick={() => setShowAddTaskModal(true)}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              <Button variant="outline" className="h-12" onClick={() => setShowManageFamilyModal(true)}>
                <Users className="h-4 w-4 mr-2" />
                Manage Family
              </Button>
            </div>
            
            {/* Test Push Notification Button */}
            <div className="mt-4">
              <TestPushNotificationButton />
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-lg sm:text-xl font-bold text-balance">Family Hub</h1>
          </div>

          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-2 px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-3 w-3 xl:h-4 xl:w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              <NotificationCenter onNavigate={setActiveSection} />
            </div>
            
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="flex items-center justify-between pb-4 border-b sm:hidden">
                    <ThemeToggle />
                    <NotificationCenter onNavigate={setActiveSection} />
                  </div>
                  <nav className="flex flex-col space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id)
                            setMobileMenuOpen(false)
                          }}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                            activeSection === item.id
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      )
                    })}
                  </nav>
              </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">{renderContent()}</main>

      {/* Add Task Modal */}
      <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-title" className="text-right">
                Title
              </Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="col-span-3"
                placeholder="Enter task title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-assignee" className="text-right">
                Assignee
              </Label>
              <Select value={newTask.assignee} onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.name} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-due" className="text-right">
                Due Date
              </Label>
              <Input
                id="task-due"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-priority" className="text-right">
                Priority
              </Label>
              <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddTaskModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (newTask.title && newTask.assignee && newTask.dueDate) {
                addTask({
                  title: newTask.title,
                  assignee: newTask.assignee,
                  dueDate: newTask.dueDate,
                  priority: newTask.priority as 'high' | 'medium' | 'low',
                  completed: false
                })
                setNewTask({ title: "", assignee: "", dueDate: "", priority: "medium" })
                setShowAddTaskModal(false)
              }
            }}>
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Event Modal */}
      <Dialog open={showAddEventModal} onOpenChange={setShowAddEventModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-title" className="text-right">
                Title
              </Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="col-span-3"
                placeholder="Enter event title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-date" className="text-right">
                Date
              </Label>
              <Input
                id="event-date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-time" className="text-right">
                Time
              </Label>
              <Input
                id="event-time"
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-member" className="text-right">
                Member
              </Label>
              <Select value={newEvent.member} onValueChange={(value) => setNewEvent({ ...newEvent, member: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.name} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-category" className="text-right">
                Category
              </Label>
              <Select value={newEvent.category} onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-description" className="text-right">
                Description
              </Label>
              <Input
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="col-span-3"
                placeholder="Event description (optional)"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddEventModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.member) return
              addEvent({
                title: newEvent.title,
                date: newEvent.date,
                time: newEvent.time,
                member: newEvent.member,
                category: newEvent.category as 'personal' | 'work' | 'family' | 'health' | 'social',
                description: newEvent.description
              })
              setNewEvent({ title: "", date: "", time: "", member: "", category: "personal", description: "" })
              setShowAddEventModal(false)
            }}>
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Track Subscription Modal */}
      <Dialog open={showTrackSubscriptionModal} onOpenChange={setShowTrackSubscriptionModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Track New Subscription</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-name" className="text-right">
                Name
              </Label>
              <Input
                id="sub-name"
                value={newSubscription.name}
                onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                className="col-span-3"
                placeholder="Enter subscription name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-cost" className="text-right">
                Cost
              </Label>
              <Input
                id="sub-cost"
                type="number"
                step="0.01"
                value={newSubscription.cost}
                onChange={(e) => setNewSubscription({ ...newSubscription, cost: parseFloat(e.target.value) || 0 })}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-billing" className="text-right">
                Billing
              </Label>
              <Select value={newSubscription.billingCycle} onValueChange={(value) => setNewSubscription({ ...newSubscription, billingCycle: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-category" className="text-right">
                Category
              </Label>
              <Select value={newSubscription.category} onValueChange={(value) => setNewSubscription({ ...newSubscription, category: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-next-payment" className="text-right">
                Next Payment
              </Label>
              <Input
                id="sub-next-payment"
                type="date"
                value={newSubscription.nextPayment}
                onChange={(e) => setNewSubscription({ ...newSubscription, nextPayment: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-website" className="text-right">
                Website
              </Label>
              <Input
                id="sub-website"
                value={newSubscription.website}
                onChange={(e) => setNewSubscription({ ...newSubscription, website: e.target.value })}
                className="col-span-3"
                placeholder="https://example.com (optional)"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowTrackSubscriptionModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (!newSubscription.name || !newSubscription.cost || !newSubscription.nextPayment) return
              addSubscription({
                name: newSubscription.name,
                cost: newSubscription.cost,
                billingCycle: newSubscription.billingCycle as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
                category: newSubscription.category as 'entertainment' | 'productivity' | 'utilities' | 'health' | 'education' | 'other',
                status: 'active',
                nextPayment: newSubscription.nextPayment,
                website: newSubscription.website,
                description: newSubscription.description
              })
              setNewSubscription({ name: "", cost: 0, billingCycle: "monthly", category: "entertainment", status: "active", nextPayment: "", website: "", description: "" })
              setShowTrackSubscriptionModal(false)
            }}>
              Track Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Family Modal */}
      <Dialog open={showManageFamilyModal} onOpenChange={setShowManageFamilyModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Family Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Current Family Members */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Current Members</h3>
              <div className="space-y-2">
                 {familyMembers.map((member, index) => (
                   <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                         <User className="h-5 w-5 text-primary" />
                       </div>
                       <div>
                         <p className="font-medium">{member.name}</p>
                         <p className="text-sm text-muted-foreground">{member.role}</p>
                       </div>
                     </div>
                     <div className="flex space-x-2">
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => {
                           setEditingMember({ index, name: member.name, role: member.role, email: member.email || "" })
                           setShowEditMemberModal(true)
                         }}
                       >
                         Edit
                       </Button>
                       <Button 
                         variant="destructive" 
                         size="sm" 
                         onClick={() => {
                           setDeletingMemberIndex(index)
                           setShowDeleteConfirm(true)
                         }}
                       >
                         Remove
                       </Button>
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* Add New Member */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Add New Member</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="member-name">Name</Label>
                    <Input
                      id="member-name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member-role">Role</Label>
                    <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Guardian">Guardian</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="member-email">Email (Optional)</Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <Button onClick={() => {
                   if (newMember.name && newMember.role) {
                     const memberToAdd = { 
                       name: newMember.name, 
                       role: newMember.role, 
                       email: newMember.email,
                       tasks: 0,
                       upcoming: 0
                     }
                     addFamilyMember(memberToAdd)
                     setNewMember({ name: "", role: "", email: "" })
                   }
                 }}>
                  <Users className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowManageFamilyModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
       </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={showEditMemberModal} onOpenChange={setShowEditMemberModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Family Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editingMember.name}
                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Select value={editingMember.role} onValueChange={(value) => setEditingMember({ ...editingMember, role: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editingMember.email}
                onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                className="col-span-3"
                placeholder="Enter email address"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditMemberModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (editingMember.name && editingMember.role) {
                const memberToUpdate = {
                  name: editingMember.name,
                  role: editingMember.role,
                  email: editingMember.email,
                  tasks: familyMembers[editingMember.index]?.tasks || 0,
                  upcoming: familyMembers[editingMember.index]?.upcoming || 0
                }
                updateFamilyMember(familyMembers[editingMember.index]?.id || editingMember.index.toString(), memberToUpdate)
                setShowEditMemberModal(false)
                setEditingMember({ index: -1, name: "", role: "", email: "" })
              }
            }}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deletingMemberIndex >= 0 ? familyMembers[deletingMemberIndex]?.name : ''} from the family? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteConfirm(false)
              setDeletingMemberIndex(-1)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deletingMemberIndex >= 0 && familyMembers[deletingMemberIndex]) {
                  deleteFamilyMember(familyMembers[deletingMemberIndex]?.id || deletingMemberIndex.toString())
                  setShowDeleteConfirm(false)
                  setDeletingMemberIndex(-1)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
