
import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password_hash: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.enum(['customer', 'admin']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string(),
  last_name: z.string(),
  role: z.enum(['customer', 'admin']).default('customer')
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Category schemas
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;

export const createCategoryInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable()
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

// Product schemas
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  stock_quantity: z.number().int(),
  category_id: z.number(),
  images: z.array(z.string()),
  featured: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

export const createProductInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  price: z.number().positive(),
  stock_quantity: z.number().int().nonnegative(),
  category_id: z.number(),
  images: z.array(z.string()).default([]),
  featured: z.boolean().default(false)
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const updateProductInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive().optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
  category_id: z.number().optional(),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional()
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

export const getProductsInputSchema = z.object({
  category_id: z.number().optional(),
  search: z.string().optional(),
  featured: z.boolean().optional(),
  limit: z.number().default(20),
  offset: z.number().default(0)
});

export type GetProductsInput = z.infer<typeof getProductsInputSchema>;

// Cart schemas
export const cartItemSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  product_id: z.number(),
  quantity: z.number().int().positive(),
  created_at: z.coerce.date()
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const addToCartInputSchema = z.object({
  user_id: z.number(),
  product_id: z.number(),
  quantity: z.number().int().positive()
});

export type AddToCartInput = z.infer<typeof addToCartInputSchema>;

export const updateCartItemInputSchema = z.object({
  id: z.number(),
  quantity: z.number().int().positive()
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemInputSchema>;

// Address schemas
export const addressSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip_code: z.string(),
  country: z.string(),
  is_default: z.boolean(),
  created_at: z.coerce.date()
});

export type Address = z.infer<typeof addressSchema>;

export const createAddressInputSchema = z.object({
  user_id: z.number(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip_code: z.string(),
  country: z.string(),
  is_default: z.boolean().default(false)
});

export type CreateAddressInput = z.infer<typeof createAddressInputSchema>;

// Order schemas
export const orderSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  total_amount: z.number(),
  shipping_address_id: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Order = z.infer<typeof orderSchema>;

export const orderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  product_id: z.number(),
  quantity: z.number().int().positive(),
  price: z.number(),
  created_at: z.coerce.date()
});

export type OrderItem = z.infer<typeof orderItemSchema>;

export const createOrderInputSchema = z.object({
  user_id: z.number(),
  shipping_address_id: z.number(),
  items: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().int().positive(),
    price: z.number()
  }))
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export const updateOrderStatusInputSchema = z.object({
  id: z.number(),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusInputSchema>;

// Dashboard metrics schema
export const dashboardMetricsSchema = z.object({
  total_sales: z.number(),
  total_orders: z.number(),
  new_orders_today: z.number(),
  total_customers: z.number(),
  low_stock_products: z.number(),
  top_selling_products: z.array(z.object({
    product_id: z.number(),
    product_name: z.string(),
    total_sold: z.number()
  }))
});

export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
