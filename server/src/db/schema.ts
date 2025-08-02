
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'admin']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  role: userRoleEnum('role').notNull().default('customer'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Categories table
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Products table
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock_quantity: integer('stock_quantity').notNull(),
  category_id: integer('category_id').notNull(),
  images: text('images').array().notNull().default([]),
  featured: boolean('featured').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Cart items table
export const cartItemsTable = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  product_id: integer('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Addresses table
export const addressesTable = pgTable('addresses', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  street: text('street').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zip_code: text('zip_code').notNull(),
  country: text('country').notNull(),
  is_default: boolean('is_default').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Orders table
export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  shipping_address_id: integer('shipping_address_id').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Order items table
export const orderItemsTable = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: integer('order_id').notNull(),
  product_id: integer('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  cartItems: many(cartItemsTable),
  addresses: many(addressesTable),
  orders: many(ordersTable)
}));

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  products: many(productsTable)
}));

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [productsTable.category_id],
    references: [categoriesTable.id]
  }),
  cartItems: many(cartItemsTable),
  orderItems: many(orderItemsTable)
}));

export const cartItemsRelations = relations(cartItemsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [cartItemsTable.user_id],
    references: [usersTable.id]
  }),
  product: one(productsTable, {
    fields: [cartItemsTable.product_id],
    references: [productsTable.id]
  })
}));

export const addressesRelations = relations(addressesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [addressesTable.user_id],
    references: [usersTable.id]
  })
}));

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [ordersTable.user_id],
    references: [usersTable.id]
  }),
  shippingAddress: one(addressesTable, {
    fields: [ordersTable.shipping_address_id],
    references: [addressesTable.id]
  }),
  orderItems: many(orderItemsTable)
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.order_id],
    references: [ordersTable.id]
  }),
  product: one(productsTable, {
    fields: [orderItemsTable.product_id],
    references: [productsTable.id]
  })
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  categories: categoriesTable,
  products: productsTable,
  cartItems: cartItemsTable,
  addresses: addressesTable,
  orders: ordersTable,
  orderItems: orderItemsTable
};
