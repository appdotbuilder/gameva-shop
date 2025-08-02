
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { addressesTable, usersTable } from '../db/schema';
import { type CreateAddressInput } from '../schema';
import { createAddress } from '../handlers/create_address';
import { eq } from 'drizzle-orm';

// Test user for foreign key dependency
const testUser = {
  email: 'test@example.com',
  password_hash: 'hashedpassword123',
  first_name: 'John',
  last_name: 'Doe',
  role: 'customer' as const
};

// Test input for address creation
const testInput: CreateAddressInput = {
  user_id: 1, // Will be set after user creation
  street: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip_code: '12345',
  country: 'USA',
  is_default: false
};

describe('createAddress', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an address', async () => {
    // Create user first for foreign key dependency
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = userResult[0].id;
    const addressInput = { ...testInput, user_id: userId };

    const result = await createAddress(addressInput);

    // Basic field validation
    expect(result.user_id).toEqual(userId);
    expect(result.street).toEqual('123 Main St');
    expect(result.city).toEqual('Springfield');
    expect(result.state).toEqual('IL');
    expect(result.zip_code).toEqual('12345');
    expect(result.country).toEqual('USA');
    expect(result.is_default).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save address to database', async () => {
    // Create user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = userResult[0].id;
    const addressInput = { ...testInput, user_id: userId };

    const result = await createAddress(addressInput);

    // Query database to verify address was saved
    const addresses = await db.select()
      .from(addressesTable)
      .where(eq(addressesTable.id, result.id))
      .execute();

    expect(addresses).toHaveLength(1);
    expect(addresses[0].user_id).toEqual(userId);
    expect(addresses[0].street).toEqual('123 Main St');
    expect(addresses[0].city).toEqual('Springfield');
    expect(addresses[0].state).toEqual('IL');
    expect(addresses[0].zip_code).toEqual('12345');
    expect(addresses[0].country).toEqual('USA');
    expect(addresses[0].is_default).toEqual(false);
    expect(addresses[0].created_at).toBeInstanceOf(Date);
  });

  it('should create address with default flag set to true', async () => {
    // Create user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = userResult[0].id;
    const addressInput = { ...testInput, user_id: userId, is_default: true };

    const result = await createAddress(addressInput);

    expect(result.is_default).toEqual(true);

    // Verify in database
    const addresses = await db.select()
      .from(addressesTable)
      .where(eq(addressesTable.id, result.id))
      .execute();

    expect(addresses[0].is_default).toEqual(true);
  });

  it('should throw error when user does not exist', async () => {
    const addressInput = { ...testInput, user_id: 999 }; // Non-existent user

    await expect(createAddress(addressInput)).rejects.toThrow(/User with id 999 does not exist/i);
  });
});
