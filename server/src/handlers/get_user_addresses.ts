
import { db } from '../db';
import { addressesTable } from '../db/schema';
import { type Address } from '../schema';
import { eq } from 'drizzle-orm';

export async function getUserAddresses(userId: number): Promise<Address[]> {
  try {
    const results = await db.select()
      .from(addressesTable)
      .where(eq(addressesTable.user_id, userId))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch user addresses:', error);
    throw error;
  }
}
