
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, productsTable, categoriesTable, cartItemsTable } from '../db/schema';
import { removeFromCart } from '../handlers/remove_from_cart';
import { eq } from 'drizzle-orm';

describe('removeFromCart', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should remove an existing cart item', async () => {
    // Create prerequisite data
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'Test category description'
      })
      .returning()
      .execute();

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

    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        description: 'Test product description',
        price: '19.99',
        stock_quantity: 100,
        category_id: categoryResult[0].id,
        images: [],
        featured: false
      })
      .returning()
      .execute();

    // Create cart item
    const cartItemResult = await db.insert(cartItemsTable)
      .values({
        user_id: userResult[0].id,
        product_id: productResult[0].id,
        quantity: 2
      })
      .returning()
      .execute();

    const cartItemId = cartItemResult[0].id;

    // Remove the cart item
    const result = await removeFromCart(cartItemId);

    // Verify removal was successful
    expect(result).toBe(true);

    // Verify item no longer exists in database
    const cartItems = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.id, cartItemId))
      .execute();

    expect(cartItems).toHaveLength(0);
  });

  it('should return false when cart item does not exist', async () => {
    const nonExistentId = 99999;

    const result = await removeFromCart(nonExistentId);

    expect(result).toBe(false);
  });

  it('should not affect other cart items when removing one', async () => {
    // Create prerequisite data
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'Test category description'
      })
      .returning()
      .execute();

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

    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        description: 'Test product description',
        price: '19.99',
        stock_quantity: 100,
        category_id: categoryResult[0].id,
        images: [],
        featured: false
      })
      .returning()
      .execute();

    // Create multiple cart items
    const cartItem1Result = await db.insert(cartItemsTable)
      .values({
        user_id: userResult[0].id,
        product_id: productResult[0].id,
        quantity: 1
      })
      .returning()
      .execute();

    const cartItem2Result = await db.insert(cartItemsTable)
      .values({
        user_id: userResult[0].id,
        product_id: productResult[0].id,
        quantity: 3
      })
      .returning()
      .execute();

    // Remove first cart item
    const result = await removeFromCart(cartItem1Result[0].id);

    expect(result).toBe(true);

    // Verify first item is removed
    const removedItems = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.id, cartItem1Result[0].id))
      .execute();

    expect(removedItems).toHaveLength(0);

    // Verify second item still exists
    const remainingItems = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.id, cartItem2Result[0].id))
      .execute();

    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].quantity).toBe(3);
  });

  it('should handle multiple removal operations correctly', async () => {
    // Create prerequisite data
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'Test category description'
      })
      .returning()
      .execute();

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

    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        description: 'Test product description',
        price: '19.99',
        stock_quantity: 100,
        category_id: categoryResult[0].id,
        images: [],
        featured: false
      })
      .returning()
      .execute();

    // Create cart item
    const cartItemResult = await db.insert(cartItemsTable)
      .values({
        user_id: userResult[0].id,
        product_id: productResult[0].id,
        quantity: 1
      })
      .returning()
      .execute();

    const cartItemId = cartItemResult[0].id;

    // Remove the cart item first time
    const firstResult = await removeFromCart(cartItemId);
    expect(firstResult).toBe(true);

    // Try to remove the same cart item again
    const secondResult = await removeFromCart(cartItemId);
    expect(secondResult).toBe(false);

    // Verify no items exist
    const cartItems = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.id, cartItemId))
      .execute();

    expect(cartItems).toHaveLength(0);
  });
});
