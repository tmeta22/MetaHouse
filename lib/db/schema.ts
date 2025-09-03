import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Tasks table
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  assignee: text('assignee').notNull(),
  dueDate: text('due_date').notNull(),
  priority: text('priority', { enum: ['high', 'medium', 'low'] }).notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// Events table
export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  member: text('member').notNull(),
  category: text('category', { enum: ['personal', 'work', 'family', 'health', 'social'] }).notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// Subscriptions table
export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  cost: real('cost').notNull(),
  billingCycle: text('billing_cycle', { enum: ['weekly', 'monthly', 'quarterly', 'yearly'] }).notNull(),
  category: text('category', { enum: ['entertainment', 'productivity', 'utilities', 'health', 'education', 'other'] }).notNull(),
  status: text('status', { enum: ['active', 'paused', 'cancelled', 'due'] }).notNull(),
  nextPayment: text('next_payment').notNull(),
  website: text('website'),
  description: text('description'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// Family Members table
export const familyMembers = sqliteTable('family_members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  email: text('email'),
  tasks: integer('tasks').notNull().default(0),
  upcoming: integer('upcoming').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// Transactions table
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  category: text('category').notNull(),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  date: text('date').notNull(),
  member: text('member').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// Export types for TypeScript
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert

export type FamilyMember = typeof familyMembers.$inferSelect
export type NewFamilyMember = typeof familyMembers.$inferInsert

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert

// Family Planning - Trips table
export const trips = sqliteTable('trips', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  destination: text('destination').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  budget: real('budget'),
  status: text('status', { enum: ['planning', 'confirmed', 'ongoing', 'completed', 'cancelled'] }).notNull().default('planning'),
  description: text('description'),
  organizer: text('organizer').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// Family Planning - Parties table
export const parties = sqliteTable('parties', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type', { enum: ['birthday', 'anniversary', 'holiday', 'celebration', 'gathering', 'other'] }).notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  location: text('location').notNull(),
  budget: real('budget'),
  guestCount: integer('guest_count').default(0),
  status: text('status', { enum: ['planning', 'confirmed', 'ongoing', 'completed', 'cancelled'] }).notNull().default('planning'),
  description: text('description'),
  organizer: text('organizer').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// Trip Itinerary Items
export const tripItinerary = sqliteTable('trip_itinerary', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').notNull(),
  day: integer('day').notNull(),
  time: text('time'),
  activity: text('activity').notNull(),
  location: text('location'),
  cost: real('cost'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// Party Tasks/Activities
export const partyTasks = sqliteTable('party_tasks', {
  id: text('id').primaryKey(),
  partyId: text('party_id').notNull(),
  task: text('task').notNull(),
  assignee: text('assignee'),
  dueDate: text('due_date'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  cost: real('cost'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// Participants (for both trips and parties)
export const participants = sqliteTable('participants', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull(), // Can be trip_id or party_id
  eventType: text('event_type', { enum: ['trip', 'party'] }).notNull(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  role: text('role').default('participant'), // organizer, participant, etc.
  status: text('status', { enum: ['invited', 'confirmed', 'declined', 'maybe'] }).notNull().default('invited'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})

// Export types for family planning
export type Trip = typeof trips.$inferSelect
export type NewTrip = typeof trips.$inferInsert

export type Party = typeof parties.$inferSelect
export type NewParty = typeof parties.$inferInsert

export type TripItinerary = typeof tripItinerary.$inferSelect
export type NewTripItinerary = typeof tripItinerary.$inferInsert

export type PartyTask = typeof partyTasks.$inferSelect
export type NewPartyTask = typeof partyTasks.$inferInsert

export type Participant = typeof participants.$inferSelect
export type NewParticipant = typeof participants.$inferInsert