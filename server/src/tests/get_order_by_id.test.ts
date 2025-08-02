
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, addressesTable, ordersTable, categoriesTable, productsTable, orderItemsTable } from '../db/schema';
import { getOrderById } from '../handlers/get_order_by_id';
import { eq } from 'drizzle-orm';

describe('getOrderById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return order by id', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer'
      })
      .returning()
      .execute();

    const addressResult = await db.insert(addressesTable)
      .values({
        user_id: userResult[0].id,
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'USA',
        is_default: true
      })
      .returning()
      .execute();

    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: userResult[0].id,
        status: 'pending',
        total_amount: '99.99',
        shipping_address_id: addressResult[0].id
      })
      .returning()
      .execute();

    const result = await getOrderById(orderResult[0].id);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(orderResult[0].id);
    expect(result!.user_id).toEqual(userResult[0].id);
    expect(result!.status).toEqual('pending');
    expect(result!.total_amount).toEqual(99.99);
    expect(typeof result!.total_amount).toBe('number');
    expect(result!.shipping_address_id).toEqual(addressResult[0].id);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent order', async () => {
    const result = await getOrderById(999);
    expect(result).toBeNull();
  });

  it('should handle orders with different statuses', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer'
      })
      .returning()
      .execute();

    const addressResult = await db.insert(addressesTable)
      .values({
        user_id: userResult[0].id,
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'USA',
        is_default: true
      })
      .returning()
      .execute();

    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: userResult[0].id,
        status: 'delivered',
        total_amount: '149.99',
        shipping_address_id: addressResult[0].id
      })
      .returning()
      .execute();

    const result = await getOrderById(orderResult[0].id);

    expect(result).toBeDefined();
    expect(result!.status).toEqual('delivered');
    expect(result!.total_amount).toEqual(149.99);
  });

  it('should verify order exists in database after creation', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer'
      })
      .returning()
      .execute();

    const addressResult = await db.insert(addressesTable)
      .values({
        user_id: userResult[0].id,
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'USA',
        is_default: true
      })
      .returning()
      .execute();

    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: userResult[0].id,
        status: 'confirmed',
        total_amount: '75.50',
        shipping_address_id: addressResult[0].id
      })
      .returning()
      .execute();

    // Verify order exists in database
    const dbOrder = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderResult[0].id))
      .execute();

    expect(dbOrder).toHaveLength(1);
    expect(dbOrder[0].status).toEqual('confirmed');

    // Test handler
    const result = await getOrderById(orderResult[0].id);
    expect(result).toBeDefined();
    expect(result!.id).toEqual(orderResult[0].id);
  });
});
