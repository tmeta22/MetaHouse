-- Add trips table
CREATE TABLE IF NOT EXISTS "trips" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"destination" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"budget" real,
	"status" text DEFAULT 'planning' NOT NULL,
	"description" text,
	"organizer" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add parties table
CREATE TABLE IF NOT EXISTS "parties" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"location" text NOT NULL,
	"budget" real,
	"guest_count" integer DEFAULT 0,
	"status" text DEFAULT 'planning' NOT NULL,
	"description" text,
	"organizer" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add trip_itinerary table
CREATE TABLE IF NOT EXISTS "trip_itinerary" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"day" integer NOT NULL,
	"time" text,
	"activity" text NOT NULL,
	"location" text,
	"cost" real,
	"notes" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add party_tasks table
CREATE TABLE IF NOT EXISTS "party_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"party_id" text NOT NULL,
	"task" text NOT NULL,
	"assignee" text,
	"due_date" text,
	"completed" boolean DEFAULT false NOT NULL,
	"cost" real,
	"notes" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add participants table
CREATE TABLE IF NOT EXISTS "participants" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"role" text DEFAULT 'participant',
	"status" text DEFAULT 'invited' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);