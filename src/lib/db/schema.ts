import { pgTable, text, uuid, jsonb, integer, numeric, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Profiles table - matches Supabase schema EXACTLY
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // No defaultRandom - comes from auth.users
  email: text("email").notNull().unique(),
  fullName: text("full_name"), // Maps to DB column full_name
  phone: text("phone"),
  avatarUrl: text("avatar_url"), // Maps to DB column avatar_url
  userType: text("user_type", { 
    enum: ["customer", "owner", "merchant", "admin"] 
  }).default("customer"),
  // Note: NO passwordHash - Supabase Auth manages passwords in auth.users
  // Note: NO emailVerified - use is_verified from auth.users instead
  isActive: boolean("is_active").default(true), // For account suspension
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("idx_profiles_email").on(table.email),
  userTypeIdx: index("idx_profiles_user_type").on(table.userType),
}));

// Office Spaces
export const officeSpaces = pgTable("office_spaces", {
  id: uuid("id").primaryKey(), // Uses default in DB: gen_random_uuid()
  ownerId: uuid("owner_id").references(() => profiles.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").default("USA"),
  latitude: numeric("latitude", 10, 8),
  longitude: numeric("longitude", 11, 8),
  photos: text("photos").array().default([]),
  amenities: text("amenities").array().default([]),
  capacity: integer("capacity").notNull(),
  hourlyPrice: numeric("hourly_price", 10, 2),
  dailyPrice: numeric("daily_price", 10, 2),
  weeklyPrice: numeric("weekly_price", 10, 2),
  monthlyPrice: numeric("monthly_price", 10, 2),
  rating: numeric("rating", 3, 2).default(0),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_office_spaces_owner").on(table.ownerId),
  index("idx_office_spaces_city").on(table.city),
  index("idx_office_spaces_active").on(table.isActive),
  index("idx_office_spaces_price").on(table.hourlyPrice),
  index("idx_office_spaces_city_active").on(table.city, table.isActive),
]);

// Storage Spaces
export const storageSpaces = pgTable("storage_spaces", {
  id: uuid("id").primaryKey(),
  ownerId: uuid("owner_id").references(() => profiles.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").default("USA"),
  latitude: numeric("latitude", 10, 8),
  longitude: numeric("longitude", 11, 8),
  photos: text("photos").array().default([]),
  storageType: text("storage_type", { enum: ["shelf", "room", "warehouse"] }).notNull(),
  lengthFt: numeric("length_ft", 8, 2),
  widthFt: numeric("width_ft", 8, 2),
  heightFt: numeric("height_ft", 8, 2),
  features: text("features").array().default([]),
  monthlyPrice: numeric("monthly_price", 10, 2).notNull(),
  annualPrice: numeric("annual_price", 10, 2),
  rating: numeric("rating", 3, 2).default(0),
  reviewCount: integer("review_count").default(0),
  isAvailable: boolean("is_available").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_storage_spaces_owner").on(table.ownerId),
  index("idx_storage_spaces_city").on(table.city),
  index("idx_storage_spaces_active").on(table.isActive),
]);

// Products
export const products = pgTable("products", {
  id: uuid("id").primaryKey(),
  merchantId: uuid("merchant_id").references(() => profiles.id).notNull(),
  storageId: uuid("storage_id").references(() => storageSpaces.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  price: numeric("price", 10, 2).notNull(),
  images: text("images").array().default([]),
  inventory: integer("inventory").default(0),
  sku: text("sku").unique(),
  rating: numeric("rating", 3, 2).default(0),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_products_merchant").on(table.merchantId),
  index("idx_products_category").on(table.category),
  index("idx_products_active").on(table.isActive),
  index("idx_products_price").on(table.price),
  index("idx_products_storage_active").on(table.storageId, table.isActive),
  index("idx_products_category_active").on(table.category, table.isActive),
]);

// Bookings
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey(),
  customerId: uuid("customer_id").references(() => profiles.id).notNull(),
  spaceId: uuid("space_id").references(() => officeSpaces.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPrice: numeric("total_price", 10, 2).notNull(),
  status: text("status", { enum: ["pending", "confirmed", "cancelled", "completed"] }).default("pending"),
  paymentId: text("payment_id"), // Changed from uuid to text (Paystack reference)
  cancellationPolicy: jsonb("cancellation_policy"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_bookings_customer").on(table.customerId),
  index("idx_bookings_space").on(table.spaceId),
  index("idx_bookings_status").on(table.status),
  index("idx_bookings_customer_status").on(table.customerId, table.status),
  index("idx_bookings_space_status").on(table.spaceId, table.status),
]);

// Storage Rentals
export const storageRentals = pgTable("storage_rentals", {
  id: uuid("id").primaryKey(),
  merchantId: uuid("merchant_id").references(() => profiles.id).notNull(),
  storageId: uuid("storage_id").references(() => storageSpaces.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  monthlyRate: numeric("monthly_rate", 10, 2).notNull(),
  totalAmount: numeric("total_amount", 10, 2).notNull(),
  status: text("status", { enum: ["active", "expired", "cancelled"] }).default("active"),
  paymentId: text("payment_id"), // Changed from uuid to text
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey(),
  customerId: uuid("customer_id").references(() => profiles.id).notNull(),
  totalAmount: numeric("total_amount", 10, 2).notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  status: text("status", { enum: ["pending", "processing", "shipped", "delivered", "cancelled"] }).default("pending"),
  paymentId: text("payment_id"), // Changed from uuid to text
  trackingNumber: text("tracking_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_orders_customer").on(table.customerId),
  index("idx_orders_status").on(table.status),
  index("idx_orders_customer_status").on(table.customerId, table.status),
]);

// Order Items
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", 10, 2).notNull(),
  totalPrice: numeric("total_price", 10, 2).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  targetId: uuid("target_id").notNull(),
  targetType: text("target_type", { enum: ["office", "product", "storage"] }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  photos: text("photos").array().default([]),
  response: text("response"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_reviews_target").on(table.targetId, table.targetType),
  index("idx_reviews_user").on(table.userId),
]);

// Payments
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  amount: numeric("amount", 10, 2).notNull(),
  currency: text("currency").default("USD"),
  paymentMethod: text("payment_method").notNull(),
  paymentGateway: text("payment_gateway").notNull(),
  transactionId: text("transaction_id").unique().notNull(),
  status: text("status", { enum: ["pending", "completed", "failed", "refunded"] }).default("pending"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cart Items
export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_cart_items_user").on(table.userId),
  index("idx_cart_items_product").on(table.productId),
]);

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_notifications_user").on(table.userId),
  index("idx_notifications_read").on(table.isRead),
  index("idx_notifications_user_read").on(table.userId, table.isRead),
]);

// Messages
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey(),
  conversationId: uuid("conversation_id").notNull(),
  senderId: uuid("sender_id").references(() => profiles.id).notNull(),
  receiverId: uuid("receiver_id").references(() => profiles.id).notNull(),
  content: text("content").notNull(),
  attachments: text("attachments").array().default([]),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_messages_conversation").on(table.conversationId),
  index("idx_messages_sender").on(table.senderId),
  index("idx_messages_receiver").on(table.receiverId),
]);

// Refresh Tokens (if we need custom refresh token management)
// With Supabase Auth, this may be optional - Supabase manages sessions
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  token: text("token").notNull().unique(),
  revoked: boolean("revoked").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_refresh_tokens_user").on(table.userId),
  index("idx_refresh_tokens_token").on(table.token),
]);

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  officeSpaces: many(officeSpaces),
  storageSpaces: many(storageSpaces),
  products: many(products),
  bookings: many(bookings),
  storageRentals: many(storageRentals),
  orders: many(orders),
  payments: many(payments),
  cartItems: many(cartItems),
  notifications: many(notifications),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
}));

export const officeSpacesRelations = relations(officeSpaces, ({ one, many }) => ({
  owner: one(profiles, {
    fields: [officeSpaces.ownerId],
    references: [profiles.id],
  }),
  bookings: many(bookings),
}));

export const storageSpacesRelations = relations(storageSpaces, ({ one, many }) => ({
  owner: one(profiles, {
    fields: [storageSpaces.ownerId],
    references: [profiles.id],
  }),
  products: many(products),
  storageRentals: many(storageRentals),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  merchant: one(profiles, {
    fields: [products.merchantId],
    references: [profiles.id],
  }),
  storage: one(storageSpaces, {
    fields: [products.storageId],
    references: [storageSpaces.id],
  }),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(profiles, {
    fields: [bookings.customerId],
    references: [profiles.id],
  }),
  space: one(officeSpaces, {
    fields: [bookings.spaceId],
    references: [officeSpaces.id],
  }),
}));

export const storageRentalsRelations = relations(storageRentals, ({ one }) => ({
  merchant: one(profiles, {
    fields: [storageRentals.merchantId],
    references: [profiles.id],
  }),
  storage: one(storageSpaces, {
    fields: [storageRentals.storageId],
    references: [storageSpaces.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(profiles, {
    fields: [orders.customerId],
    references: [profiles.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(profiles, {
    fields: [reviews.userId],
    references: [profiles.id],
  }),
}));

// Insert/Select schemas for validation - field names must match Drizzle schema (camelCase)
// These will map to snake_case DB columns automatically via drizzle-orm
export const insertProfileSchema = createInsertSchema(profiles).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectProfileSchema = createSelectSchema(profiles);

export const insertOfficeSpaceSchema = createInsertSchema(officeSpaces).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectOfficeSpaceSchema = createSelectSchema(officeSpaces);

export const insertStorageSpaceSchema = createInsertSchema(storageSpaces).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectStorageSpaceSchema = createSelectSchema(storageSpaces);

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectProductSchema = createSelectSchema(products);

export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectBookingSchema = createSelectSchema(bookings);

export const insertStorageRentalSchema = createInsertSchema(storageRentals).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectStorageRentalSchema = createSelectSchema(storageRentals);

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectOrderSchema = createSelectSchema(orders);

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ 
  id: true, 
  createdAt: true 
});
export const selectOrderItemSchema = createSelectSchema(orderItems);

export const insertReviewSchema = createInsertSchema(reviews).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectReviewSchema = createSelectSchema(reviews);

export const insertPaymentSchema = createInsertSchema(payments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectPaymentSchema = createSelectSchema(payments);

export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  createdAt: true 
});
export const selectNotificationSchema = createSelectSchema(notifications);

export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true, 
  createdAt: true 
});
export const selectMessageSchema = createSelectSchema(messages);

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectCartItemSchema = createSelectSchema(cartItems);
