
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, productsTable, categoriesTable, cartItemsTable } from '../db/schema';
import { clearCart } from '../handlers/clear_cart';
import { eq } from 'drizzle-orm';

describe('clearCart', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should clear all cart items for a user', async () => {
    // Create test user
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

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A category for testing'
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create test products
    const productResult = await db.insert(productsTable)
      .values([
        {
          name: 'Product 1',
          description: 'First test product',
          price: '19.99',
          stock_quantity: 100,
          category_id: categoryId,
          images: [],
          featured: false
        },
        {
          name: 'Product 2',
          description: 'Second test product',
          price: '29.99',
          stock_quantity: 50,
          category_id: categoryId,
          images: [],
          featured: false
        }
      ])
      .returning()
      .execute();

    // Add items to cart
    await db.insert(cartItemsTable)
      .values([
        {
          user_id: userId,
          product_id: productResult[0].id,
          quantity: 2
        },
        {
          user_id: userId,
          product_id: productResult[1].id,
          quantity: 1
        }
      ])
      .execute();

    // Verify items exist in cart before clearing
    const cartItemsBefore = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.user_id, userId))
      .execute();
    expect(cartItemsBefore).toHaveLength(2);

    // Clear the cart
    const result = await clearCart(userId);

    // Verify result
    expect(result).toBe(true);

    // Verify cart is empty
    const cartItemsAfter = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.user_id, userId))
      .execute();
    expect(cartItemsAfter).toHaveLength(0);
  });

  it('should return true even when cart is already empty', async () => {
    // Create test user
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

    // Clear empty cart
    const result = await clearCart(userId);

    // Verify result
    expect(result).toBe(true);

    // Verify cart remains empty
    const cartItems = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.user_id, userId))
      .execute();
    expect(cartItems).toHaveLength(0);
  });

  it('should only clear items for the specified user', async () => {
    // Create two test users
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

    // Create test category and product
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A category for testing'
      })
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        description: 'A test product',
        price: '19.99',
        stock_quantity: 100,
        category_id: categoryResult[0].id,
        images: [],
        featured: false
      })
      .returning()
      .execute();

    // Add items to both users' carts
    await db.insert(cartItemsTable)
      .values([
        {
          user_id: user1Id,
          product_id: productResult[0].id,
          quantity: 2
        },
        {
          user_id: user2Id,
          product_id: productResult[0].id,
          quantity: 3
        }
      ])
      .execute();

    // Clear user1's cart
    const result = await clearCart(user1Id);
    expect(result).toBe(true);

    // Verify user1's cart is empty
    const user1CartItems = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.user_id, user1Id))
      .execute();
    expect(user1CartItems).toHaveLength(0);

    // Verify user2's cart is unchanged
    const user2CartItems = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.user_id, user2Id))
      .execute();
    expect(user2CartItems).toHaveLength(1);
    expect(user2CartItems[0].quantity).toBe(3);
  });
});
