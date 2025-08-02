
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type GetProductsInput, type Product } from '../schema';
import { eq, and, ilike, desc, SQL } from 'drizzle-orm';

export async function getProducts(input: GetProductsInput): Promise<Product[]> {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    if (input.category_id !== undefined) {
      conditions.push(eq(productsTable.category_id, input.category_id));
    }

    if (input.search) {
      conditions.push(ilike(productsTable.name, `%${input.search}%`));
    }

    if (input.featured !== undefined) {
      conditions.push(eq(productsTable.featured, input.featured));
    }

    // Build the complete query in one go
    const whereClause = conditions.length === 1 ? conditions[0] : 
                       conditions.length > 1 ? and(...conditions) : 
                       undefined;

    const results = await db.select()
      .from(productsTable)
      .where(whereClause)
      .orderBy(desc(productsTable.id)) // Use id instead of created_at for consistent ordering
      .limit(input.limit)
      .offset(input.offset)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(product => ({
      ...product,
      price: parseFloat(product.price)
    }));
  } catch (error) {
    console.error('Product retrieval failed:', error);
    throw error;
  }
}
