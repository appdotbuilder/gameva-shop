
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, addressesTable, ordersTable } from '../db/schema';
import { getOrders } from '../handlers/get_orders';

describe('getOrders', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no orders exist', async () => {
    const result = await getOrders();
    expect(result).toEqual([]);
  });

  it('should fetch all orders', async () => {
    // Create test user first
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test address
    const addressResult = await db.insert(addressesTable)
      .values({
        user_id: userId,
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip_code: '12345',
        country: 'Test Country',
        is_default: true
      })
      .returning()
      .execute();

    const addressId = addressResult[0].id;

    // Create test orders individually to ensure different timestamps
    const firstOrder = await db.insert(ordersTable)
      .values({
        user_id: userId,
        status: 'pending',
        total_amount: '99.99',
        shipping_address_id: addressId
      })
      .returning()
      .execute();

    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondOrder = await db.insert(ordersTable)
      .values({
        user_id: userId,
        status: 'confirmed',
        total_amount: '149.50',
        shipping_address_id: addressId
      })
      .returning()
      .execute();

    const result = await getOrders();

    expect(result).toHaveLength(2);
    
    // Find orders by ID since ordering might vary with same timestamps
    const pendingOrder = result.find(order => order.id === firstOrder[0].id);
    const confirmedOrder = result.find(order => order.id === secondOrder[0].id);

    // Verify pending order
    expect(pendingOrder).toBeDefined();
    expect(pendingOrder!.user_id).toEqual(userId);
    expect(pendingOrder!.status).toEqual('pending');
    expect(pendingOrder!.total_amount).toEqual(99.99);
    expect(typeof pendingOrder!.total_amount).toEqual('number');
    expect(pendingOrder!.shipping_address_id).toEqual(addressId);
    expect(pendingOrder!.created_at).toBeInstanceOf(Date);
    expect(pendingOrder!.updated_at).toBeInstanceOf(Date);

    // Verify confirmed order
    expect(confirmedOrder).toBeDefined();
    expect(confirmedOrder!.user_id).toEqual(userId);
    expect(confirmedOrder!.status).toEqual('confirmed');
    expect(confirmedOrder!.total_amount).toEqual(149.50);
    expect(typeof confirmedOrder!.total_amount).toEqual('number');
    expect(confirmedOrder!.shipping_address_id).toEqual(addressId);
    expect(confirmedOrder!.created_at).toBeInstanceOf(Date);
    expect(confirmedOrder!.updated_at).toBeInstanceOf(Date);
  });

  it('should return orders in descending order by created_at', async () => {
    // Create test user and address
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    const addressResult = await db.insert(addressesTable)
      .values({
        user_id: userId,
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip_code: '12345',
        country: 'Test Country',
        is_default: true
      })
      .returning()
      .execute();

    const addressId = addressResult[0].id;

    // Create orders with delay to ensure different timestamps
    const firstOrder = await db.insert(ordersTable)
      .values({
        user_id: userId,
        status: 'pending',
        total_amount: '50.00',
        shipping_address_id: addressId
      })
      .returning()
      .execute();

    // Ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondOrder = await db.insert(ordersTable)
      .values({
        user_id: userId,
        status: 'confirmed',
        total_amount: '75.00',
        shipping_address_id: addressId
      })
      .returning()
      .execute();

    const result = await getOrders();

    expect(result).toHaveLength(2);
    // Most recent order should be first
    expect(result[0].id).toEqual(secondOrder[0].id);
    expect(result[1].id).toEqual(firstOrder[0].id);
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });
});
