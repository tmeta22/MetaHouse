import { db } from './index'
import * as schema from './schema'
import { eq, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Helper function to check database type
function getDatabaseType(): 'sqlite' | 'postgresql' {
  const configFile = join(process.cwd(), 'database-config.json')
  
  if (existsSync(configFile)) {
    try {
      const config = JSON.parse(readFileSync(configFile, 'utf-8'))
      return config.type === 'sqlite' ? 'sqlite' : 'postgresql'
    } catch (error) {
      return 'sqlite'
    }
  }
  
  return 'sqlite'
}

// Task operations
export class TaskService {
  static async getAll() {
    return await db.select().from(schema.tasks).orderBy(desc(schema.tasks.createdAt))
  }

  static async create(task: Omit<schema.NewTask, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTask: schema.NewTask = {
      ...task,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (getDatabaseType() === 'sqlite') {
      return await db.insert(schema.tasks).values(newTask).returning()
    } else {
      await db.insert(schema.tasks).values(newTask)
      return [newTask]
    }
  }

  static async update(id: string, updates: Partial<Omit<schema.NewTask, 'id' | 'createdAt'>>) {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    if (getDatabaseType() === 'sqlite') {
      return await db.update(schema.tasks).set(updateData).where(eq(schema.tasks.id, id)).returning()
    } else {
      await db.update(schema.tasks).set(updateData).where(eq(schema.tasks.id, id))
      return await db.select().from(schema.tasks).where(eq(schema.tasks.id, id))
    }
  }

  static async delete(id: string) {
    return await db.delete(schema.tasks).where(eq(schema.tasks.id, id))
  }
}

// Event operations
export class EventService {
  static async getAll() {
    return await db.select().from(schema.events).orderBy(desc(schema.events.createdAt))
  }

  static async create(event: Omit<schema.NewEvent, 'id' | 'createdAt' | 'updatedAt'>) {
    const newEvent: schema.NewEvent = {
      ...event,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (getDatabaseType() === 'sqlite') {
      return await db.insert(schema.events).values(newEvent).returning()
    } else {
      await db.insert(schema.events).values(newEvent)
      return [newEvent]
    }
  }

  static async update(id: string, updates: Partial<Omit<schema.NewEvent, 'id' | 'createdAt'>>) {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    if (getDatabaseType() === 'sqlite') {
      return await db.update(schema.events).set(updateData).where(eq(schema.events.id, id)).returning()
    } else {
      await db.update(schema.events).set(updateData).where(eq(schema.events.id, id))
      return await db.select().from(schema.events).where(eq(schema.events.id, id))
    }
  }

  static async delete(id: string) {
    return await db.delete(schema.events).where(eq(schema.events.id, id))
  }
}

// Subscription operations
export class SubscriptionService {
  static async getAll() {
    return await db.select().from(schema.subscriptions).orderBy(desc(schema.subscriptions.createdAt))
  }

  static async create(subscription: Omit<schema.NewSubscription, 'id' | 'createdAt' | 'updatedAt'>) {
    const newSubscription: schema.NewSubscription = {
      ...subscription,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (getDatabaseType() === 'sqlite') {
      return await db.insert(schema.subscriptions).values(newSubscription).returning()
    } else {
      await db.insert(schema.subscriptions).values(newSubscription)
      return [newSubscription]
    }
  }

  static async update(id: string, updates: Partial<Omit<schema.NewSubscription, 'id' | 'createdAt'>>) {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    if (getDatabaseType() === 'sqlite') {
      return await db.update(schema.subscriptions).set(updateData).where(eq(schema.subscriptions.id, id)).returning()
    } else {
      await db.update(schema.subscriptions).set(updateData).where(eq(schema.subscriptions.id, id))
      return await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.id, id))
    }
  }

  static async delete(id: string) {
    return await db.delete(schema.subscriptions).where(eq(schema.subscriptions.id, id))
  }
}

// Family Member operations
export class FamilyMemberService {
  static async getAll() {
    return await db.select().from(schema.familyMembers).orderBy(desc(schema.familyMembers.createdAt))
  }

  static async create(member: Omit<schema.NewFamilyMember, 'id' | 'createdAt' | 'updatedAt'>) {
    const newMember: schema.NewFamilyMember = {
      ...member,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (getDatabaseType() === 'sqlite') {
      return await db.insert(schema.familyMembers).values(newMember).returning()
    } else {
      await db.insert(schema.familyMembers).values(newMember)
      return [newMember]
    }
  }

  static async update(id: string, updates: Partial<Omit<schema.NewFamilyMember, 'id' | 'createdAt'>>) {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    if (getDatabaseType() === 'sqlite') {
      return await db.update(schema.familyMembers).set(updateData).where(eq(schema.familyMembers.id, id)).returning()
    } else {
      await db.update(schema.familyMembers).set(updateData).where(eq(schema.familyMembers.id, id))
      return await db.select().from(schema.familyMembers).where(eq(schema.familyMembers.id, id))
    }
  }

  static async delete(id: string) {
    return await db.delete(schema.familyMembers).where(eq(schema.familyMembers.id, id))
  }
}

// Transaction operations
export class TransactionService {
  static async getAll() {
    return await db.select().from(schema.transactions).orderBy(desc(schema.transactions.createdAt))
  }

  static async create(transaction: Omit<schema.NewTransaction, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTransaction: schema.NewTransaction = {
      ...transaction,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (getDatabaseType() === 'sqlite') {
      return await db.insert(schema.transactions).values(newTransaction).returning()
    } else {
      await db.insert(schema.transactions).values(newTransaction)
      return [newTransaction]
    }
  }

  static async update(id: string, updates: Partial<Omit<schema.NewTransaction, 'id' | 'createdAt'>>) {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    if (getDatabaseType() === 'sqlite') {
      return await db.update(schema.transactions).set(updateData).where(eq(schema.transactions.id, id)).returning()
    } else {
      await db.update(schema.transactions).set(updateData).where(eq(schema.transactions.id, id))
      return await db.select().from(schema.transactions).where(eq(schema.transactions.id, id))
    }
  }

  static async delete(id: string) {
    return await db.delete(schema.transactions).where(eq(schema.transactions.id, id))
  }
}

// Data seeding function
export async function seedDatabase() {
  console.log('Seeding database with initial data...')
  
  // Check if data already exists
  const existingTasks = await TaskService.getAll()
  if (existingTasks.length > 0) {
    console.log('Database already contains data, skipping seed')
    return
  }

  // Seed family members first
  await FamilyMemberService.create({
    name: 'Sarah',
    role: 'Mom',
    email: 'sarah@family.com',
    tasks: 3,
    upcoming: 2
  })

  await FamilyMemberService.create({
    name: 'Alex',
    role: 'Son', 
    email: 'alex@family.com',
    tasks: 5,
    upcoming: 1
  })

  // Seed tasks
  await TaskService.create({
    title: 'Buy groceries',
    assignee: 'Sarah',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    completed: false
  })

  await TaskService.create({
    title: 'Soccer practice pickup',
    assignee: 'Alex',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    completed: false
  })

  // Seed events
  await EventService.create({
    title: 'Soccer Practice',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    member: 'Alex',
    category: 'family',
    description: 'Weekly soccer practice'
  })

  await EventService.create({
    title: 'Dentist Appointment',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00',
    member: 'Sarah',
    category: 'health'
  })

  // Seed subscriptions
  await SubscriptionService.create({
    name: 'Netflix',
    cost: 15.99,
    billingCycle: 'monthly',
    category: 'entertainment',
    status: 'active',
    nextPayment: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    website: 'https://netflix.com'
  })

  await SubscriptionService.create({
    name: 'Spotify',
    cost: 9.99,
    billingCycle: 'monthly',
    category: 'entertainment',
    status: 'due',
    nextPayment: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    website: 'https://spotify.com'
  })

  // Seed transactions
  await TransactionService.create({
    type: 'expense',
    category: 'Groceries',
    amount: 125.50,
    description: 'Weekly grocery shopping',
    date: new Date().toISOString().split('T')[0],
    member: 'Sarah'
  })

  await TransactionService.create({
    type: 'income',
    category: 'Salary',
    amount: 3500.00,
    description: 'Monthly salary',
    date: new Date().toISOString().split('T')[0],
    member: 'Sarah'
  })

  console.log('Database seeded successfully!')
}