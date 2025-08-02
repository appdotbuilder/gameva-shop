
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, productsTable, addressesTable, ordersTable, orderItemsTable } from '../db/schema';
import { getDashboardMetrics } from '../handlers/get_dashboard_metrics';

describe('getDashboardMetrics', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero metrics for empty database', async () => {
    const result = await getDashboardMetrics();

    expect(result.total_sales).toEqual(0);
    expect(result.total_orders).toEqual(0);
    expect(result.new_orders_today).toEqual(0);
    expect(result.total_customers).toEqual(0);
    expect(result.low_stock_products).toEqual(0);
    expect(result.top_selling_products).toEqual([]);
  });

  it('should calculate correct metrics with sample data', async () => {
    // Create test data
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Electronics',
        description: 'Electronic products'
      })
      .returning()
      .execute();

    const customerResult = await db.insert(usersTable)
      .values({
        email: 'customer@test.com',
        password_hash: 'hash123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer'
      })
      .returning()
      .execute();

    const adminResult = await db.insert(usersTable)
      .values({
        email: 'admin@test.com',
        password_hash: 'hash456',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      })
      .returning()
      .execute();

    const product1Result = await db.insert(productsTable)
      .values({
        name: 'Laptop',
        description: 'Gaming laptop',
        price: '999.99',
        stock_quantity: 5, // Low stock
        category_id: categoryResult[0].id,
        images: [],
        featured: false
      })
      .returning()
      .execute();

    const product2Result = await db.insert(productsTable)
      .values({
        name: 'Mouse',
        description: 'Gaming mouse',
        price: '49.99',
        stock_quantity: 50, // Normal stock
        category_id: categoryResult[0].id,
        images: [],
        featured: false
      })
      .returning()
      .execute();

    const addressResult = await db.insert(addressesTable)
      .values({
        user_id: customerResult[0].id,
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'USA',
        is_default: true
      })
      .returning()
      .execute();

    // Create orders
    const order1Result = await db.insert(ordersTable)
      .values({
        user_id: customerResult[0].id,
        status: 'delivered',
        total_amount: '1049.98',
        shipping_address_id: addressResult[0].id
      })
      .returning()
      .execute();

    const order2Result = await db.insert(ordersTable)
      .values({
        user_id: customerResult[0].id,
        status: 'pending',
        total_amount: '49.99',
        shipping_address_id: addressResult[0].id
      })
      .returning()
      .execute();

    // Create order items
    await db.insert(orderItemsTable)
      .values([
        {
          order_id: order1Result[0].id,
          product_id: product1Result[0].id,
          quantity: 1,
          price: '999.99'
        },
        {
          order_id: order1Result[0].id,
          product_id: product2Result[0].id,
          quantity: 1,
          price: '49.99'
        },
        {
          order_id: order2Result[0].id,
          product_id: product2Result[0].id,
          quantity: 1,
          price: '49.99'
        }
      ])
      .execute();

    const result = await getDashboardMetrics();

    expect(result.total_sales).toEqual(1099.97);
    expect(result.total_orders).toEqual(2);
    expect(result.new_orders_today).toEqual(2); // Both orders created today
    expect(result.total_customers).toEqual(1); // Only customer role
    expect(result.low_stock_products).toEqual(1); // Laptop has stock <= 10
    expect(result.top_selling_products).toHaveLength(2);
    
    // Mouse should be top selling (2 units sold)
    expect(result.top_selling_products[0].product_name).toEqual('Mouse');
    expect(result.top_selling_products[0].total_sold).toEqual(2);
    expect(result.top_selling_products[1].product_name).toEqual('Laptop');
    expect(result.top_selling_products[1].total_sold).toEqual(1);
  });

  it('should handle date filtering for new orders today', async () => {
    // Create test user and address first
    const customerResult = await db.insert(usersTable)
      .values({
        email: 'customer@test.com',
        password_hash: 'hash123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer'
      })
      .returning()
      .execute();

    const addressResult = await db.insert(addressesTable)
      .values({
        user_id: customerResult[0].id,
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'USA',
        is_default: true
      })
      .returning()
      .execute();

    // Create an order with today's date
    await db.insert(ordersTable)
      .values({
        user_id: customerResult[0].id,
        status: 'pending',
        total_amount: '100.00',
        shipping_address_id: addressResult[0].id
      })
      .execute();

    const result = await getDashboardMetrics();

    expect(result.new_orders_today).toEqual(1);
    expect(result.total_orders).toEqual(1);
  });

  it('should return correct metric types', async () => {
    const result = await getDashboardMetrics();

    expect(typeof result.total_sales).toBe('number');
    expect(typeof result.total_orders).toBe('number');
    expect(typeof result.new_orders_today).toBe('number');
    expect(typeof result.total_customers).toBe('number');
    expect(typeof result.low_stock_products).toBe('number');
    expect(Array.isArray(result.top_selling_products)).toBe(true);
  });
});
