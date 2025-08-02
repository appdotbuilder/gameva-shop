
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, ordersTable, addressesTable } from '../db/schema';
import { getUserOrders } from '../handlers/get_user_orders';

describe('getUserOrders', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when user has no orders', async () => {
    // Create a user
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

    const result = await getUserOrders(userResult[0].id);

    expect(result).toEqual([]);
  });

  it('should return user orders in descending order by created_at', async () => {
    // Create a user
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

    // Create an address
    const addressResult = await db.insert(addressesTable)
      .values({
        user_id: userId,
        street: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zip_code: '12345',
        country: 'Test Country',
        is_default: true
      })
      .returning()
      .execute();

    const addressId = addressResult[0].id;

    // Create multiple orders with different timestamps
    const order1 = await db.insert(ordersTable)
      .values({
        user_id: userId,
        status: 'pending',
        total_amount: '99.99',
        shipping_address_id: addressId
      })
      .returning()
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const order2 = await db.insert(ordersTable)
      .values({
        user_id: userId,
        status: 'confirmed',
        total_amount: '149.99',
        shipping_address_id: addressId
      })
      .returning()
      .execute();

    const result = await getUserOrders(userId);

    expect(result).toHaveLength(2);
    
    // Verify orders are in descending order (newest first)
    expect(result[0].id).toEqual(order2[0].id);
    expect(result[1].id).toEqual(order1[0].id);
    
    // Verify numeric conversion
    expect(typeof result[0].total_amount).toBe('number');
    expect(result[0].total_amount).toEqual(149.99);
    expect(typeof result[1].total_amount).toBe('number');
    expect(result[1].total_amount).toEqual(99.99);
    
    // Verify all required fields are present
    expect(result[0].user_id).toEqual(userId);
    expect(result[0].status).toEqual('confirmed');
    expect(result[0].shipping_address_id).toEqual(addressId);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should only return orders for the specified user', async () => {
    // Create two users
    const user1Result = await db.insert(usersTable)
      .values({
        email: 'user1@example.com',
        password_hash: 'hashedpassword',
        first_name: 'User',
        last_name: 'One',
        role: 'customer'
      })
      .returning()
      .execute();

    const user2Result = await db.insert(usersTable)
      .values({
        email: 'user2@example.com',
        password_hash: 'hashedpassword',
        first_name: 'User',
        last_name: 'Two',
        role: 'customer'
      })
      .returning()
      .execute();

    const user1Id = user1Result[0].id;
    const user2Id = user2Result[0].id;

    // Create addresses for both users
    const address1Result = await db.insert(addressesTable)
      .values({
        user_id: user1Id,
        street: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zip_code: '12345',
        country: 'Test Country',
        is_default: true
      })
      .returning()
      .execute();

    const address2Result = await db.insert(addressesTable)
      .values({
        user_id: user2Id,
        street: '456 Oak Ave',
        city: 'Test City',
        state: 'Test State',
        zip_code: '67890',
        country: 'Test Country',
        is_default: true
      })
      .returning()
      .execute();

    // Create orders for both users
    await db.insert(ordersTable)
      .values({
        user_id: user1Id,
        status: 'pending',
        total_amount: '99.99',
        shipping_address_id: address1Result[0].id
      })
      .execute();

    await db.insert(ordersTable)
      .values({
        user_id: user2Id,
        status: 'confirmed',
        total_amount: '149.99',
        shipping_address_id: address2Result[0].id
      })
      .execute();

    const result = await getUserOrders(user1Id);

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toEqual(user1Id);
    expect(result[0].total_amount).toEqual(99.99);
    expect(result[0].status).toEqual('pending');
  });
});
