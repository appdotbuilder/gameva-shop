
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type GetProductsInput } from '../schema';
import { getProducts } from '../handlers/get_products';

describe('getProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no products exist', async () => {
    const input: GetProductsInput = {
      limit: 20,
      offset: 0
    };

    const result = await getProducts(input);

    expect(result).toEqual([]);
  });

  it('should return all products with default pagination', async () => {
    // Create category first
    const category = await db.insert(categoriesTable)
      .values({
        name: 'Electronics',
        description: 'Electronic products'
      })
      .returning()
      .execute();

    // Create products one by one to ensure different IDs
    const product1 = await db.insert(productsTable)
      .values({
        name: 'Product 1',
        description: 'First product',
        price: '19.99',
        stock_quantity: 10,
        category_id: category[0].id,
        images: ['image1.jpg'],
        featured: false
      })
      .returning()
      .execute();

    const product2 = await db.insert(productsTable)
      .values({
        name: 'Product 2',
        description: 'Second product',
        price: '29.99',
        stock_quantity: 20,
        category_id: category[0].id,
        images: ['image2.jpg'],
        featured: true
      })
      .returning()
      .execute();

    const input: GetProductsInput = {
      limit: 20,
      offset: 0
    };

    const result = await getProducts(input);

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('Product 2'); // Higher ID comes first (ordered by desc(id))
    expect(result[1].name).toEqual('Product 1');
    expect(typeof result[0].price).toBe('number');
    expect(result[0].price).toEqual(29.99);
    expect(result[1].price).toEqual(19.99);
  });

  it('should filter products by category_id', async () => {
    // Create categories
    const categories = await db.insert(categoriesTable)
      .values([
        { name: 'Electronics', description: 'Electronic products' },
        { name: 'Books', description: 'Book products' }
      ])
      .returning()
      .execute();

    // Create products in different categories
    await db.insert(productsTable)
      .values([
        {
          name: 'Laptop',
          description: 'Gaming laptop',
          price: '999.99',
          stock_quantity: 5,
          category_id: categories[0].id,
          images: [],
          featured: false
        },
        {
          name: 'Novel',
          description: 'Mystery novel',
          price: '12.99',
          stock_quantity: 50,
          category_id: categories[1].id,
          images: [],
          featured: false
        }
      ])
      .execute();

    const input: GetProductsInput = {
      category_id: categories[0].id,
      limit: 20,
      offset: 0
    };

    const result = await getProducts(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Laptop');
    expect(result[0].category_id).toEqual(categories[0].id);
  });

  it('should filter products by search term', async () => {
    // Create category
    const category = await db.insert(categoriesTable)
      .values({
        name: 'Electronics',
        description: 'Electronic products'
      })
      .returning()
      .execute();

    // Create test products
    await db.insert(productsTable)
      .values([
        {
          name: 'Gaming Laptop',
          description: 'High-performance laptop',
          price: '1299.99',
          stock_quantity: 3,
          category_id: category[0].id,
          images: [],
          featured: false
        },
        {
          name: 'Office Chair',
          description: 'Ergonomic chair',
          price: '199.99',
          stock_quantity: 15,
          category_id: category[0].id,
          images: [],
          featured: false
        }
      ])
      .execute();

    const input: GetProductsInput = {
      search: 'laptop',
      limit: 20,
      offset: 0
    };

    const result = await getProducts(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Gaming Laptop');
  });

  it('should filter products by featured status', async () => {
    // Create category
    const category = await db.insert(categoriesTable)
      .values({
        name: 'Electronics',
        description: 'Electronic products'
      })
      .returning()
      .execute();

    // Create test products
    await db.insert(productsTable)
      .values([
        {
          name: 'Featured Product',
          description: 'This is featured',
          price: '49.99',
          stock_quantity: 8,
          category_id: category[0].id,
          images: [],
          featured: true
        },
        {
          name: 'Regular Product',
          description: 'Not featured',
          price: '39.99',
          stock_quantity: 12,
          category_id: category[0].id,
          images: [],
          featured: false
        }
      ])
      .execute();

    const input: GetProductsInput = {
      featured: true,
      limit: 20,
      offset: 0
    };

    const result = await getProducts(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Featured Product');
    expect(result[0].featured).toBe(true);
  });

  it('should apply pagination correctly', async () => {
    // Create category
    const category = await db.insert(categoriesTable)
      .values({
        name: 'Electronics',
        description: 'Electronic products'
      })
      .returning()
      .execute();

    // Create 5 test products
    const products = Array.from({ length: 5 }, (_, i) => ({
      name: `Product ${i + 1}`,
      description: `Description ${i + 1}`,
      price: `${(i + 1) * 10}.99`,
      stock_quantity: 10,
      category_id: category[0].id,
      images: [],
      featured: false
    }));

    await db.insert(productsTable)
      .values(products)
      .execute();

    // Test first page
    const firstPageInput: GetProductsInput = {
      limit: 2,
      offset: 0
    };

    const firstPage = await getProducts(firstPageInput);

    expect(firstPage).toHaveLength(2);

    // Test second page
    const secondPageInput: GetProductsInput = {
      limit: 2,
      offset: 2
    };

    const secondPage = await getProducts(secondPageInput);

    expect(secondPage).toHaveLength(2);

    // Ensure different products on different pages
    expect(firstPage[0].id).not.toEqual(secondPage[0].id);
  });

  it('should combine multiple filters', async () => {
    // Create categories
    const categories = await db.insert(categoriesTable)
      .values([
        { name: 'Electronics', description: 'Electronic products' },
        { name: 'Books', description: 'Book products' }
      ])
      .returning()
      .execute();

    // Create test products
    await db.insert(productsTable)
      .values([
        {
          name: 'Gaming Laptop',
          description: 'High-performance gaming laptop',
          price: '1599.99',
          stock_quantity: 2,
          category_id: categories[0].id,
          images: [],
          featured: true
        },
        {
          name: 'Office Laptop',
          description: 'Business laptop',
          price: '899.99',
          stock_quantity: 5,
          category_id: categories[0].id,
          images: [],
          featured: false
        },
        {
          name: 'Gaming Guide',
          description: 'Guide to gaming',
          price: '24.99',
          stock_quantity: 20,
          category_id: categories[1].id,
          images: [],
          featured: true
        }
      ])
      .execute();

    const input: GetProductsInput = {
      category_id: categories[0].id,
      search: 'laptop',
      featured: true,
      limit: 20,
      offset: 0
    };

    const result = await getProducts(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Gaming Laptop');
    expect(result[0].category_id).toEqual(categories[0].id);
    expect(result[0].featured).toBe(true);
  });
});
