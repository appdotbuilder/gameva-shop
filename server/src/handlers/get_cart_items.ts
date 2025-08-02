
import { db } from '../db';
import { cartItemsTable, productsTable } from '../db/schema';
import { type CartItem } from '../schema';
import { eq } from 'drizzle-orm';

export async function getCartItems(userId: number): Promise<CartItem[]> {
  try {
    // Query cart items with product details joined
    const results = await db.select()
      .from(cartItemsTable)
      .innerJoin(productsTable, eq(cartItemsTable.product_id, productsTable.id))
      .where(eq(cartItemsTable.user_id, userId))
      .execute();

    // Map results to CartItem format
    return results.map(result => ({
      id: result.cart_items.id,
      user_id: result.cart_items.user_id,
      product_id: result.cart_items.product_id,
      quantity: result.cart_items.quantity,
      created_at: result.cart_items.created_at
    }));
  } catch (error) {
    console.error('Failed to get cart items:', error);
    throw error;
  }
}
