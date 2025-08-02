
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/utils/trpc';
import type { Address, CreateAddressInput, CreateOrderInput, CartItem } from '../../../server/src/schema';

interface CartItemWithProduct extends CartItem {
  product?: {
    id: number;
    name: string;
    price: number;
    images?: string[];
  };
}

interface CheckoutProps {
  userId: number;
  onOrderComplete: () => void;
}

export function Checkout({ userId, onOrderComplete }: CheckoutProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isCreatingNewAddress, setIsCreatingNewAddress] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [newAddress, setNewAddress] = useState<CreateAddressInput>({
    user_id: userId,
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    is_default: false
  });

  const loadAddresses = useCallback(async () => {
    try {
      const result = await trpc.getUserAddresses.query({ userId });
      setAddresses(result);
      
      // Auto-select default address
      const defaultAddress = result.find((addr: Address) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id.toString());
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      // Stub data for demonstration
      const stubAddresses = [
        {
          id: 1,
          user_id: userId,
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zip_code: "10001",
          country: "United States",
          is_default: true,
          created_at: new Date()
        }
      ];
      setAddresses(stubAddresses);
      setSelectedAddressId('1');
    }
  }, [userId]);

  const loadCartItems = useCallback(async () => {
    try {
      const items = await trpc.getCartItems.query({ userId });
      setCartItems(items);
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
            images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"]
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
            images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"]
          }
        }
      ]);
    }
  }, [userId]);

  useEffect(() => {
    loadAddresses();
    loadCartItems();
  }, [loadAddresses, loadCartItems]);

  const createAddress = async () => {
    try {
      const address = await trpc.createAddress.mutate(newAddress);
      setAddresses((prev: Address[]) => [...prev, address]);
      setSelectedAddressId(address.id.toString());
      setIsCreatingNewAddress(false);
      setNewAddress({
        user_id: userId,
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'United States',
        is_default: false
      });
    } catch (error) {
      console.error('Failed to create address:', error);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddressId || cartItems.length === 0) return;
    
    setIsProcessing(true);
    try {
      const orderData: CreateOrderInput = {
        user_id: userId,
        shipping_address_id: parseInt(selectedAddressId),
        items: cartItems.map((item: CartItemWithProduct) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product?.price || 0
        }))
      };
      
      await trpc.createOrder.mutate(orderData);
      await trpc.clearCart.mutate({ userId });
      onOrderComplete();
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total: number, item: CartItemWithProduct) =>
      total + ((item.product?.price || 0) * item.quantity), 0
    );
  };

  const getShippingCost = () => {
    return getTotalPrice() >= 50 ? 0 : 9.99;
  };

  const getTax = () => {
    return getTotalPrice() * 0.08;
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getShippingCost() + getTax();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">🚀 Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>📍 Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCreatingNewAddress ? (
                <>
                  {addresses.length > 0 ? (
                    <div className="space-y-3">
                      <Label>Select Address:</Label>
                      <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an address" />
                        </SelectTrigger>
                        <SelectContent>
                          {addresses.map((address: Address) => (
                            <SelectItem key={address.id} value={address.id.toString()}>
                              {address.street}, {address.city}, {address.state} {address.zip_code}
                              {address.is_default && ' (Default)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <p className="text-gray-600">No saved addresses found.</p>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingNewAddress(true)}
                    className="w-full"
                  >
                    ➕ Add New Address
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={newAddress.street}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewAddress((prev: CreateAddressInput) => ({ ...prev, street: e.target.value }))
                        }
                        placeholder="123 Main St"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={newAddress.city}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewAddress((prev: CreateAddressInput) => ({ ...prev, city: e.target.value }))
                        }
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={newAddress.state}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewAddress((prev: CreateAddressInput) => ({ ...prev, state: e.target.value }))
                        }
                        placeholder="NY"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        value={newAddress.zip_code}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewAddress((prev: CreateAddressInput) => ({ ...prev, zip_code: e.target.value }))
                        }
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_default"
                      checked={newAddress.is_default}
                      onCheckedChange={(checked: boolean) =>
                        setNewAddress((prev: CreateAddressInput) => ({ ...prev, is_default: checked }))
                      }
                    />
                    <Label htmlFor="is_default">Set as default address</Label>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={createAddress} className="flex-1">
                      Save Address
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingNewAddress(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>💳 Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  🔒 This is a demo application. No actual payment will be processed.
                  Your order will be created for demonstration purposes only.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>📋 Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cartItems.map((item: CartItemWithProduct) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name || 'Unknown Product'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ${(item.product?.price || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span className={getShippingCost() === 0 ? 'text-green-600' : ''}>
                    {getShippingCost() === 0 ? 'FREE' : `$${getShippingCost().toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${getTax().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-purple-600">
                      ${getFinalTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={placeOrder}
                disabled={!selectedAddressId || cartItems.length === 0 || isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? 'Processing...' : `🎉 Place Order - $${getFinalTotal().toFixed(2)}`}
              </Button>
              
              <div className="text-center text-xs text-gray-500">
                By placing your order, you agree to our Terms of Service
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
