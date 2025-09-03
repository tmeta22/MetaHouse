"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// Types - Updated to match database schema
export interface Task {
  id: string
  title: string
  assignee: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  title: string
  date: string
  time: string
  member: string
  category: 'personal' | 'work' | 'family' | 'health' | 'social'
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  name: string
  cost: number
  billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  category: 'entertainment' | 'productivity' | 'utilities' | 'health' | 'education' | 'other'
  status: 'active' | 'paused' | 'cancelled' | 'due'
  nextPayment: string
  website?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface FamilyMember {
  id: string
  name: string
  role: string
  email?: string
  tasks: number
  upcoming: number
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  member: string
  createdAt: string
  updatedAt: string
}

// Context type
interface DataContextType {
  // Loading state
  isLoading: boolean
  
  // Tasks
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  
  // Events
  events: Event[]
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateEvent: (id: string, updates: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  
  // Subscriptions
  subscriptions: Subscription[]
  addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateSubscription: (id: string, updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  deleteSubscription: (id: string) => Promise<void>
  
  // Family Members
  familyMembers: FamilyMember[]
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateFamilyMember: (id: string, updates: Partial<Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  deleteFamilyMember: (id: string) => Promise<void>
  
  // Transactions
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  
  // Utility functions
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Initialize database and load data
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true)
        // Only initialize database if no data exists
        const tasksCheck = await fetch('/api/tasks')
        const tasksData = await tasksCheck.json()
        
        if (!Array.isArray(tasksData) || tasksData.length === 0) {
          // Initialize database via API only if no data exists
          await fetch('/api/init', { method: 'POST' })
        }
        
        await refreshData()
      } catch (error) {
        console.error('Failed to initialize database:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initData()
  }, [])

  // Refresh all data from database
  const refreshData = useCallback(async () => {
    try {
      const [tasksRes, eventsRes, subscriptionsRes, familyMembersRes, transactionsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/events'),
        fetch('/api/subscriptions'),
        fetch('/api/family-members'),
        fetch('/api/transactions')
      ])

      const [tasksData, eventsData, subscriptionsData, familyMembersData, transactionsData] = await Promise.all([
        tasksRes.json(),
        eventsRes.json(),
        subscriptionsRes.json(),
        familyMembersRes.json(),
        transactionsRes.json()
      ])
      
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setEvents(Array.isArray(eventsData) ? eventsData : [])
      setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : [])
      setFamilyMembers(Array.isArray(familyMembersData) ? familyMembersData : [])
      setTransactions(Array.isArray(transactionsData) ? transactionsData : [])
    } catch (error) {
      console.error('Failed to refresh data:', error)
      // Set empty arrays as fallback to prevent infinite loading
      setTasks([])
      setEvents([])
      setSubscriptions([])
      setFamilyMembers([])
      setTransactions([])
    }
  }, [])

  // Task functions
  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })
      await refreshData()
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }, [refreshData])

  const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      await refreshData()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }, [refreshData])

  const deleteTask = useCallback(async (id: string) => {
    try {
      await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
      await refreshData()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }, [refreshData])

  // Event functions
  const addEvent = useCallback(async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })
      await refreshData()
    } catch (error) {
      console.error('Failed to add event:', error)
    }
  }, [refreshData])

  const updateEvent = useCallback(async (id: string, updates: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      await refreshData()
    } catch (error) {
      console.error('Failed to update event:', error)
    }
  }, [refreshData])

  const deleteEvent = useCallback(async (id: string) => {
    try {
      await fetch(`/api/events?id=${id}`, { method: 'DELETE' })
      await refreshData()
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }, [refreshData])

  // Subscription functions
  const addSubscription = useCallback(async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      })
      await refreshData()
    } catch (error) {
      console.error('Failed to add subscription:', error)
    }
  }, [refreshData])

  const updateSubscription = useCallback(async (id: string, updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      await refreshData()
    } catch (error) {
      console.error('Failed to update subscription:', error)
    }
  }, [refreshData])

  const deleteSubscription = useCallback(async (id: string) => {
    try {
      await fetch(`/api/subscriptions?id=${id}`, { method: 'DELETE' })
      await refreshData()
    } catch (error) {
      console.error('Failed to delete subscription:', error)
    }
  }, [refreshData])

  // Family member functions
  const addFamilyMember = useCallback(async (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await fetch('/api/family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member)
      })
      await refreshData()
    } catch (error) {
      console.error('Failed to add family member:', error)
    }
  }, [refreshData])

  const updateFamilyMember = useCallback(async (id: string, updates: Partial<Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      await fetch('/api/family-members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      await refreshData()
    } catch (error) {
      console.error('Failed to update family member:', error)
    }
  }, [refreshData])

  const deleteFamilyMember = useCallback(async (id: string) => {
    try {
      await fetch(`/api/family-members?id=${id}`, { method: 'DELETE' })
      await refreshData()
    } catch (error) {
      console.error('Failed to delete family member:', error)
    }
  }, [refreshData])

  // Transaction functions
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      })
      await refreshData()
    } catch (error) {
      console.error('Failed to add transaction:', error)
    }
  }, [refreshData])

  const updateTransaction = useCallback(async (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      await refreshData()
    } catch (error) {
      console.error('Failed to update transaction:', error)
    }
  }, [refreshData])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
      await refreshData()
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    }
  }, [refreshData])

  const value: DataContextType = {
    isLoading,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}