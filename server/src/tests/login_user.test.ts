
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput } from '../schema';
import { loginUser } from '../handlers/login_user';

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  first_name: 'John',
  last_name: 'Doe',
  role: 'customer' as const
};

const testLoginInput: LoginInput = {
  email: 'test@example.com',
  password: 'testpassword123'
};

describe('loginUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should authenticate user with valid credentials', async () => {
    // Create user with hashed password using Bun's password hashing
    const passwordHash = await Bun.password.hash(testUser.password);
    await db.insert(usersTable)
      .values({
        email: testUser.email,
        password_hash: passwordHash,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        role: testUser.role
      })
      .execute();

    const result = await loginUser(testLoginInput);

    expect(result).not.toBeNull();
    expect(result!.email).toEqual(testUser.email);
    expect(result!.first_name).toEqual(testUser.first_name);
    expect(result!.last_name).toEqual(testUser.last_name);
    expect(result!.role).toEqual(testUser.role);
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.password_hash).toBeDefined();
  });

  it('should return null for invalid email', async () => {
    // Create user
    const passwordHash = await Bun.password.hash(testUser.password);
    await db.insert(usersTable)
      .values({
        email: testUser.email,
        password_hash: passwordHash,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        role: testUser.role
      })
      .execute();

    const invalidEmailInput: LoginInput = {
      email: 'nonexistent@example.com',
      password: 'testpassword123'
    };

    const result = await loginUser(invalidEmailInput);

    expect(result).toBeNull();
  });

  it('should return null for invalid password', async () => {
    // Create user
    const passwordHash = await Bun.password.hash(testUser.password);
    await db.insert(usersTable)
      .values({
        email: testUser.email,
        password_hash: passwordHash,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        role: testUser.role
      })
      .execute();

    const invalidPasswordInput: LoginInput = {
      email: testUser.email,
      password: 'wrongpassword'
    };

    const result = await loginUser(invalidPasswordInput);

    expect(result).toBeNull();
  });

  it('should authenticate admin user correctly', async () => {
    // Create admin user
    const adminUser = {
      ...testUser,
      email: 'admin@example.com',
      role: 'admin' as const
    };
    
    const passwordHash = await Bun.password.hash(adminUser.password);
    await db.insert(usersTable)
      .values({
        email: adminUser.email,
        password_hash: passwordHash,
        first_name: adminUser.first_name,
        last_name: adminUser.last_name,
        role: adminUser.role
      })
      .execute();

    const adminLoginInput: LoginInput = {
      email: adminUser.email,
      password: adminUser.password
    };

    const result = await loginUser(adminLoginInput);

    expect(result).not.toBeNull();
    expect(result!.email).toEqual(adminUser.email);
    expect(result!.role).toEqual('admin');
  });

  it('should return null when no users exist', async () => {
    const result = await loginUser(testLoginInput);

    expect(result).toBeNull();
  });
});
