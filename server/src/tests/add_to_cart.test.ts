
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { cartItemsTable, usersTable, productsTable, categoriesTable } from '../db/schema';
import { type AddToCartInput } from '../schema';
import { addToCart } from '../handlers/add_to_cart';
import { eq, and } from 'drizzle-orm';

describe('addToCart', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId: number;
  let testProductId: number;

  beforeEach(async () => {
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
    testUserId = userResult[0].id;

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A test category'
      })
      .returning()
      .execute();

    // Create test product
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
    testProductId = productResult[0].id;
  });

  const testInput: AddToCartInput = {
    user_id: 0, // Will be set in tests
    product_id: 0, // Will be set in tests
    quantity: 2
  };

  it('should add new item to cart', async () => {
    const input = {
      ...testInput,
      user_id: testUserId,
      product_id: testProductId
    };

    const result = await addToCart(input);

    expect(result.user_id).toEqual(testUserId);
    expect(result.product_id).toEqual(testProductId);
    expect(result.quantity).toEqual(2);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save cart item to database', async () => {
    const input = {
      ...testInput,
      user_id: testUserId,
      product_id: testProductId
    };

    const result = await addToCart(input);

    const cartItems = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.id, result.id))
      .execute();

    expect(cartItems).toHaveLength(1);
    expect(cartItems[0].user_id).toEqual(testUserId);
    expect(cartItems[0].product_id).toEqual(testProductId);
    expect(cartItems[0].quantity).toEqual(2);
  });

  it('should update quantity when item already exists in cart', async () => {
    const input = {
      ...testInput,
      user_id: testUserId,
      product_id: testProductId,
      quantity: 3
    };

    // First add
    await addToCart(input);

    // Second add - should update quantity
    const secondInput = { ...input, quantity: 2 };
    const result = await addToCart(secondInput);

    expect(result.quantity).toEqual(5); // 3 + 2

    // Verify only one item exists in cart
    const cartItems = await db.select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.user_id, testUserId),
          eq(cartItemsTable.product_id, testProductId)
        )
      )
      .execute();

    expect(cartItems).toHaveLength(1);
    expect(cartItems[0].quantity).toEqual(5);
  });

  it('should throw error for non-existent user', async () => {
    const input = {
      ...testInput,
      user_id: 99999,
      product_id: testProductId
    };

    expect(addToCart(input)).rejects.toThrow(/user not found/i);
  });

  it('should throw error for non-existent product', async () => {
    const input = {
      ...testInput,
      user_id: testUserId,
      product_id: 99999
    };

    expect(addToCart(input)).rejects.toThrow(/product not found/i);
  });

  it('should handle multiple different products for same user', async () => {
    // Create second product
    const secondProductResult = await db.insert(productsTable)
      .values({
        name: 'Second Product',
        description: 'Another test product',
        price: '29.99',
        stock_quantity: 50,
        category_id: testProductId, // Reuse category_id from first product setup
        images: [],
        featured: false
      })
      .returning()
      .execute();

    const firstInput = {
      ...testInput,
      user_id: testUserId,
      product_id: testProductId,
      quantity: 2
    };

    const secondInput = {
      ...testInput,
      user_id: testUserId,
      product_id: secondProductResult[0].id,
      quantity: 1
    };

    await addToCart(firstInput);
    await addToCart(secondInput);

    // Verify both items exist separately
    const cartItems = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.user_id, testUserId))
      .execute();

    expect(cartItems).toHaveLength(2);
    
    const firstItem = cartItems.find(item => item.product_id === testProductId);
    const secondItem = cartItems.find(item => item.product_id === secondProductResult[0].id);

    expect(firstItem?.quantity).toEqual(2);
    expect(secondItem?.quantity).toEqual(1);
  });
});
