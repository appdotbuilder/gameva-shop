
import { db } from '../db';
import { addressesTable, usersTable } from '../db/schema';
import { type CreateAddressInput, type Address } from '../schema';
import { eq } from 'drizzle-orm';

export const createAddress = async (input: CreateAddressInput): Promise<Address> => {
  try {
    // Verify that the user exists to prevent foreign key constraint violations
    const userExists = await db.select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (userExists.length === 0) {
      throw new Error(`User with id ${input.user_id} does not exist`);
    }

    // Insert address record
    const result = await db.insert(addressesTable)
      .values({
        user_id: input.user_id,
        street: input.street,
        city: input.city,
        state: input.state,
        zip_code: input.zip_code,
        country: input.country,
        is_default: input.is_default
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Address creation failed:', error);
    throw error;
  }
};
