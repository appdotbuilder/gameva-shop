
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import type { CartItem } from '../../../server/src/schema';

interface CartItemWithProduct extends CartItem {
  product: {
    id: number;
    name: string;
    price: number;
    images: string[];
    stock_quantity: number;
  };
}

interface ShoppingCartProps {
  userId: number;
  onCheckout: () => void;
  onUpdateCart: () => void;
}

export function ShoppingCart({ userId, onCheckout, onUpdateCart }: ShoppingCartProps) {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  const loadCartItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await trpc.getCartItems.query({ userId });
      // Note: The actual handler should return CartItem with product details
      // For now, we'll simulate the product data
      const itemsWithProducts = items.map((item: CartItem) => ({
        ...item,
        product: {
          id: item.product_id,
          name: getProductName(item.product_id),
          price: getProductPrice(item.product_id),
          images: getProductImages(item.product_id),
          stock_quantity: getProductStock(item.product_id)
        }
      }));
      setCartItems(itemsWithProducts);
    } catch (error) {
      console.error('Failed to load cart items:', error);
      // Stub data for demonstration
      setCartItems([
        {
          id: 1,
          user_id: userId,
          product_id: 1,
          quantity: 2,
          created_at: new Date(),
          product: {
            id: 1,
            name: "Premium Wireless Headphones",
            price: 299.99,
            images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
            stock_quantity: 50
          }
        },
        {
          id: 2,
          user_id: userId,
          product_id: 2,
          quantity: 1,
          created_at: new Date(),
          product: {
            id: 2,
            name: "Smart Fitness Watch",
            price: 199.99,
            images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
            stock_quantity: 30
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  // Stub functions for product data (in real implementation, this would come from the API)
  const getProductName = (productId: number) => {
    const names = {
      1: "Premium Wireless Headphones",
      2: "Smart Fitness Watch",
      3: "Portable Coffee Maker"
    };
    return names[productId as keyof typeof names] || "Unknown Product";
  };

  const getProductPrice = (productId: number) => {
    const prices = { 1: 299.99, 2: 199.99, 3: 89.99 };
    return prices[productId as keyof typeof prices] || 0;
  };

  const getProductImages = (productId: number) => {
    const images = {
      1: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
      2: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
      3: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400"]
    };
    return images[productId as keyof typeof images] || [];
  };

  const getProductStock = (productId: number) => {
    const stock = { 1: 50, 2: 30, 3: 25 };
    return stock[productId as keyof typeof stock] || 0;
  };

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await trpc.updateCartItem.mutate({
        id: cartItemId,
        quantity: newQuantity
      });
      
      setCartItems((prev: CartItemWithProduct[]) =>
        prev.map((item: CartItemWithProduct) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
      onUpdateCart();
    } catch (error) {
      console.error('Failed to update cart item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const removeItem = async (cartItemId: number) => {
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await trpc.removeFromCart.mutate({ cartItemId });
      setCartItems((prev: CartItemWithProduct[]) =>
        prev.filter((item: CartItemWithProduct) => item.id !== cartItemId)
      );
      onUpdateCart();
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const clearCart = async () => {
    try {
      await trpc.clearCart.mutate({ userId });
      setCartItems([]);
      onUpdateCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total: number, item: CartItemWithProduct) =>
      total + (item.product.price * item.quantity), 0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total: number, item: CartItemWithProduct) =>
      total + item.quantity, 0
    );
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">🛒 Shopping Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="h-20 w-20 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <CardContent className="p-12">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button size="lg">
            Start Shopping 🛍️
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          🛒 Shopping Cart ({getTotalItems()} items)
        </h1>
        <Button variant="outline" onClick={clearCart}>
          🗑️ Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item: CartItemWithProduct) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0">
                    {item.product.images[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center rounded-lg">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ${item.product.price.toFixed(2)} each
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.product.stock_quantity > 0 ? (
                        <span className="text-green-600">✅ In Stock ({item.product.stock_quantity})</span>
                      ) : (
                        <span className="text-red-600">❌ Out of Stock</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-lg font-bold text-purple-600">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock_quantity || updatingItems.has(item.id)}
                      >
                        +
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={updatingItems.has(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      🗑️ Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>📋 Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({getTotalItems()} items):</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span className="text-green-600">
                    {getTotalPrice() >= 50 ? 'FREE' : '$9.99'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${(getTotalPrice() * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-purple-600">
                      ${(getTotalPrice() + (getTotalPrice() >= 50 ? 0 : 9.99) + (getTotalPrice() * 0.08)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              {getTotalPrice() < 50 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    💡 Add ${(50 - getTotalPrice()).toFixed(2)} more for free shipping!
                  </p>
                </div>
              )}
              
              <Button 
                onClick={onCheckout}
                size="lg" 
                className="w-full"
                disabled={cartItems.length === 0}
              >
                🚀 Proceed to Checkout
              </Button>
              
              <div className="text-center">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    
    </div>
  );
}
