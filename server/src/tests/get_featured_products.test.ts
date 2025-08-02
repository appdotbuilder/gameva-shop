
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { getFeaturedProducts } from '../handlers/get_featured_products';

describe('getFeaturedProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no featured products exist', async () => {
    const result = await getFeaturedProducts();
    expect(result).toEqual([]);
  });

  it('should return only featured products', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'Test category description'
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create featured and non-featured products
    await db.insert(productsTable)
      .values([
        {
          name: 'Featured Product 1',
          description: 'First featured product',
          price: '29.99',
          stock_quantity: 50,
          category_id: categoryId,
          featured: true
        },
        {
          name: 'Regular Product',
          description: 'Non-featured product',
          price: '19.99',
          stock_quantity: 30,
          category_id: categoryId,
          featured: false
        },
        {
          name: 'Featured Product 2',
          description: 'Second featured product',
          price: '39.99',
          stock_quantity: 25,
          category_id: categoryId,
          featured: true
        }
      ])
      .execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(2);
    expect(result.every(product => product.featured === true)).toBe(true);
    
    // Check that products are properly returned
    const productNames = result.map(p => p.name);
    expect(productNames).toContain('Featured Product 1');
    expect(productNames).toContain('Featured Product 2');
    expect(productNames).not.toContain('Regular Product');
  });

  it('should return products with correct field types', async () => {
    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'Test category description'
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create a featured product
    await db.insert(productsTable)
      .values({
        name: 'Featured Product',
        description: 'A featured product',
        price: '49.99',
        stock_quantity: 100,
        category_id: categoryId,
        featured: true,
        images: ['image1.jpg', 'image2.jpg']
      })
      .execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(1);
    const product = result[0];

    // Verify field types and values
    expect(typeof product.id).toBe('number');
    expect(typeof product.name).toBe('string');
    expect(typeof product.price).toBe('number'); // Should be converted from string
    expect(typeof product.stock_quantity).toBe('number');
    expect(typeof product.category_id).toBe('number');
    expect(typeof product.featured).toBe('boolean');
    expect(Array.isArray(product.images)).toBe(true);
    expect(product.created_at).toBeInstanceOf(Date);
    expect(product.updated_at).toBeInstanceOf(Date);

    // Verify specific values
    expect(product.name).toEqual('Featured Product');
    expect(product.price).toEqual(49.99);
    expect(product.stock_quantity).toEqual(100);
    expect(product.featured).toBe(true);
    expect(product.images).toEqual(['image1.jpg', 'image2.jpg']);
  });

  it('should handle products with null descriptions', async () => {
    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: null
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create featured product with null description
    await db.insert(productsTable)
      .values({
        name: 'Featured Product',
        description: null,
        price: '25.00',
        stock_quantity: 75,
        category_id: categoryId,
        featured: true
      })
      .execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(1);
    expect(result[0].description).toBeNull();
    expect(result[0].name).toEqual('Featured Product');
    expect(result[0].price).toEqual(25.00);
  });
});
