
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, productsTable, cartItemsTable } from '../db/schema';
import { getCartItems } from '../handlers/get_cart_items';

describe('getCartItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when user has no cart items', async () => {
    // Create a user but no cart items
    const [user] = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      })
      .returning()
      .execute();

    const result = await getCartItems(user.id);

    expect(result).toEqual([]);
  });

  it('should return cart items for specific user', async () => {
    // Create prerequisite data
    const [user] = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      })
      .returning()
      .execute();

    const [category] = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A test category'
      })
      .returning()
      .execute();

    const [product] = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        description: 'A test product',
        price: '19.99',
        stock_quantity: 100,
        category_id: category.id
      })
      .returning()
      .execute();

    const [cartItem] = await db.insert(cartItemsTable)
      .values({
        user_id: user.id,
        product_id: product.id,
        quantity: 2
      })
      .returning()
      .execute();

    const result = await getCartItems(user.id);

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(cartItem.id);
    expect(result[0].user_id).toEqual(user.id);
    expect(result[0].product_id).toEqual(product.id);
    expect(result[0].quantity).toEqual(2);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should only return cart items for specified user', async () => {
    // Create two users
    const [user1] = await db.insert(usersTable)
      .values({
        email: 'user1@example.com',
        password_hash: 'hashedpassword',
        first_name: 'User',
        last_name: 'One',
        role: 'customer'
      })
      .returning()
      .execute();

    const [user2] = await db.insert(usersTable)
      .values({
        email: 'user2@example.com',
        password_hash: 'hashedpassword',
        first_name: 'User',
        last_name: 'Two',
        role: 'customer'
      })
      .returning()
      .execute();

    // Create prerequisite data
    const [category] = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A test category'
      })
      .returning()
      .execute();

    const [product] = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        description: 'A test product',
        price: '19.99',
        stock_quantity: 100,
        category_id: category.id
      })
      .returning()
      .execute();

    // Create cart items for both users
    await db.insert(cartItemsTable)
      .values([
        {
          user_id: user1.id,
          product_id: product.id,
          quantity: 1
        },
        {
          user_id: user2.id,
          product_id: product.id,
          quantity: 3
        }
      ])
      .execute();

    const user1CartItems = await getCartItems(user1.id);
    const user2CartItems = await getCartItems(user2.id);

    expect(user1CartItems).toHaveLength(1);
    expect(user1CartItems[0].user_id).toEqual(user1.id);
    expect(user1CartItems[0].quantity).toEqual(1);

    expect(user2CartItems).toHaveLength(1);
    expect(user2CartItems[0].user_id).toEqual(user2.id);
    expect(user2CartItems[0].quantity).toEqual(3);
  });

  it('should handle multiple cart items for same user', async () => {
    // Create prerequisite data
    const [user] = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      })
      .returning()
      .execute();

    const [category] = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A test category'
      })
      .returning()
      .execute();

    const [product1, product2] = await db.insert(productsTable)
      .values([
        {
          name: 'Product 1',
          description: 'First product',
          price: '19.99',
          stock_quantity: 100,
          category_id: category.id
        },
        {
          name: 'Product 2',
          description: 'Second product',
          price: '29.99',
          stock_quantity: 50,
          category_id: category.id
        }
      ])
      .returning()
      .execute();

    await db.insert(cartItemsTable)
      .values([
        {
          user_id: user.id,
          product_id: product1.id,
          quantity: 2
        },
        {
          user_id: user.id,
          product_id: product2.id,
          quantity: 1
        }
      ])
      .execute();

    const result = await getCartItems(user.id);

    expect(result).toHaveLength(2);
    expect(result.every(item => item.user_id === user.id)).toBe(true);
    
    const productIds = result.map(item => item.product_id);
    expect(productIds).toContain(product1.id);
    expect(productIds).toContain(product2.id);
  });
});
