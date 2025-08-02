
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateUserInput = {
  email: 'test@example.com',
  password: 'testpassword123',
  first_name: 'John',
  last_name: 'Doe',
  role: 'customer'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user with correct basic fields', async () => {
    const result = await createUser(testInput);

    // Basic field validation
    expect(result.email).toEqual('test@example.com');
    expect(result.first_name).toEqual('John');
    expect(result.last_name).toEqual('Doe');
    expect(result.role).toEqual('customer');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should hash the password correctly', async () => {
    const result = await createUser(testInput);

    // Password should be hashed, not plain text
    expect(result.password_hash).not.toEqual('testpassword123');
    expect(result.password_hash).toBeDefined();
    expect(result.password_hash.length).toBeGreaterThan(0);

    // Verify the hash can be validated against original password
    const isValidPassword = await Bun.password.verify('testpassword123', result.password_hash);
    expect(isValidPassword).toBe(true);

    // Verify wrong password fails validation
    const isWrongPassword = await Bun.password.verify('wrongpassword', result.password_hash);
    expect(isWrongPassword).toBe(false);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    // Query database to verify user was saved
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].first_name).toEqual('John');
    expect(users[0].last_name).toEqual('Doe');
    expect(users[0].role).toEqual('customer');
    expect(users[0].created_at).toBeInstanceOf(Date);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should use default role when not specified', async () => {
    const inputWithoutRole = {
      email: 'test2@example.com',
      password: 'testpassword123',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'customer' as const // Zod default is applied before handler
    };

    const result = await createUser(inputWithoutRole);

    expect(result.role).toEqual('customer');
  });

  it('should create admin user when role specified', async () => {
    const adminInput: CreateUserInput = {
      email: 'admin@example.com',
      password: 'adminpassword123',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin'
    };

    const result = await createUser(adminInput);

    expect(result.role).toEqual('admin');
  });

  it('should handle unique email constraint', async () => {
    // Create first user
    await createUser(testInput);

    // Try to create second user with same email
    const duplicateInput: CreateUserInput = {
      email: 'test@example.com', // Same email
      password: 'differentpassword',
      first_name: 'Different',
      last_name: 'Person',
      role: 'customer'
    };

    // Should throw error due to unique constraint
    await expect(createUser(duplicateInput)).rejects.toThrow();
  });
});
