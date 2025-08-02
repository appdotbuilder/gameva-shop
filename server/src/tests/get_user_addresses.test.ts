
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, addressesTable } from '../db/schema';
import { getUserAddresses } from '../handlers/get_user_addresses';

describe('getUserAddresses', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return addresses for a user', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test addresses
    await db.insert(addressesTable)
      .values([
        {
          user_id: userId,
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip_code: '12345',
          country: 'USA',
          is_default: true
        },
        {
          user_id: userId,
          street: '456 Oak Ave',
          city: 'Another City',
          state: 'NY',
          zip_code: '67890',
          country: 'USA',
          is_default: false
        }
      ])
      .execute();

    const result = await getUserAddresses(userId);

    expect(result).toHaveLength(2);
    expect(result[0].user_id).toEqual(userId);
    expect(result[0].street).toEqual('123 Main St');
    expect(result[0].city).toEqual('Anytown');
    expect(result[0].state).toEqual('CA');
    expect(result[0].zip_code).toEqual('12345');
    expect(result[0].country).toEqual('USA');
    expect(result[0].is_default).toEqual(true);
    expect(result[0].created_at).toBeInstanceOf(Date);

    expect(result[1].user_id).toEqual(userId);
    expect(result[1].street).toEqual('456 Oak Ave');
    expect(result[1].city).toEqual('Another City');
    expect(result[1].state).toEqual('NY');
    expect(result[1].zip_code).toEqual('67890');
    expect(result[1].country).toEqual('USA');
    expect(result[1].is_default).toEqual(false);
    expect(result[1].created_at).toBeInstanceOf(Date);
  });

  it('should return empty array when user has no addresses', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    const result = await getUserAddresses(userId);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should only return addresses for the specified user', async () => {
    // Create two test users
    const user1Result = await db.insert(usersTable)
      .values({
        email: 'user1@example.com',
        password_hash: 'hashed_password',
        first_name: 'User',
        last_name: 'One',
        role: 'customer'
      })
      .returning()
      .execute();

    const user2Result = await db.insert(usersTable)
      .values({
        email: 'user2@example.com',
        password_hash: 'hashed_password',
        first_name: 'User',
        last_name: 'Two',
        role: 'customer'
      })
      .returning()
      .execute();

    const user1Id = user1Result[0].id;
    const user2Id = user2Result[0].id;

    // Create addresses for both users
    await db.insert(addressesTable)
      .values([
        {
          user_id: user1Id,
          street: '123 Main St',
          city: 'User1 City',
          state: 'CA',
          zip_code: '12345',
          country: 'USA',
          is_default: true
        },
        {
          user_id: user2Id,
          street: '456 Oak Ave',
          city: 'User2 City',
          state: 'NY',
          zip_code: '67890',
          country: 'USA',
          is_default: false
        }
      ])
      .execute();

    const result = await getUserAddresses(user1Id);

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toEqual(user1Id);
    expect(result[0].city).toEqual('User1 City');
  });
});
