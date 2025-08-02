
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { createProduct } from '../handlers/create_product';
import { eq } from 'drizzle-orm';

describe('createProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let categoryId: number;

  beforeEach(async () => {
    // Create a test category first since products require a valid category_id
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A category for testing'
      })
      .returning()
      .execute();
    
    categoryId = categoryResult[0].id;
  });

  const testInput: CreateProductInput = {
    name: 'Test Product',
    description: 'A product for testing',
    price: 19.99,
    stock_quantity: 100,
    category_id: 0, // Will be set to categoryId in tests
    images: ['image1.jpg', 'image2.jpg'],
    featured: true
  };

  it('should create a product with valid input', async () => {
    const input = { ...testInput, category_id: categoryId };
    const result = await createProduct(input);

    // Basic field validation
    expect(result.name).toEqual('Test Product');
    expect(result.description).toEqual('A product for testing');
    expect(result.price).toEqual(19.99);
    expect(typeof result.price).toBe('number');
    expect(result.stock_quantity).toEqual(100);
    expect(result.category_id).toEqual(categoryId);
    expect(result.images).toEqual(['image1.jpg', 'image2.jpg']);
    expect(result.featured).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save product to database correctly', async () => {
    const input = { ...testInput, category_id: categoryId };
    const result = await createProduct(input);

    // Query database to verify product was saved
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    const savedProduct = products[0];
    
    expect(savedProduct.name).toEqual('Test Product');
    expect(savedProduct.description).toEqual('A product for testing');
    expect(parseFloat(savedProduct.price)).toEqual(19.99);
    expect(savedProduct.stock_quantity).toEqual(100);
    expect(savedProduct.category_id).toEqual(categoryId);
    expect(savedProduct.images).toEqual(['image1.jpg', 'image2.jpg']);
    expect(savedProduct.featured).toEqual(true);
    expect(savedProduct.created_at).toBeInstanceOf(Date);
    expect(savedProduct.updated_at).toBeInstanceOf(Date);
  });

  it('should create product with default values', async () => {
    const minimalInput: CreateProductInput = {
      name: 'Minimal Product',
      description: null,
      price: 9.99,
      stock_quantity: 50,
      category_id: categoryId,
      images: [], // Include default value explicitly
      featured: false // Include default value explicitly
    };

    const result = await createProduct(minimalInput);

    expect(result.name).toEqual('Minimal Product');
    expect(result.description).toBeNull();
    expect(result.price).toEqual(9.99);
    expect(result.stock_quantity).toEqual(50);
    expect(result.category_id).toEqual(categoryId);
    expect(result.images).toEqual([]);
    expect(result.featured).toEqual(false);
    expect(result.id).toBeDefined();
  });
});
