
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, addressesTable, categoriesTable, productsTable, ordersTable, orderItemsTable } from '../db/schema';
import { type CreateOrderInput, type CreateUserInput, type CreateAddressInput, type CreateCategoryInput, type CreateProductInput } from '../schema';
import { createOrder } from '../handlers/create_order';
import { eq } from 'drizzle-orm';

// Test data
const testUser: CreateUserInput = {
  email: 'test@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe',
  role: 'customer'
};

const testAddress: CreateAddressInput = {
  user_id: 1, // Will be set after user creation
  street: '123 Main St',
  city: 'Test City',
  state: 'Test State',
  zip_code: '12345',
  country: 'Test Country',
  is_default: true
};

const testCategory: CreateCategoryInput = {
  name: 'Test Category',
  description: 'A category for testing'
};

const testProduct: CreateProductInput = {
  name: 'Test Product',
  description: 'A product for testing',
  price: 29.99,
  stock_quantity: 100,
  category_id: 1, // Will be set after category creation
  images: ['image1.jpg'],
  featured: false
};

describe('createOrder', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an order with order items', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        ...testUser,
        password_hash: 'hashed_password'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    const addressResult = await db.insert(addressesTable)
      .values({
        ...testAddress,
        user_id: userId
      })
      .returning()
      .execute();
    const addressId = addressResult[0].id;

    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    const productResult = await db.insert(productsTable)
      .values({
        ...testProduct,
        category_id: categoryId,
        price: testProduct.price.toString()
      })
      .returning()
      .execute();
    const productId = productResult[0].id;

    // Test input
    const orderInput: CreateOrderInput = {
      user_id: userId,
      shipping_address_id: addressId,
      items: [
        {
          product_id: productId,
          quantity: 2,
          price: 29.99
        },
        {
          product_id: productId,
          quantity: 1,
          price: 29.99
        }
      ]
    };

    const result = await createOrder(orderInput);

    // Basic field validation
    expect(result.user_id).toEqual(userId);
    expect(result.shipping_address_id).toEqual(addressId);
    expect(result.status).toEqual('pending');
    expect(result.total_amount).toEqual(89.97); // 2 * 29.99 + 1 * 29.99
    expect(typeof result.total_amount).toEqual('number');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save order and order items to database', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        ...testUser,
        password_hash: 'hashed_password'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    const addressResult = await db.insert(addressesTable)
      .values({
        ...testAddress,
        user_id: userId
      })
      .returning()
      .execute();
    const addressId = addressResult[0].id;

    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    const productResult = await db.insert(productsTable)
      .values({
        ...testProduct,
        category_id: categoryId,
        price: testProduct.price.toString()
      })
      .returning()
      .execute();
    const productId = productResult[0].id;

    const orderInput: CreateOrderInput = {
      user_id: userId,
      shipping_address_id: addressId,
      items: [
        {
          product_id: productId,
          quantity: 3,
          price: 19.99
        }
      ]
    };

    const result = await createOrder(orderInput);

    // Verify order in database
    const orders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, result.id))
      .execute();

    expect(orders).toHaveLength(1);
    expect(orders[0].user_id).toEqual(userId);
    expect(orders[0].shipping_address_id).toEqual(addressId);
    expect(orders[0].status).toEqual('pending');
    expect(parseFloat(orders[0].total_amount)).toEqual(59.97); // 3 * 19.99
    expect(orders[0].created_at).toBeInstanceOf(Date);

    // Verify order items in database
    const orderItems = await db.select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.order_id, result.id))
      .execute();

    expect(orderItems).toHaveLength(1);
    expect(orderItems[0].product_id).toEqual(productId);
    expect(orderItems[0].quantity).toEqual(3);
    expect(parseFloat(orderItems[0].price)).toEqual(19.99);
    expect(orderItems[0].created_at).toBeInstanceOf(Date);
  });

  it('should create order with multiple items', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        ...testUser,
        password_hash: 'hashed_password'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    const addressResult = await db.insert(addressesTable)
      .values({
        ...testAddress,
        user_id: userId
      })
      .returning()
      .execute();
    const addressId = addressResult[0].id;

    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    const product1Result = await db.insert(productsTable)
      .values({
        ...testProduct,
        name: 'Product 1',
        category_id: categoryId,
        price: '15.50'
      })
      .returning()
      .execute();
    const product1Id = product1Result[0].id;

    const product2Result = await db.insert(productsTable)
      .values({
        ...testProduct,
        name: 'Product 2',
        category_id: categoryId,
        price: '25.00'
      })
      .returning()
      .execute();
    const product2Id = product2Result[0].id;

    const orderInput: CreateOrderInput = {
      user_id: userId,
      shipping_address_id: addressId,
      items: [
        {
          product_id: product1Id,
          quantity: 2,
          price: 15.50
        },
        {
          product_id: product2Id,
          quantity: 1,
          price: 25.00
        }
      ]
    };

    const result = await createOrder(orderInput);

    // Verify total calculation: 2 * 15.50 + 1 * 25.00 = 56.00
    expect(result.total_amount).toEqual(56.00);

    // Verify order items in database
    const orderItems = await db.select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.order_id, result.id))
      .execute();

    expect(orderItems).toHaveLength(2);
    
    // Sort by product_id for consistent testing
    orderItems.sort((a, b) => a.product_id - b.product_id);
    
    expect(orderItems[0].product_id).toEqual(product1Id);
    expect(orderItems[0].quantity).toEqual(2);
    expect(parseFloat(orderItems[0].price)).toEqual(15.50);
    
    expect(orderItems[1].product_id).toEqual(product2Id);
    expect(orderItems[1].quantity).toEqual(1);
    expect(parseFloat(orderItems[1].price)).toEqual(25.00);
  });

  it('should create order with empty items array', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        ...testUser,
        password_hash: 'hashed_password'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    const addressResult = await db.insert(addressesTable)
      .values({
        ...testAddress,
        user_id: userId
      })
      .returning()
      .execute();
    const addressId = addressResult[0].id;

    const orderInput: CreateOrderInput = {
      user_id: userId,
      shipping_address_id: addressId,
      items: []
    };

    const result = await createOrder(orderInput);

    expect(result.total_amount).toEqual(0);

    // Verify no order items created
    const orderItems = await db.select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.order_id, result.id))
      .execute();

    expect(orderItems).toHaveLength(0);
  });
});
