
import { db } from '../db';
import { cartItemsTable, productsTable, usersTable } from '../db/schema';
import { type AddToCartInput, type CartItem } from '../schema';
import { eq, and } from 'drizzle-orm';

export const addToCart = async (input: AddToCartInput): Promise<CartItem> => {
  try {
    // Verify user exists
    const user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (user.length === 0) {
      throw new Error('User not found');
    }

    // Verify product exists
    const product = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, input.product_id))
      .execute();

    if (product.length === 0) {
      throw new Error('Product not found');
    }

    // Check if item already exists in cart
    const existingItem = await db.select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.user_id, input.user_id),
          eq(cartItemsTable.product_id, input.product_id)
        )
      )
      .execute();

    if (existingItem.length > 0) {
      // Update existing cart item quantity
      const updatedQuantity = existingItem[0].quantity + input.quantity;
      
      const result = await db.update(cartItemsTable)
        .set({ quantity: updatedQuantity })
        .where(eq(cartItemsTable.id, existingItem[0].id))
        .returning()
        .execute();

      return result[0];
    } else {
      // Insert new cart item
      const result = await db.insert(cartItemsTable)
        .values({
          user_id: input.user_id,
          product_id: input.product_id,
          quantity: input.quantity
        })
        .returning()
        .execute();

      return result[0];
    }
  } catch (error) {
    console.error('Add to cart failed:', error);
    throw error;
  }
};
