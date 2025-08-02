
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  loginInputSchema,
  createCategoryInputSchema,
  createProductInputSchema,
  updateProductInputSchema,
  getProductsInputSchema,
  addToCartInputSchema,
  updateCartItemInputSchema,
  createAddressInputSchema,
  createOrderInputSchema,
  updateOrderStatusInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { loginUser } from './handlers/login_user';
import { getUsers } from './handlers/get_users';
import { createCategory } from './handlers/create_category';
import { getCategories } from './handlers/get_categories';
import { createProduct } from './handlers/create_product';
import { getProducts } from './handlers/get_products';
import { getProductById } from './handlers/get_product_by_id';
import { updateProduct } from './handlers/update_product';
import { deleteProduct } from './handlers/delete_product';
import { getFeaturedProducts } from './handlers/get_featured_products';
import { addToCart } from './handlers/add_to_cart';
import { getCartItems } from './handlers/get_cart_items';
import { updateCartItem } from './handlers/update_cart_item';
import { removeFromCart } from './handlers/remove_from_cart';
import { clearCart } from './handlers/clear_cart';
import { createAddress } from './handlers/create_address';
import { getUserAddresses } from './handlers/get_user_addresses';
import { createOrder } from './handlers/create_order';
import { getOrders } from './handlers/get_orders';
import { getUserOrders } from './handlers/get_user_orders';
import { getOrderById } from './handlers/get_order_by_id';
import { updateOrderStatus } from './handlers/update_order_status';
import { getDashboardMetrics } from './handlers/get_dashboard_metrics';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  loginUser: publicProcedure
    .input(loginInputSchema)
    .mutation(({ input }) => loginUser(input)),
  getUsers: publicProcedure
    .query(() => getUsers()),

  // Category management
  createCategory: publicProcedure
    .input(createCategoryInputSchema)
    .mutation(({ input }) => createCategory(input)),
  getCategories: publicProcedure
    .query(() => getCategories()),

  // Product management
  createProduct: publicProcedure
    .input(createProductInputSchema)
    .mutation(({ input }) => createProduct(input)),
  getProducts: publicProcedure
    .input(getProductsInputSchema)
    .query(({ input }) => getProducts(input)),
  getProductById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getProductById(input.id)),
  updateProduct: publicProcedure
    .input(updateProductInputSchema)
    .mutation(({ input }) => updateProduct(input)),
  deleteProduct: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteProduct(input.id)),
  getFeaturedProducts: publicProcedure
    .query(() => getFeaturedProducts()),

  // Shopping cart
  addToCart: publicProcedure
    .input(addToCartInputSchema)
    .mutation(({ input }) => addToCart(input)),
  getCartItems: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getCartItems(input.userId)),
  updateCartItem: publicProcedure
    .input(updateCartItemInputSchema)
    .mutation(({ input }) => updateCartItem(input)),
  removeFromCart: publicProcedure
    .input(z.object({ cartItemId: z.number() }))
    .mutation(({ input }) => removeFromCart(input.cartItemId)),
  clearCart: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(({ input }) => clearCart(input.userId)),

  // Address management
  createAddress: publicProcedure
    .input(createAddressInputSchema)
    .mutation(({ input }) => createAddress(input)),
  getUserAddresses: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getUserAddresses(input.userId)),

  // Order management
  createOrder: publicProcedure
    .input(createOrderInputSchema)
    .mutation(({ input }) => createOrder(input)),
  getOrders: publicProcedure
    .query(() => getOrders()),
  getUserOrders: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getUserOrders(input.userId)),
  getOrderById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getOrderById(input.id)),
  updateOrderStatus: publicProcedure
    .input(updateOrderStatusInputSchema)
    .mutation(({ input }) => updateOrderStatus(input)),

  // Admin dashboard
  getDashboardMetrics: publicProcedure
    .query(() => getDashboardMetrics())
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC E-commerce server listening at port: ${port}`);
}

start();
