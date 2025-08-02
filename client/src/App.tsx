
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import type { User } from '../../server/src/schema';

// Customer Pages
import { Homepage } from './components/Homepage';
import { ProductListing } from './components/ProductListing';
import { ProductDetail } from './components/ProductDetail';
import { ShoppingCart } from './components/ShoppingCart';
import { Checkout } from './components/Checkout';
import { OrderHistory } from './components/OrderHistory';

// Admin Pages
import { AdminDashboard } from './components/AdminDashboard';
import { ProductManagement } from './components/ProductManagement';
import { OrderManagement } from './components/OrderManagement';
import { UserManagement } from './components/UserManagement';

// Auth Components
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';

type Page = 
  | 'home' 
  | 'products' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'orders' 
  | 'admin-dashboard' 
  | 'admin-products' 
  | 'admin-orders' 
  | 'admin-users'
  | 'login'
  | 'register';

interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // Load cart items when user changes
  const loadCartItems = useCallback(async () => {
    if (!currentUser) return;
    try {
      const items = await trpc.getCartItems.query({ userId: currentUser.id });
      setCartCount(items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0));
    } catch (error) {
      console.error('Failed to load cart items:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadCartItems();
    } else {
      setCartCount(0);
    }
  }, [currentUser, loadCartItems]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleViewProduct = (productId: number) => {
    setSelectedProductId(productId);
    setCurrentPage('product-detail');
  };

  const handleAddToCart = async (productId: number, quantity: number) => {
    if (!currentUser) {
      setCurrentPage('login');
      return;
    }
    
    try {
      await trpc.addToCart.mutate({
        user_id: currentUser.id,
        product_id: productId,
        quantity
      });
      await loadCartItems();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 
                className="text-2xl font-bold text-purple-600 cursor-pointer hover:text-purple-700 transition-colors"
                onClick={() => setCurrentPage('home')}
              >
                🛍️ ShopEase
              </h1>
              
              <nav className="hidden md:flex space-x-4">
                <Button
                  variant={currentPage === 'home' ? 'default' : 'ghost'}
                  onClick={() => setCurrentPage('home')}
                  className="text-sm"
                >
                  Home
                </Button>
                <Button
                  variant={currentPage === 'products' ? 'default' : 'ghost'}
                  onClick={() => setCurrentPage('products')}
                  className="text-sm"
                >
                  Products
                </Button>
                {currentUser && (
                  <Button
                    variant={currentPage === 'orders' ? 'default' : 'ghost'}
                    onClick={() => setCurrentPage('orders')}
                    className="text-sm"
                  >
                    My Orders
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    variant={currentPage.startsWith('admin') ? 'default' : 'ghost'}
                    onClick={() => setCurrentPage('admin-dashboard')}
                    className="text-sm"
                  >
                    Admin
                  </Button>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage('cart')}
                  className="relative"
                >
                  🛒 Cart
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              )}
              
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    👋 {currentUser.first_name} {currentUser.last_name}
                  </span>
                  <Button variant="outline" onClick={handleLogout} className="text-sm">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage('login')}
                    className="text-sm"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => setCurrentPage('register')}
                    className="text-sm"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'home' && (
          <Homepage onViewProduct={handleViewProduct} />
        )}
        
        {currentPage === 'products' && (
          <ProductListing onViewProduct={handleViewProduct} />
        )}
        
        {currentPage === 'product-detail' && selectedProductId && (
          <ProductDetail
            productId={selectedProductId}
            onAddToCart={handleAddToCart}
            onBack={() => setCurrentPage('products')}
          />
        )}
        
        {currentPage === 'cart' && currentUser && (
          <ShoppingCart
            userId={currentUser.id}
            onCheckout={() => setCurrentPage('checkout')}
            onUpdateCart={loadCartItems}
          />
        )}
        
        {currentPage === 'checkout' && currentUser && (
          <Checkout
            userId={currentUser.id}
            onOrderComplete={() => setCurrentPage('orders')}
          />
        )}
        
        {currentPage === 'orders' && currentUser && (
          <OrderHistory userId={currentUser.id} />
        )}
        
        {currentPage === 'login' && (
          <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setCurrentPage('register')} />
        )}
        
        {currentPage === 'register' && (
          <RegisterForm onRegister={handleLogin} onSwitchToLogin={() => setCurrentPage('login')} />
        )}

        {/* Admin Pages */}
        {isAdmin && currentPage === 'admin-dashboard' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <Tabs value="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger 
                  value="overview"
                  onClick={() => setCurrentPage('admin-dashboard')}
                >
                  📊 Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="products"
                  onClick={() => setCurrentPage('admin-products')}
                >
                  📦 Products
                </TabsTrigger>
                <TabsTrigger 
                  value="orders"
                  onClick={() => setCurrentPage('admin-orders')}
                >
                  📋 Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="users"
                  onClick={() => setCurrentPage('admin-users')}
                >
                  👥 Users
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <AdminDashboard />
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {isAdmin && currentPage === 'admin-products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <Button onClick={() => setCurrentPage('admin-dashboard')} variant="outline">
                ← Back to Dashboard
              </Button>
            </div>
            <ProductManagement />
          </div>
        )}
        
        {isAdmin && currentPage === 'admin-orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <Button onClick={() => setCurrentPage('admin-dashboard')} variant="outline">
                ← Back to Dashboard
              </Button>
            </div>
            <OrderManagement />
          </div>
        )}
        
        {isAdmin && currentPage === 'admin-users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <Button onClick={() => setCurrentPage('admin-dashboard')} variant="outline">
                ← Back to Dashboard
              </Button>
            </div>
            <UserManagement />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">🛍️ ShopEase</h3>
              <p className="text-gray-400">Your one-stop shop for amazing products!</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Customer Service</h4>
              <p className="text-gray-400 text-sm">Contact Us</p>
              <p className="text-gray-400 text-sm">FAQ</p>
              <p className="text-gray-400 text-sm">Returns</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">About</h4>
              <p className="text-gray-400 text-sm">Our Story</p>
              <p className="text-gray-400 text-sm">Careers</p>
              <p className="text-gray-400 text-sm">Privacy Policy</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Follow Us</h4>
              <p className="text-gray-400 text-sm">📘 Facebook</p>
              <p className="text-gray-400 text-sm">📷 Instagram</p>
              <p className="text-gray-400 text-sm">🐦 Twitter</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ShopEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
