
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type UpdateProductInput, type CreateCategoryInput } from '../schema';
import { updateProduct } from '../handlers/update_product';
import { eq } from 'drizzle-orm';

describe('updateProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let categoryId: number;
  let productId: number;

  beforeEach(async () => {
    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        description: 'A category for testing'
      })
      .returning()
      .execute();
    
    categoryId = categoryResult[0].id;

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Original Product',
        description: 'Original description',
        price: '19.99',
        stock_quantity: 100,
        category_id: categoryId,
        images: ['image1.jpg'],
        featured: false
      })
      .returning()
      .execute();
    
    productId = productResult[0].id;
  });

  it('should update product name', async () => {
    const updateInput: UpdateProductInput = {
      id: productId,
      name: 'Updated Product Name'
    };

    const result = await updateProduct(updateInput);

    expect(result.id).toEqual(productId);
    expect(result.name).toEqual('Updated Product Name');
    expect(result.description).toEqual('Original description'); // Unchanged
    expect(result.price).toEqual(19.99);
    expect(result.stock_quantity).toEqual(100);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update multiple fields', async () => {
    const updateInput: UpdateProductInput = {
      id: productId,
      name: 'Multi Update Product',
      description: 'Updated description',
      price: 29.99,
      stock_quantity: 50,
      featured: true,
      images: ['new1.jpg', 'new2.jpg']
    };

    const result = await updateProduct(updateInput);

    expect(result.name).toEqual('Multi Update Product');
    expect(result.description).toEqual('Updated description');
    expect(result.price).toEqual(29.99);
    expect(result.stock_quantity).toEqual(50);
    expect(result.featured).toEqual(true);
    expect(result.images).toEqual(['new1.jpg', 'new2.jpg']);
    expect(result.category_id).toEqual(categoryId); // Unchanged
  });

  it('should update product in database', async () => {
    const updateInput: UpdateProductInput = {
      id: productId,
      name: 'Database Update Test',
      price: 39.99
    };

    await updateProduct(updateInput);

    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .execute();

    expect(products).toHaveLength(1);
    expect(products[0].name).toEqual('Database Update Test');
    expect(parseFloat(products[0].price)).toEqual(39.99);
    expect(products[0].description).toEqual('Original description'); // Unchanged
    expect(products[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null description update', async () => {
    const updateInput: UpdateProductInput = {
      id: productId,
      description: null
    };

    const result = await updateProduct(updateInput);

    expect(result.description).toBeNull();
    expect(result.name).toEqual('Original Product'); // Unchanged
  });

  it('should update category_id', async () => {
    // Create another category
    const newCategoryResult = await db.insert(categoriesTable)
      .values({
        name: 'New Category',
        description: 'Another category'
      })
      .returning()
      .execute();
    
    const newCategoryId = newCategoryResult[0].id;

    const updateInput: UpdateProductInput = {
      id: productId,
      category_id: newCategoryId
    };

    const result = await updateProduct(updateInput);

    expect(result.category_id).toEqual(newCategoryId);
    expect(result.name).toEqual('Original Product'); // Unchanged
  });

  it('should throw error for non-existent product', async () => {
    const updateInput: UpdateProductInput = {
      id: 99999,
      name: 'Non-existent Product'
    };

    expect(updateProduct(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should update only provided fields and leave others unchanged', async () => {
    const updateInput: UpdateProductInput = {
      id: productId,
      stock_quantity: 75
    };

    const result = await updateProduct(updateInput);

    // Only stock_quantity should change
    expect(result.stock_quantity).toEqual(75);
    expect(result.name).toEqual('Original Product');
    expect(result.description).toEqual('Original description');
    expect(result.price).toEqual(19.99);
    expect(result.category_id).toEqual(categoryId);
    expect(result.images).toEqual(['image1.jpg']);
    expect(result.featured).toEqual(false);
  });

  it('should verify price is returned as number type', async () => {
    const updateInput: UpdateProductInput = {
      id: productId,
      price: 45.67
    };

    const result = await updateProduct(updateInput);

    expect(typeof result.price).toEqual('number');
    expect(result.price).toEqual(45.67);
  });
});
