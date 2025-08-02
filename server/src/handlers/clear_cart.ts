
import { db } from '../db';
import { cartItemsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function clearCart(userId: number): Promise<boolean> {
  try {
    // Delete all cart items for the user
    const result = await db.delete(cartItemsTable)
      .where(eq(cartItemsTable.user_id, userId))
      .execute();

    // Return true to indicate successful clearing
    return true;
  } catch (error) {
    console.error('Cart clearing failed:', error);
    throw error;
  }
}
