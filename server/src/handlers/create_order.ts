
import { db } from '../db';
import { ordersTable, orderItemsTable } from '../db/schema';
import { type CreateOrderInput, type Order } from '../schema';

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  try {
    // Calculate total amount from items
    const totalAmount = input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Insert order record
    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: input.user_id,
        shipping_address_id: input.shipping_address_id,
        total_amount: totalAmount.toString(), // Convert number to string for numeric column
        status: 'pending' // Default status
      })
      .returning()
      .execute();

    const order = orderResult[0];

    // Insert order items
    if (input.items.length > 0) {
      await db.insert(orderItemsTable)
        .values(
          input.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price.toString() // Convert number to string for numeric column
          }))
        )
        .execute();
    }

    // Return order with numeric conversions
    return {
      ...order,
      total_amount: parseFloat(order.total_amount) // Convert string back to number
    };
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};
