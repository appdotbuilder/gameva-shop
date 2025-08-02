
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { getCategories } from '../handlers/get_categories';

describe('getCategories', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no categories exist', async () => {
    const result = await getCategories();
    expect(result).toEqual([]);
  });

  it('should return all categories', async () => {
    // Create test categories
    await db.insert(categoriesTable)
      .values([
        {
          name: 'Electronics',
          description: 'Electronic devices and gadgets'
        },
        {
          name: 'Books',
          description: 'Books and literature'
        },
        {
          name: 'Clothing',
          description: null
        }
      ])
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(3);
    
    // Verify categories are returned with correct structure
    const electronics = result.find(cat => cat.name === 'Electronics');
    expect(electronics).toBeDefined();
    expect(electronics!.id).toBeDefined();
    expect(electronics!.description).toEqual('Electronic devices and gadgets');
    expect(electronics!.created_at).toBeInstanceOf(Date);

    const books = result.find(cat => cat.name === 'Books');
    expect(books).toBeDefined();
    expect(books!.description).toEqual('Books and literature');

    const clothing = result.find(cat => cat.name === 'Clothing');
    expect(clothing).toBeDefined();
    expect(clothing!.description).toBeNull();
  });

  it('should return categories ordered by id', async () => {
    // Create categories in specific order
    const categoryData = [
      { name: 'Category A', description: 'First category' },
      { name: 'Category B', description: 'Second category' },
      { name: 'Category C', description: 'Third category' }
    ];

    await db.insert(categoriesTable)
      .values(categoryData)
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(3);
    // Verify they are in order by id (which should be sequential)
    expect(result[0].id).toBeLessThan(result[1].id);
    expect(result[1].id).toBeLessThan(result[2].id);
    expect(result[0].name).toEqual('Category A');
    expect(result[1].name).toEqual('Category B');
    expect(result[2].name).toEqual('Category C');
  });
});
