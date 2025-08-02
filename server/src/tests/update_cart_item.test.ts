
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, productsTable, categoriesTable, cartItemsTable } from '../db/schema';
import { type UpdateCartItemInput } from '../schema';
import { updateCartItem } from '../handlers/update_cart_item';
import { eq } from 'drizzle-orm';

describe('updateCartItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update cart item quantity', async () => {
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

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A category for testing'
      })
      .returning()
      .execute();

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        description: 'A product for testing',
        price: '19.99',
        stock_quantity: 100,
        category_id: categoryResult[0].id,
        images: [],
        featured: false
      })
      .returning()
      .execute();

    // Create test cart item
    const cartItemResult = await db.insert(cartItemsTable)
      .values({
        user_id: userResult[0].id,
        product_id: productResult[0].id,
        quantity: 2
      })
      .returning()
      .execute();

    const testInput: UpdateCartItemInput = {
      id: cartItemResult[0].id,
      quantity: 5
    };

    const result = await updateCartItem(testInput);

    // Verify updated fields
    expect(result.id).toEqual(cartItemResult[0].id);
    expect(result.quantity).toEqual(5);
    expect(result.user_id).toEqual(userResult[0].id);
    expect(result.product_id).toEqual(productResult[0].id);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated quantity to database', async () => {
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

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A category for testing'
      })
      .returning()
      .execute();

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        description: 'A product for testing',
        price: '19.99',
        stock_quantity: 100,
        category_id: categoryResult[0].id,
        images: [],
        featured: false
      })
      .returning()
      .execute();

    // Create test cart item
    const cartItemResult = await db.insert(cartItemsTable)
      .values({
        user_id: userResult[0].id,
        product_id: productResult[0].id,
        quantity: 2
      })
      .returning()
      .execute();

    const testInput: UpdateCartItemInput = {
      id: cartItemResult[0].id,
      quantity: 3
    };

    await updateCartItem(testInput);

    // Verify database was updated
    const updatedCartItems = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.id, cartItemResult[0].id))
      .execute();

    expect(updatedCartItems).toHaveLength(1);
    expect(updatedCartItems[0].quantity).toEqual(3);
    expect(updatedCartItems[0].user_id).toEqual(userResult[0].id);
    expect(updatedCartItems[0].product_id).toEqual(productResult[0].id);
  });

  it('should throw error when cart item does not exist', async () => {
    const testInput: UpdateCartItemInput = {
      id: 999, // Non-existent cart item ID
      quantity: 5
    };

    await expect(updateCartItem(testInput)).rejects.toThrow(/cart item not found/i);
  });

  it('should update quantity to 1', async () => {
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

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A category for testing'
      })
      .returning()
      .execute();

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        description: 'A product for testing',
        price: '19.99',
        stock_quantity: 100,
        category_id: categoryResult[0].id,
        images: [],
        featured: false
      })
      .returning()
      .execute();

    // Create test cart item with quantity 10
    const cartItemResult = await db.insert(cartItemsTable)
      .values({
        user_id: userResult[0].id,
        product_id: productResult[0].id,
        quantity: 10
      })
      .returning()
      .execute();

    const testInput: UpdateCartItemInput = {
      id: cartItemResult[0].id,
      quantity: 1
    };

    const result = await updateCartItem(testInput);

    expect(result.quantity).toEqual(1);

    // Verify in database
    const updatedCartItems = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.id, cartItemResult[0].id))
      .execute();

    expect(updatedCartItems[0].quantity).toEqual(1);
  });
});
