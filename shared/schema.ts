import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, date, serial, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: varchar("role", { length: 20 }).notNull().default("user"), // admin, user, viewer
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  // Subscription fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("trial"), // trial, active, canceled, past_due
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cases = pgTable("cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  caseNumber: text("case_number"),
  description: text("description"),
  caseType: varchar("case_type", { length: 50 }).notNull(), // civil_rights, criminal, administrative, etc.
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, closed, pending, archived
  priority: varchar("priority", { length: 10 }).notNull().default("medium"), // low, medium, high, urgent
  court: text("court"),
  jurisdiction: text("jurisdiction"),
  opposingParty: text("opposing_party"),
  leadAttorney: text("lead_attorney"),
  dateOpened: date("date_opened").notNull(),
  dateClosed: date("date_closed"),
  tags: jsonb("tags").$type<string[]>().default([]),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

export const caseDocuments = pgTable("case_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").references(() => cases.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // pdf, image, audio, video, transcript, letter, other
  date: timestamp("date"),
  path: text("path"),
  summary: text("summary"),
  tags: jsonb("tags").$type<string[]>(),
  sourceNote: text("source_note"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
});

export const timelineEvents = pgTable("timeline_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").references(() => cases.id).notNull(),
  date: timestamp("date").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  docRefs: jsonb("doc_refs").$type<string[]>(),
  tags: jsonb("tags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const foiaRequests = pgTable("foia_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").references(() => cases.id).notNull(),
  agency: text("agency").notNull(),
  requestNumber: text("request_number"),
  status: text("status").notNull(), // submitted, pending, completed, denied
  submittedDate: timestamp("submitted_date").notNull(),
  responseDate: timestamp("response_date"),
  description: text("description"),
  responseSummary: text("response_summary"),
  documentsReceived: jsonb("documents_received").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const caseNotes = pgTable("case_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").references(() => cases.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  documentId: varchar("document_id").references(() => caseDocuments.id),
  tags: jsonb("tags").$type<string[]>(),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

export const motions = pgTable("motions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").references(() => cases.id).notNull(),
  title: text("title").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // motion_to_dismiss, motion_for_summary_judgment, etc.
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, filed, pending, granted, denied
  priority: varchar("priority", { length: 10 }).notNull().default("medium"), // low, medium, high, urgent
  description: text("description"),
  dueDate: date("due_date"),
  filedDate: date("filed_date"),
  court: text("court"),
  caseNumber: text("case_number"),
  assignedTo: text("assigned_to"),
  notes: text("notes"),
  attachments: jsonb("attachments").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

export const deadlines = pgTable("deadlines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").references(() => cases.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  priority: varchar("priority", { length: 10 }).notNull().default("medium"),
  category: varchar("category", { length: 30 }).notNull(), // filing, discovery, hearing, appeal, etc.
  status: varchar("status", { length: 20 }).notNull().default("upcoming"), // upcoming, overdue, completed, cancelled
  relatedMotionId: varchar("related_motion_id").references(() => motions.id),
  reminderDays: jsonb("reminder_days").$type<number[]>().default([7, 3, 1]), // Days before deadline to remind
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertCaseDocumentSchema = createInsertSchema(caseDocuments).omit({
  id: true,
  uploadedAt: true,
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({
  id: true,
  createdAt: true,
});

export const insertFoiaRequestSchema = createInsertSchema(foiaRequests).omit({
  id: true,
  createdAt: true,
});

export const insertCaseNoteSchema = createInsertSchema(caseNotes).omit({
  id: true,
  createdAt: true,
});

export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMotionSchema = createInsertSchema(motions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeadlineSchema = createInsertSchema(deadlines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCaseDocument = z.infer<typeof insertCaseDocumentSchema>;
export type CaseDocument = typeof caseDocuments.$inferSelect;

export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;

export type InsertFoiaRequest = z.infer<typeof insertFoiaRequestSchema>;
export type FoiaRequest = typeof foiaRequests.$inferSelect;

export type InsertCaseNote = z.infer<typeof insertCaseNoteSchema>;
export type CaseNote = typeof caseNotes.$inferSelect;

export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof cases.$inferSelect;

export type InsertMotion = z.infer<typeof insertMotionSchema>;
export type Motion = typeof motions.$inferSelect;

export type InsertDeadline = z.infer<typeof insertDeadlineSchema>;
export type Deadline = typeof deadlines.$inferSelect;

// Coupon Codes table
export const couponCodes = pgTable("coupon_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull(), // 'percentage' or 'fixed'
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  maxUses: integer("max_uses").default(1), // null = unlimited, 1 = single use
  currentUses: integer("current_uses").default(0).notNull(),
  validFrom: timestamp("valid_from").defaultNow().notNull(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: varchar("created_by"), // admin who created it
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Additional constraints
  minOrderValue: numeric("min_order_value", { precision: 10, scale: 2 }),
  applicablePlans: text("applicable_plans").array(), // which subscription plans this applies to
  metadata: jsonb("metadata"), // flexible data for additional rules
});

// Coupon Usage tracking
export const couponUsage = pgTable("coupon_usage", {
  id: serial("id").primaryKey(),
  couponId: integer("coupon_id").references(() => couponCodes.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  usedAt: timestamp("used_at").defaultNow().notNull(),
  discountApplied: numeric("discount_applied", { precision: 10, scale: 2 }).notNull(),
  originalAmount: numeric("original_amount", { precision: 10, scale: 2 }).notNull(),
  finalAmount: numeric("final_amount", { precision: 10, scale: 2 }).notNull(),
  subscriptionId: varchar("subscription_id"), // Stripe subscription ID if applicable
  metadata: jsonb("metadata"),
});

// Relations
export const couponCodesRelations = relations(couponCodes, ({ many }) => ({
  usage: many(couponUsage),
}));

export const couponUsageRelations = relations(couponUsage, ({ one }) => ({
  coupon: one(couponCodes, {
    fields: [couponUsage.couponId],
    references: [couponCodes.id],
  }),
  user: one(users, {
    fields: [couponUsage.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertCouponCodeSchema = createInsertSchema(couponCodes).omit({
  id: true,
  currentUses: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCouponUsageSchema = createInsertSchema(couponUsage).omit({
  id: true,
  usedAt: true,
});

// Types
export type InsertCouponCode = z.infer<typeof insertCouponCodeSchema>;
export type CouponCode = typeof couponCodes.$inferSelect;

export type InsertCouponUsage = z.infer<typeof insertCouponUsageSchema>;
export type CouponUsage = typeof couponUsage.$inferSelect;
