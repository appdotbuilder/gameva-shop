
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, productsTable, addressesTable, ordersTable } from '../db/schema';
import { type UpdateOrderStatusInput } from '../schema';
import { updateOrderStatus } from '../handlers/update_order_status';
import { eq } from 'drizzle-orm';

describe('updateOrderStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update order status', async () => {
    // Create prerequisite data
    const [user] = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      })
      .returning()
      .execute();

    const [address] = await db.insert(addressesTable)
      .values({
        user_id: user.id,
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'USA',
        is_default: true
      })
      .returning()
      .execute();

    const [order] = await db.insert(ordersTable)
      .values({
        user_id: user.id,
        status: 'pending',
        total_amount: '99.99',
        shipping_address_id: address.id
      })
      .returning()
      .execute();

    const testInput: UpdateOrderStatusInput = {
      id: order.id,
      status: 'shipped'
    };

    const result = await updateOrderStatus(testInput);

    // Verify updated fields
    expect(result.id).toEqual(order.id);
    expect(result.status).toEqual('shipped');
    expect(result.user_id).toEqual(user.id);
    expect(result.total_amount).toEqual(99.99);
    expect(result.shipping_address_id).toEqual(address.id);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated status to database', async () => {
    // Create prerequisite data
    const [user] = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      })
      .returning()
      .execute();

    const [address] = await db.insert(addressesTable)
      .values({
        user_id: user.id,
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'USA',
        is_default: true
      })
      .returning()
      .execute();

    const [order] = await db.insert(ordersTable)
      .values({
        user_id: user.id,
        status: 'pending',
        total_amount: '149.99',
        shipping_address_id: address.id
      })
      .returning()
      .execute();

    const testInput: UpdateOrderStatusInput = {
      id: order.id,
      status: 'delivered'
    };

    const result = await updateOrderStatus(testInput);

    // Verify database was updated
    const orders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, result.id))
      .execute();

    expect(orders).toHaveLength(1);
    expect(orders[0].status).toEqual('delivered');
    expect(orders[0].updated_at).toBeInstanceOf(Date);
    expect(orders[0].updated_at.getTime()).toBeGreaterThan(orders[0].created_at.getTime());
  });

  it('should handle all valid status transitions', async () => {
    // Create prerequisite data
    const [user] = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      })
      .returning()
      .execute();

    const [address] = await db.insert(addressesTable)
      .values({
        user_id: user.id,
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'USA',
        is_default: true
      })
      .returning()
      .execute();

    const [order] = await db.insert(ordersTable)
      .values({
        user_id: user.id,
        status: 'pending',
        total_amount: '199.99',
        shipping_address_id: address.id
      })
      .returning()
      .execute();

    const statuses = ['confirmed', 'shipped', 'delivered', 'cancelled'] as const;

    for (const status of statuses) {
      const testInput: UpdateOrderStatusInput = {
        id: order.id,
        status: status
      };

      const result = await updateOrderStatus(testInput);
      expect(result.status).toEqual(status);
    }
  });

  it('should throw error for non-existent order', async () => {
    const testInput: UpdateOrderStatusInput = {
      id: 999999,
      status: 'shipped'
    };

    await expect(updateOrderStatus(testInput)).rejects.toThrow(/order.*not found/i);
  });
});
