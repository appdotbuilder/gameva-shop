
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { getUsers } from '../handlers/get_users';

// Test user data
const testUsers: CreateUserInput[] = [
  {
    email: 'admin@example.com',
    password: 'password123',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin'
  },
  {
    email: 'customer1@example.com',
    password: 'password123',
    first_name: 'John',
    last_name: 'Doe',
    role: 'customer'
  },
  {
    email: 'customer2@example.com',
    password: 'password123',
    first_name: 'Jane',
    last_name: 'Smith',
    role: 'customer'
  }
];

describe('getUsers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no users exist', async () => {
    const result = await getUsers();
    expect(result).toEqual([]);
  });

  it('should return all users', async () => {
    // Create test users with simple password hash
    for (const user of testUsers) {
      const hashedPassword = `hashed_${user.password}`;
      await db.insert(usersTable)
        .values({
          email: user.email,
          password_hash: hashedPassword,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        })
        .execute();
    }

    const result = await getUsers();

    expect(result).toHaveLength(3);

    // Check admin user
    const adminUser = result.find(u => u.email === 'admin@example.com');
    expect(adminUser).toBeDefined();
    expect(adminUser!.first_name).toEqual('Admin');
    expect(adminUser!.last_name).toEqual('User');
    expect(adminUser!.role).toEqual('admin');
    expect(adminUser!.id).toBeDefined();
    expect(adminUser!.created_at).toBeInstanceOf(Date);
    expect(adminUser!.updated_at).toBeInstanceOf(Date);

    // Check customer users
    const customer1 = result.find(u => u.email === 'customer1@example.com');
    expect(customer1).toBeDefined();
    expect(customer1!.first_name).toEqual('John');
    expect(customer1!.last_name).toEqual('Doe');
    expect(customer1!.role).toEqual('customer');

    const customer2 = result.find(u => u.email === 'customer2@example.com');
    expect(customer2).toBeDefined();
    expect(customer2!.first_name).toEqual('Jane');
    expect(customer2!.last_name).toEqual('Smith');
    expect(customer2!.role).toEqual('customer');
  });

  it('should return users with all required fields', async () => {
    // Create single test user
    const hashedPassword = `hashed_${testUsers[0].password}`;
    await db.insert(usersTable)
      .values({
        email: testUsers[0].email,
        password_hash: hashedPassword,
        first_name: testUsers[0].first_name,
        last_name: testUsers[0].last_name,
        role: testUsers[0].role
      })
      .execute();

    const result = await getUsers();

    expect(result).toHaveLength(1);
    const user = result[0];

    // Verify all required fields are present
    expect(user.id).toBeDefined();
    expect(typeof user.id).toBe('number');
    expect(user.email).toEqual('admin@example.com');
    expect(user.password_hash).toBeDefined();
    expect(typeof user.password_hash).toBe('string');
    expect(user.first_name).toEqual('Admin');
    expect(user.last_name).toEqual('User');
    expect(user.role).toEqual('admin');
    expect(user.created_at).toBeInstanceOf(Date);
    expect(user.updated_at).toBeInstanceOf(Date);
  });
});
