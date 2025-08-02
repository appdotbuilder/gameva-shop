
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { deleteProduct } from '../handlers/delete_product';
import { eq } from 'drizzle-orm';

describe('deleteProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing product', async () => {
    // Create a category first (required for foreign key)
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A category for testing'
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create a product to delete
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        description: 'A product for testing deletion',
        price: '19.99',
        stock_quantity: 10,
        category_id: categoryId,
        images: [],
        featured: false
      })
      .returning()
      .execute();

    const productId = productResult[0].id;

    // Delete the product
    const result = await deleteProduct(productId);

    // Verify deletion was successful
    expect(result).toBe(true);

    // Verify product no longer exists in database
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .execute();

    expect(products).toHaveLength(0);
  });

  it('should return false when product does not exist', async () => {
    const nonExistentId = 99999;

    const result = await deleteProduct(nonExistentId);

    expect(result).toBe(false);
  });

  it('should not affect other products when deleting one', async () => {
    // Create a category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A category for testing'
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create two products
    const product1Result = await db.insert(productsTable)
      .values({
        name: 'Product 1',
        description: 'First product',
        price: '10.00',
        stock_quantity: 5,
        category_id: categoryId,
        images: [],
        featured: false
      })
      .returning()
      .execute();

    const product2Result = await db.insert(productsTable)
      .values({
        name: 'Product 2',
        description: 'Second product',
        price: '20.00',
        stock_quantity: 8,
        category_id: categoryId,
        images: [],
        featured: true
      })
      .returning()
      .execute();

    const product1Id = product1Result[0].id;
    const product2Id = product2Result[0].id;

    // Delete first product
    const result = await deleteProduct(product1Id);

    expect(result).toBe(true);

    // Verify first product is deleted
    const deletedProducts = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, product1Id))
      .execute();

    expect(deletedProducts).toHaveLength(0);

    // Verify second product still exists
    const remainingProducts = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, product2Id))
      .execute();

    expect(remainingProducts).toHaveLength(1);
    expect(remainingProducts[0].name).toEqual('Product 2');
  });
});
