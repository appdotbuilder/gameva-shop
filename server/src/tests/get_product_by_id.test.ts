
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { getProductById } from '../handlers/get_product_by_id';

describe('getProductById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return product when found', async () => {
    // Create category first
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
        images: ['image1.jpg', 'image2.jpg'],
        featured: true
      })
      .returning()
      .execute();

    const product = await getProductById(productResult[0].id);

    expect(product).not.toBeNull();
    expect(product!.id).toEqual(productResult[0].id);
    expect(product!.name).toEqual('Test Product');
    expect(product!.description).toEqual('A product for testing');
    expect(product!.price).toEqual(19.99);
    expect(typeof product!.price).toEqual('number');
    expect(product!.stock_quantity).toEqual(100);
    expect(product!.category_id).toEqual(categoryResult[0].id);
    expect(product!.images).toEqual(['image1.jpg', 'image2.jpg']);
    expect(product!.featured).toEqual(true);
    expect(product!.created_at).toBeInstanceOf(Date);
    expect(product!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when product not found', async () => {
    const product = await getProductById(999);
    expect(product).toBeNull();
  });

  it('should handle numeric price conversion correctly', async () => {
    // Create category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: null
      })
      .returning()
      .execute();

    // Create product with decimal price
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Decimal Price Product',
        description: null,
        price: '29.95',
        stock_quantity: 50,
        category_id: categoryResult[0].id,
        images: [],
        featured: false
      })
      .returning()
      .execute();

    const product = await getProductById(productResult[0].id);

    expect(product).not.toBeNull();
    expect(product!.price).toEqual(29.95);
    expect(typeof product!.price).toEqual('number');
  });
});
